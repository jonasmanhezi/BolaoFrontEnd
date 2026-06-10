const DEFAULT_BACKEND_URL = 'http://localhost:8080';

export function resolveBackendUrl(raw?: string): string {
  const trimmed = (raw ?? '').trim().replace(/^['"]+|['"]+$/g, '');
  const candidate = trimmed || DEFAULT_BACKEND_URL;
  const normalized = candidate.replace(/\/$/, '');

  if (!/^https?:\/\//i.test(normalized)) {
    console.warn(
      `[backend-url] BACKEND_URL inválida (${JSON.stringify(raw)}), usando ${DEFAULT_BACKEND_URL}`
    );
    return DEFAULT_BACKEND_URL;
  }

  return normalized;
}

export function getBackendUrl(): string {
  return resolveBackendUrl(process.env.BACKEND_URL);
}

export function getBackendApiBase(): string {
  if (typeof window !== 'undefined') {
    return '/api/backend/v1';
  }
  return `${getBackendUrl()}/v1`;
}