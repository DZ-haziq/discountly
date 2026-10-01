import { normalizeAndValidateUrl, resolveAndValidateHost } from './ssrf';

const MAX_ROBOTS_SIZE = 64 * 1024; // 64 KB cap
const ROBOTS_TIMEOUT_MS = 3000;    // 3 seconds timeout

export async function isBotAllowedByRobots(
  baseUrl: string,
  userAgent = 'DiscountlyBot'
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const valResult = normalizeAndValidateUrl(baseUrl);
    if (!valResult.ok || !valResult.url) {
      return { allowed: false, reason: 'Invalid base URL for robots.txt' };
    }

    const robotsUrl = `${valResult.url.origin}/robots.txt`;
    const hostCheck = await resolveAndValidateHost(valResult.url.hostname);
    if (!hostCheck.ok) {
      return { allowed: false, reason: `Robots host blocked: ${hostCheck.error}` };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ROBOTS_TIMEOUT_MS);

    try {
      const resp = await fetch(robotsUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': `${userAgent}/1.0 (+https://discountly.com/bot)`,
          'Accept': 'text/plain, */*'
        },
        redirect: 'error' // Do not follow redirects for robots.txt
      });

      clearTimeout(timeoutId);

      if (resp.status === 404 || resp.status === 410) {
        // No robots.txt -> implicitly allowed
        return { allowed: true, reason: 'No robots.txt (404/410)' };
      }

      if (!resp.ok) {
        // 5xx errors or other client errors -> default to safe allowed unless 401/403
        if (resp.status === 401 || resp.status === 403) {
          return { allowed: false, reason: `Robots.txt access forbidden (${resp.status})` };
        }
        return { allowed: true, reason: `Robots.txt returned status ${resp.status}` };
      }

      const text = await resp.text();
      const cappedText = text.slice(0, MAX_ROBOTS_SIZE);

      return parseRobotsTxt(cappedText, userAgent);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const message = err instanceof Error ? err.message : String(err);
      return { allowed: true, reason: `Robots.txt check skipped on network error: ${message}` };
    }
  } catch {
    return { allowed: true, reason: 'Robots check failed to execute' };
  }
}

/**
 * Basic robots.txt parser checking User-agent wildcard (*) and target bot for root/general access
 */
function parseRobotsTxt(content: string, botName: string): { allowed: boolean; reason?: string } {
  const lines = content.split(/\r?\n/);
  let currentUserAgentMatches = false;
  let hasWildcardDisallowRoot = false;
  let hasBotDisallowRoot = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const [directive, ...valParts] = line.split(':');
    if (!directive || valParts.length === 0) continue;

    const key = directive.trim().toLowerCase();
    const value = valParts.join(':').trim();

    if (key === 'user-agent') {
      const ua = value.toLowerCase();
      if (ua === '*' || ua === botName.toLowerCase()) {
        currentUserAgentMatches = true;
      } else {
        currentUserAgentMatches = false;
      }
    } else if (key === 'disallow' && currentUserAgentMatches) {
      if (value === '/' || value === '/*') {
        if (currentUserAgentMatches) {
          hasBotDisallowRoot = true;
        }
      }
    }
  }

  if (hasBotDisallowRoot) {
    return { allowed: false, reason: 'Disallowed by robots.txt rule' };
  }

  return { allowed: true };
}
