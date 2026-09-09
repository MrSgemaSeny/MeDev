/**
 * Processor logic for MeDev backend Artillery Load & Smoke tests.
 * 
 * Архитектурные задачи скрипта:
 * 1. Защита от DoS на эндпоинты авторизации:
 *    Spring Boot использует Bucket4j AuthRateLimiter (10 req / 15 min per IP).
 *    Повторные вызовы /v1/auth/login приводят к блокировке с кодом 429.
 *    Кэширование токенов в памяти (in-memory token pool) гарантирует, что каждый
 *    виртуальный пользователь использует уже полученный валидный JWT.
 * 
 * 2. Двойная передача контекста аутентификации:
 *    MeDev поддерживает как заголовок Authorization: Bearer <token>,
 *    так и HttpOnly Cookie (accessToken), а также CSRF Origin валидацию.
 * 
 * 3. Надежная экстракция ID:
 *    Поддержка как плоского JSON { id: 1 }, так и вложенных структур { data: { id: 1 } }.
 */

const BASE_URL = process.env.TARGET_URL || 'https://medev-backend.onrender.com/api';

// Кэш токенов уровня процесса раннера для исключения паразитной нагрузки на /auth/login
const tokenCache = {
  admin: null,
  user: null
};

/**
 * Инициализирует и возвращает валидные токены администратора и пользователя.
 */
async function getTokens() {
  // 1. Предзагрузка токена администратора
  if (!tokenCache.admin) {
    const adminEmail = process.env.MEDEV_ADMIN_EMAIL || 'admin@medev.internal';
    const adminPassword = process.env.MEDEV_ADMIN_PASSWORD || 'AdminPass123!';

    try {
      const res = await fetch(`${BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });

      if (res.ok) {
        const body = await res.json();
        // В AuthResponse токен находится в поле accessToken (без обертки data)
        tokenCache.admin = body?.accessToken || body?.data?.accessToken || null;
      } else {
        console.warn(`[processor.js] Admin login returned status ${res.status}. Falling back to dynamic flows.`);
      }
    } catch (err) {
      console.warn(`[processor.js] Failed to fetch admin token: ${err.message}`);
    }
  }

  // 2. Предзагрузка токена штатного пользователя (если заданы переменные окружения)
  if (!tokenCache.user && process.env.MEDEV_USER_EMAIL && process.env.MEDEV_USER_PASSWORD) {
    try {
      const res = await fetch(`${BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          email: process.env.MEDEV_USER_EMAIL,
          password: process.env.MEDEV_USER_PASSWORD
        })
      });

      if (res.ok) {
        const body = await res.json();
        tokenCache.user = body?.accessToken || body?.data?.accessToken || null;
      }
    } catch (err) {
      console.warn(`[processor.js] Failed to fetch user token: ${err.message}`);
    }
  }

  return tokenCache;
}

module.exports = {
  /**
   * Hook: beforeScenario для сценария администратора.
   * Наполняет контекст виртуального пользователя токеном ADMIN.
   */
  setAdminAuth: function (context, ee, next) {
    const callback = typeof next === 'function' ? next : (typeof ee === 'function' ? ee : null);
    getTokens().then(tokens => {
      context.vars = context.vars || {};
      if (tokens.admin) {
        context.vars.adminToken = tokens.admin;
        context.vars.authToken = tokens.admin;
      }
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
    });
  },

  /**
   * Hook: beforeScenario для пользовательских сценариев.
   * Если пользовательский токен уже есть в пуле — инжектирует его, избавляя от повторной регистрации.
   */
  setUserAuth: function (context, ee, next) {
    const callback = typeof next === 'function' ? next : (typeof ee === 'function' ? ee : null);
    getTokens().then(tokens => {
      context.vars = context.vars || {};
      if (tokens.user) {
        context.vars.userToken = tokens.user;
        context.vars.authToken = tokens.user;
      }
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
    });
  },

  /**
   * Hook: beforeRequest.
   * Добавляет заголовок Authorization и Cookie accessToken в каждый исходящий запрос.
   */
  attachAuthHeader: function (requestParams, context, ee, next) {
    const token = context.vars?.authToken;
    if (token) {
      requestParams.headers = requestParams.headers || {};
      requestParams.headers['Authorization'] = `Bearer ${token}`;
      requestParams.headers['Cookie'] = `accessToken=${token}; refresh_token=${token}`;
    }
    return next();
  },

  /**
   * Генератор уникальных учетных данных для динамической регистрации.
   * Соответствует валидаторам MeDev:
   * - username: ^[a-zA-Z0-9_.-]{3,50}$
   * - password: длина >= 8 символов
   */
  generateUserData: function (contextOrParams, eeOrContext, nextOrEe, maybeNext) {
    const next = typeof maybeNext === 'function' ? maybeNext : nextOrEe;
    const context = (maybeNext ? eeOrContext : contextOrParams) || {};
    context.vars = context.vars || {};

    const rand = Math.floor(Math.random() * 900000) + 100000;
    context.vars.dynamicRand = rand;
    context.vars.dynamicUserEmail = `artillery.user.${rand}@testmail.com`;
    context.vars.dynamicUsername = `art_usr_${rand}`;
    context.vars.dynamicUserPassword = `TestPass123!_${rand}`;

    if (typeof next === 'function') return next();
  },

  /**
   * Hook: afterResponse для POST /v1/tracker/applications.
   * Захватывает ID созданного отклика для последующего обновления и удаления (DELETE).
   */
  extractApplicationId: function (requestParams, response, context, ee, next) {
    try {
      const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
      // Поддержка плоского формата DTO и вложенного data
      const id = body?.id || body?.data?.id;
      if (id) {
        context.vars.currentAppId = id;
      }
    } catch (e) {
      console.warn('[processor.js] Could not parse application response body:', e.message);
    }
    return next();
  },

  /**
   * Hook: afterResponse для POST /v1/profile/skills.
   * Захватывает ID созданного навыка для последующего удаления (DELETE).
   */
  extractSkillId: function (requestParams, response, context, ee, next) {
    try {
      const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
      const id = body?.id || body?.data?.id;
      if (id) {
        context.vars.createdSkillId = id;
      }
    } catch (e) {
      console.warn('[processor.js] Could not parse skill response body:', e.message);
    }
    return next();
  }
};
