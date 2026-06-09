function normalizeBackendUrl(url: string): string {
  return url.replace(/\/$/, '');
}

export function getBackendUrl(): string {
  return normalizeBackendUrl(process.env.BACKEND_URL ?? 'http://localhost:8080');
}

export function getBackendApiBase(): string {
  if (typeof window !== 'undefined') {
    return '/api/backend/v1';
  }
  return `${getBackendUrl()}/v1`;
}