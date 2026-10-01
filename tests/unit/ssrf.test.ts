import { describe, it, expect } from 'vitest';
import { isPrivateIPv4, isPrivateIPv6, isPrivateIp, normalizeAndValidateUrl } from '../../lib/security/ssrf';

describe('SSRF Protection - IP Range Filtering', () => {
  it('blocks private and loopback IPv4 addresses', () => {
    expect(isPrivateIPv4('127.0.0.1')).toBe(true);
    expect(isPrivateIPv4('10.0.0.5')).toBe(true);
    expect(isPrivateIPv4('192.168.1.1')).toBe(true);
    expect(isPrivateIPv4('172.16.0.1')).toBe(true);
    expect(isPrivateIPv4('172.31.255.255')).toBe(true);
    expect(isPrivateIPv4('169.254.169.254')).toBe(true); // AWS/GCP metadata
    expect(isPrivateIPv4('0.0.0.0')).toBe(true);
    expect(isPrivateIPv4('224.0.0.1')).toBe(true); // Multicast
    expect(isPrivateIPv4('240.0.0.1')).toBe(true); // Reserved
  });

  it('allows public IPv4 addresses', () => {
    expect(isPrivateIPv4('8.8.8.8')).toBe(false);
    expect(isPrivateIPv4('1.1.1.1')).toBe(false);
    expect(isPrivateIPv4('104.26.10.228')).toBe(false);
    expect(isPrivateIPv4('142.250.190.46')).toBe(false);
  });

  it('blocks private and loopback IPv6 addresses', () => {
    expect(isPrivateIPv6('::1')).toBe(true);
    expect(isPrivateIPv6('0:0:0:0:0:0:0:1')).toBe(true);
    expect(isPrivateIPv6('fe80::1')).toBe(true); // Link-local
    expect(isPrivateIPv6('fc00::1')).toBe(true); // Unique local
    expect(isPrivateIPv6('::ffff:127.0.0.1')).toBe(true); // IPv4-mapped loopback
    expect(isPrivateIPv6('::ffff:10.0.0.1')).toBe(true); // IPv4-mapped private
  });

  it('allows public IPv6 addresses', () => {
    expect(isPrivateIPv6('2606:4700:4700::1111')).toBe(false);
    expect(isPrivateIPv6('2001:4860:4860::8888')).toBe(false);
  });
});

describe('SSRF Protection - URL Normalization & Scheme Validation', () => {
  it('requires HTTPS scheme and rejects HTTP/FTP/file', () => {
    expect(normalizeAndValidateUrl('http://example.com').ok).toBe(false);
    expect(normalizeAndValidateUrl('ftp://example.com').ok).toBe(false);
    expect(normalizeAndValidateUrl('file:///etc/passwd').ok).toBe(false);
    expect(normalizeAndValidateUrl('https://example.com').ok).toBe(true);
  });

  it('rejects URLs containing embedded credentials', () => {
    const res = normalizeAndValidateUrl('https://user:pass@example.com');
    expect(res.ok).toBe(false);
    expect(res.error).toContain('Credentials in URL are forbidden');
  });

  it('blocks internal hostnames and cloud metadata endpoints', () => {
    expect(normalizeAndValidateUrl('https://localhost/path').ok).toBe(false);
    expect(normalizeAndValidateUrl('https://metadata.google.internal/computeMetadata/v1/').ok).toBe(false);
    expect(normalizeAndValidateUrl('https://server.local').ok).toBe(false);
    expect(normalizeAndValidateUrl('https://internal-db.internal').ok).toBe(false);
  });

  it('strips tracking parameters and fragments from canonical URLs', () => {
    const res = normalizeAndValidateUrl('https://example.com/store?utm_source=google&gclid=123#reviews');
    expect(res.ok).toBe(true);
    expect(res.url?.toString()).toBe('https://example.com/store');
  });
});
