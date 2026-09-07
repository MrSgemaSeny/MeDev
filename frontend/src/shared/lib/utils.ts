export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Sanitizes a URL to prevent XSS via javascript:, data:, or vbscript: pseudo-protocols.
 * Only allows http:, https:, and mailto: protocols.
 * Returns '#' if the URL is invalid or unsafe.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (!trimmed) return '#';

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '#';
  }

  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('/') ||
    lower.startsWith('#')
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
