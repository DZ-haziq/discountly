import dns from 'node:dns/promises';
import net from 'node:net';

// Blocked hostnames
const BLOCKED_HOSTNAMES = [
  'localhost',
  'metadata.google.internal',
  'instance-data',
  'local'
];

/**
 * Checks if an IPv4 address is in a private, reserved, loopback, link-local, or multicast range
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return true; // Invalid format treated as unsafe
  }

  const [a, b, c, d] = parts;

  // 0.0.0.0/8
  if (a === 0) return true;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 100.64.0.0/10 (100.64.0.0 - 100.127.255.255)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (Link-local, includes 169.254.169.254 cloud metadata)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.0.0.0/24
  if (a === 192 && b === 0 && c === 0) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // 198.18.0.0/15 (198.18.0.0 - 198.19.255.255)
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 224.0.0.0/4 (Multicast: 224-239)
  if (a >= 224 && a <= 239) return true;
  // 240.0.0.0/4 (Reserved: 240-255, including 255.255.255.255)
  if (a >= 240) return true;

  return false;
}

/**
 * Checks if an IPv6 address is private, loopback, link-local, unique local, or mapped IPv4
 */
export function isPrivateIPv6(ip: string): boolean {
  const cleanIp = ip.toLowerCase().trim();

  // Loopback ::1
  if (cleanIp === '::1' || cleanIp === '0:0:0:0:0:0:0:1') return true;
  // Unspecified ::
  if (cleanIp === '::' || cleanIp === '0:0:0:0:0:0:0:0') return true;

  // IPv4-mapped IPv6 ::ffff:192.0.2.128 or ::ffff:c000:0280
  if (cleanIp.startsWith('::ffff:')) {
    const ipv4Part = cleanIp.slice(7);
    if (net.isIPv4(ipv4Part)) {
      return isPrivateIPv4(ipv4Part);
    }
  }

  // Unique local addresses (fc00::/7 -> fc00:: to fdff::)
  if (cleanIp.startsWith('fc') || cleanIp.startsWith('fd')) return true;

  // Link-local addresses (fe80::/10 -> fe80:: to febf::)
  if (cleanIp.startsWith('fe8') || cleanIp.startsWith('fe9') || cleanIp.startsWith('fea') || cleanIp.startsWith('feb')) {
    return true;
  }

  return false;
}

/**
 * Validates a single IP address against all private/reserved ranges
 */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    return isPrivateIPv4(ip);
  }
  if (net.isIPv6(ip)) {
    return isPrivateIPv6(ip);
  }
  return true; // Unknown format blocked
}

/**
 * Normalizes and validates a URL for SSRF protection
 */
export function normalizeAndValidateUrl(rawUrl: string): { ok: boolean; url?: URL; error?: string } {
  try {
    const parsed = new URL(rawUrl.trim());

    // Scheme check: https only
    if (parsed.protocol !== 'https:') {
      return { ok: false, error: 'Only HTTPS URLs are permitted.' };
    }

    // No credentials allowed in URL
    if (parsed.username || parsed.password) {
      return { ok: false, error: 'Credentials in URL are forbidden.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check blocked hostnames and local domains
    if (
      BLOCKED_HOSTNAMES.includes(hostname) ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.localhost')
    ) {
      return { ok: false, error: 'Access to internal/local hostnames is blocked.' };
    }

    // Direct IP address in URL check
    if (net.isIP(hostname)) {
      if (isPrivateIp(hostname)) {
        return { ok: false, error: 'Direct access to private or reserved IP addresses is forbidden.' };
      }
    }

    // Strip fragment
    parsed.hash = '';

    // Strip tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'gclid', 'fbclid', 'msclkid', 'twclid', 'mc_cid', 'mc_eid'
    ];
    for (const p of trackingParams) {
      parsed.searchParams.delete(p);
    }

    return { ok: true, url: parsed };
  } catch {
    return { ok: false, error: 'Invalid URL format.' };
  }
}

/**
 * Resolves all DNS records (A and AAAA) for a hostname and verifies none are private
 */
export async function resolveAndValidateHost(hostname: string): Promise<{ ok: boolean; resolvedIps: string[]; error?: string }> {
  try {
    // If hostname is already an IP
    if (net.isIP(hostname)) {
      if (isPrivateIp(hostname)) {
        return { ok: false, resolvedIps: [hostname], error: 'Private IP blocked.' };
      }
      return { ok: true, resolvedIps: [hostname] };
    }

    const addresses: string[] = [];

    // Resolve IPv4
    try {
      const ipv4s = await dns.resolve4(hostname);
      addresses.push(...ipv4s);
    } catch {
      // IPv4 lookup might fail if host only has IPv6
    }

    // Resolve IPv6
    try {
      const ipv6s = await dns.resolve6(hostname);
      addresses.push(...ipv6s);
    } catch {
      // IPv6 lookup might fail if host only has IPv4
    }

    if (addresses.length === 0) {
      return { ok: false, resolvedIps: [], error: `Could not resolve DNS records for ${hostname}.` };
    }

    // Check each resolved IP
    for (const ip of addresses) {
      if (isPrivateIp(ip)) {
        return {
          ok: false,
          resolvedIps: addresses,
          error: `DNS resolution for ${hostname} pointed to private/reserved IP: ${ip}. Blocked for security.`
        };
      }
    }

    return { ok: true, resolvedIps: addresses };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, resolvedIps: [], error: `DNS resolution error: ${message}` };
  }
}
