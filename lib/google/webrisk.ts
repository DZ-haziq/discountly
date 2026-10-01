/**
 * Checks a URI against Google Web Risk API for MALWARE, SOCIAL_ENGINEERING, UNWANTED_SOFTWARE.
 * Falls back safely to true (clean) if API key is not configured in local/dev environments.
 */
export async function checkWebRiskSafety(targetUri: string): Promise<{ ok: boolean; threats?: string[] }> {
  const apiKey = process.env.GOOGLE_WEBRISK_API_KEY;
  if (!apiKey) {
    // Graceful fallback for development without API key
    return { ok: true };
  }

  try {
    const url = new URL('https://webrisk.googleapis.com/v1/uris:search');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('uri', targetUri);
    url.searchParams.append('threatTypes', 'MALWARE');
    url.searchParams.append('threatTypes', 'SOCIAL_ENGINEERING');
    url.searchParams.append('threatTypes', 'UNWANTED_SOFTWARE');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return { ok: true }; // Don't block admin work if API is unreachable
    }

    const data = await res.json();
    if (data.threat && data.threat.threatTypes && data.threat.threatTypes.length > 0) {
      return {
        ok: false,
        threats: data.threat.threatTypes
      };
    }

    return { ok: true };
  } catch {
    return { ok: true };
  }
}
