import { normalizeAndValidateUrl, resolveAndValidateHost } from './ssrf';
import { isBotAllowedByRobots } from './robots';

const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2 MB cap
const FETCH_TIMEOUT_MS = 8000;              // 8s timeout
const MAX_REDIRECTS = 3;

export interface SafeFetchResult {
  ok: boolean;
  html?: string;
  finalUrl?: string;
  statusCode?: number;
  error?: string;
  robotsAllowed?: boolean;
}

/**
 * Safely fetches a public webpage while mitigating SSRF, DNS rebinding, and redirect loops.
 */
export async function safeFetchHtml(
  initialUrl: string,
  userAgent = 'DiscountlyBot/1.0 (+https://discountly.com/bot)'
): Promise<SafeFetchResult> {
  let currentUrl = initialUrl;
  let redirectCount = 0;

  while (redirectCount <= MAX_REDIRECTS) {
    // 1. URL format & scheme validation
    const valResult = normalizeAndValidateUrl(currentUrl);
    if (!valResult.ok || !valResult.url) {
      return {
        ok: false,
        error: `URL validation failed: ${valResult.error}`
      };
    }

    const targetUrl = valResult.url;
    const hostname = targetUrl.hostname;

    // 2. DNS Resolution & Private IP check
    const dnsCheck = await resolveAndValidateHost(hostname);
    if (!dnsCheck.ok) {
      return {
        ok: false,
        error: `Host security check failed for ${hostname}: ${dnsCheck.error}`
      };
    }

    // 3. Robots.txt check on origin
    const robotsCheck = await isBotAllowedByRobots(targetUrl.origin);
    if (!robotsCheck.allowed) {
      return {
        ok: false,
        robotsAllowed: false,
        error: `Crawling disallowed by ${hostname}/robots.txt (${robotsCheck.reason})`
      };
    }

    // 4. Fetch with AbortController timeout & manual redirect handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(targetUrl.toString(), {
        method: 'GET',
        signal: controller.signal,
        redirect: 'manual', // We handle redirects manually to re-validate each hop
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
          'Accept-Language': 'en-US,en;q=0.8',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Dest': 'document'
        }
      });

      clearTimeout(timeoutId);

      // Handle Redirects (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        redirectCount++;
        if (redirectCount > MAX_REDIRECTS) {
          return {
            ok: false,
            error: `Exceeded maximum redirect limit (${MAX_REDIRECTS}).`
          };
        }

        const locationHeader = response.headers.get('location');
        if (!locationHeader) {
          return {
            ok: false,
            error: 'Redirect status received without Location header.'
          };
        }

        // Resolve relative redirects against current URL
        try {
          const nextUrl = new URL(locationHeader, targetUrl.toString()).toString();
          currentUrl = nextUrl;
          continue; // Loop next hop with full validation
        } catch {
          return {
            ok: false,
            error: `Invalid redirect location: ${locationHeader}`
          };
        }
      }

      if (!response.ok) {
        return {
          ok: false,
          statusCode: response.status,
          error: `HTTP request failed with status: ${response.status} ${response.statusText}`
        };
      }

      // Check Content-Type header
      const contentType = response.headers.get('content-type') || '';
      const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml+xml');
      if (!isHtml) {
        return {
          ok: false,
          statusCode: response.status,
          error: `Unsupported Content-Type: ${contentType}. Expected text/html.`
        };
      }

      // Read response body with size limit (2 MB)
      const reader = response.body?.getReader();
      if (!reader) {
        const text = await response.text();
        return {
          ok: true,
          html: text.slice(0, MAX_RESPONSE_SIZE),
          finalUrl: targetUrl.toString(),
          statusCode: response.status,
          robotsAllowed: true
        };
      }

      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_RESPONSE_SIZE) {
            reader.cancel();
            break;
          }
          chunks.push(value);
        }
      }

      const allData = new Uint8Array(Math.min(totalBytes, MAX_RESPONSE_SIZE));
      let offset = 0;
      for (const chunk of chunks) {
        const copyLength = Math.min(chunk.length, MAX_RESPONSE_SIZE - offset);
        allData.set(chunk.subarray(0, copyLength), offset);
        offset += copyLength;
        if (offset >= MAX_RESPONSE_SIZE) break;
      }

      const decoder = new TextDecoder('utf-8', { fatal: false, ignoreBOM: true });
      const htmlText = decoder.decode(allData);

      return {
        ok: true,
        html: htmlText,
        finalUrl: targetUrl.toString(),
        statusCode: response.status,
        robotsAllowed: true
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = (err as Error)?.name === 'AbortError';
      return {
        ok: false,
        error: isAbort
          ? `Request timed out after ${FETCH_TIMEOUT_MS}ms.`
          : `Fetch failed: ${(err as Error)?.message || String(err)}`
      };
    }
  }

  return { ok: false, error: 'Redirect loop or limit exceeded.' };
}
