const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
]);

function isIPv4PrivateOrReserved(ip: string): boolean {
  const parts = ip.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)
  ) {
    return true;
  }

  const [a, b] = parts;

  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a >= 224) return true;

  return false;
}

function isIPv6PrivateOrReserved(ip: string): boolean {
  const normalized = ip.toLowerCase();

  if (normalized === "::" || normalized === "::1") {
    return true;
  }

  if (normalized.startsWith("fe80:")) {
    return true;
  }

  if (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  ) {
    return true;
  }

  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalized);

  if (mapped?.[1]) {
    return isIPv4PrivateOrReserved(mapped[1]);
  }

  return false;
}

function isPrivateOrReservedIp(ip: string): boolean {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    return isIPv4PrivateOrReserved(ip);
  }

  if (ip.includes(":")) {
    return isIPv6PrivateOrReserved(ip);
  }

  return true;
}

export function validateOutboundUrl(
  rawUrl: string,
  options?: {
    allowPrivateNetworks?: boolean;
  },
): {
  allowed: boolean;
  reason?: string;
} {
  const allowPrivateNetworks =
    options?.allowPrivateNetworks === true;

  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return {
      allowed: false,
      reason: "Please enter a valid HTTP or HTTPS URL.",
    };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      allowed: false,
      reason: "Only HTTP and HTTPS URLs are supported.",
    };
  }

  if (url.username || url.password) {
    return {
      allowed: false,
      reason: "URLs containing embedded credentials are not allowed.",
    };
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    if (allowPrivateNetworks) {
      return {
        allowed: true,
      };
    }

    return {
      allowed: false,
      reason: "Requests to local or internal hosts are not allowed.",
    };
  }

  if (isPrivateOrReservedIp(hostname)) {
    if (allowPrivateNetworks) {
      return {
        allowed: true,
      };
    }

    return {
      allowed: false,
      reason:
        "Requests to private or reserved network addresses are not allowed.",
    };
  }

  return {
    allowed: true,
  };
}