import { CONFIG } from '../config.js';

export class ApiClient {
  constructor(baseUrl = CONFIG.BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = null;
    this.cookies = new Map();
    this.metrics = [];
  }

  setToken(token) {
    this.token = token;
  }

  setCookie(key, value) {
    this.cookies.set(key, value);
  }

  getCookie(key) {
    return this.cookies.get(key);
  }

  clearAuth() {
    this.token = null;
    this.cookies.clear();
  }

  _parseSetCookie(setCookieHeader) {
    if (!setCookieHeader) return;
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const cookieStr of cookies) {
      const parts = cookieStr.split(';')[0].trim().split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        this.cookies.set(key, value);
      }
    }
  }

  _buildCookieHeader() {
    if (this.cookies.size === 0) return '';
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  async request(method, path, options = {}) {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const maxRetries = options.retries !== undefined ? options.retries : CONFIG.MAX_RETRIES;
    const timeoutMs = options.timeoutMs || CONFIG.TIMEOUT_MS;

    const headers = {
      'Accept': options.accept || 'application/json, text/plain, */*',
      ...(options.headers || {})
    };

    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const cookieHeader = this._buildCookieHeader();
    if (cookieHeader && !headers['Cookie']) {
      headers['Cookie'] = cookieHeader;
    }

    let body = options.body;
    if (body !== undefined && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Uint8Array)) {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      body = JSON.stringify(body);
    }

    let attempt = 0;
    let lastError = null;

    while (attempt <= maxRetries) {
      attempt++;
      const startTime = performance.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: controller.signal
        });
        clearTimeout(timer);
        const latencyMs = Math.round(performance.now() - startTime);

        // Извлекаем Set-Cookie
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          this._parseSetCookie(setCookie);
        }

        // Retry только для 502/503/504 (холодный старт / шлюз)
        if ([502, 503, 504].includes(response.status) && attempt <= maxRetries) {
          await new Promise(r => setTimeout(r, 1500 * attempt));
          continue;
        }

        let data = null;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch {
            data = null;
          }
        } else if (contentType.includes('text/') || contentType.includes('application/')) {
          data = await response.text();
        }

        const result = {
          status: response.status,
          headers: response.headers,
          data,
          latencyMs,
          ok: response.ok
        };

        this.recordMetric({
          method,
          path,
          status: response.status,
          latencyMs,
          expected: options.expectedStatus,
          pass: options.expectedStatus ? response.status === options.expectedStatus : response.ok
        });

        return result;
      } catch (err) {
        clearTimeout(timer);
        lastError = err;
        if (attempt <= maxRetries) {
          await new Promise(r => setTimeout(r, 1500 * attempt));
        }
      }
    }

    throw new Error(`[ApiClient] Request ${method} ${path} failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
  }

  async get(path, options = {}) {
    return this.request('GET', path, options);
  }

  async post(path, body, options = {}) {
    return this.request('POST', path, { ...options, body });
  }

  async put(path, body, options = {}) {
    return this.request('PUT', path, { ...options, body });
  }

  async delete(path, options = {}) {
    return this.request('DELETE', path, options);
  }

  async streamSse(path, body, options = {}) {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const startTime = performance.now();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      ...(options.headers || {})
    };

    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || CONFIG.TIMEOUT_MS;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        clearTimeout(timer);
        this.recordMetric({
          method: 'POST [SSE]',
          path,
          status: response.status,
          latencyMs,
          pass: false
        });
        return { status: response.status, ok: false, chunks: [] };
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const chunks = [];
      let totalLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        chunks.push(text);
        totalLength += text.length;
        if (options.maxChunks && chunks.length >= options.maxChunks) {
          reader.cancel();
          break;
        }
      }
      clearTimeout(timer);

      this.recordMetric({
        method: 'POST [SSE]',
        path,
        status: response.status,
        latencyMs,
        pass: chunks.length > 0
      });

      return {
        status: response.status,
        ok: true,
        chunks,
        rawText: chunks.join('')
      };
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  recordMetric(metric) {
    this.metrics.push(metric);
  }

  getMetrics() {
    return this.metrics;
  }
}
