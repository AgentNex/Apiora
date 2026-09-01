export interface SSRFValidationResult {
  valid: boolean;
  reason?: string;
  sanitizedUrl?: string;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data'
]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  const [a, b] = parts;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 0.0.0.0/8 (Broadcast/this host)
  if (a === 0) return true;
  // 10.0.0.0/8 (Private RFC1918)
  if (a === 10) return true;
  // 172.16.0.0/12 (Private RFC1918)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (Private RFC1918)
  if (a === 192 && b === 168) return true;
  // 169.254.0.0/16 (Link-Local & Cloud Metadata)
  if (a === 169 && b === 254) return true;
  // 100.64.0.0/10 (Carrier-Grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const clean = ip.replace(/^\[|\]$/g, '').toLowerCase();
  if (clean === '::1' || clean === '::' || clean === '0:0:0:0:0:0:0:1') return true;
  // Unique local fc00::/7
  if (clean.startsWith('fc') || clean.startsWith('fd')) return true;
  // Link local fe80::/10
  if (clean.startsWith('fe8') || clean.startsWith('fe9') || clean.startsWith('fea') || clean.startsWith('feb')) return true;
  // IPv4 mapped IPv6 (::ffff:127.0.0.1, etc.)
  if (clean.startsWith('::ffff:')) {
    const ipv4 = clean.replace('::ffff:', '');
    return isPrivateIPv4(ipv4);
  }
  return false;
}

export function validateTargetUrl(rawUrl: string): SSRFValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, reason: 'Endpoint URL is required' };
  }

  const trimmed = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: 'Invalid URL format. Please provide a full URL with scheme (e.g., https://api.openai.com/v1/chat/completions).' };
  }

  // Scheme validation: strictly http or https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      reason: `Unsupported URL protocol: "${parsed.protocol}". Only HTTP and HTTPS are permitted.`
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Explicit blocked list
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      valid: false,
      reason: `Access to local/metadata host "${hostname}" is blocked for security (SSRF protection).`
    };
  }

  // Check ending with .local or .internal or .localhost
  if (hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return {
      valid: false,
      reason: `Access to internal domain "${hostname}" is forbidden.`
    };
  }

  // Check IPv4
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return {
        valid: false,
        reason: `Target IP address "${hostname}" belongs to a private/reserved network range.`
      };
    }
  }

  // Check IPv6
  if (hostname.includes(':')) {
    if (isPrivateIPv6(hostname)) {
      return {
        valid: false,
        reason: `Target IPv6 address "${hostname}" is private or loopback.`
      };
    }
  }

  return {
    valid: true,
    sanitizedUrl: parsed.toString()
  };
}
