export function isTokenExpired(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return !Number.isFinite(payload.exp) || Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function getRequestAccessToken(input, init, origin) {
  const url = new URL(input instanceof Request ? input.url : input, origin);
  if (url.origin !== origin || !url.pathname.startsWith('/api/')) return null;
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  return headers.get('Authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1] ?? null;
}
