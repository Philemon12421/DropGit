import { URL } from 'url';
import net from 'net';

/**
 * Checks if an IP is in a private, loopback, or link-local range.
 */
export function isPrivateIP(ip: string): boolean {
  if (ip === 'localhost' || ip === '::1' || ip === '0.0.0.0') return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;

    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local / Cloud metadata service)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8 (Current network)
    if (parts[0] === 0) return true;

    return false;
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    // fc00::/7 (Unique local address)
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    // fe80::/10 (Link-local)
    if (lower.startsWith('fe80:')) return true;
    return false;
  }

  return false;
}

/**
 * Validates a target URL against SSRF attacks and checks scheme.
 */
export function validateUrl(rawUrl: string): { valid: boolean; error?: string; url?: URL } {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      return { valid: false, error: 'URL cannot be empty' };
    }

    const parsed = new URL(trimmed);

    // Only allow http: and https:
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are supported' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block local domain keywords
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
    ) {
      return { valid: false, error: 'Access to localhost and internal network addresses is blocked' };
    }

    // Direct IP check
    if (net.isIP(hostname) && isPrivateIP(hostname)) {
      return { valid: false, error: 'Access to private or link-local IP addresses is blocked' };
    }

    // Block common cloud metadata IPs
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { valid: false, error: 'Access to cloud metadata endpoints is prohibited' };
    }

    return { valid: true, url: parsed };
  } catch (err: any) {
    return { valid: false, error: 'Invalid URL format' };
  }
}
