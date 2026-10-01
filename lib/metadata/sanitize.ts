/**
 * Sanitizes extracted strings: strips HTML tags, control chars, normalizes whitespace, caps length
 */
export function sanitizeString(input?: string | null, maxLength = 500): string {
  if (!input) return '';

  return input
    // Strip HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Remove control characters (except standard spaces/newlines)
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace multiple whitespaces/newlines with single space
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates an image URL: must be HTTPS, valid domain format, no data URI
 */
export function isValidHttpsImageUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const path = parsed.pathname.toLowerCase();
    const commonExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.avif'];
    // Allow if it has an image extension or query string / dynamic image endpoint
    return commonExtensions.some(ext => path.endsWith(ext)) || parsed.search.length > 0 || path.length > 3;
  } catch {
    return false;
  }
}
