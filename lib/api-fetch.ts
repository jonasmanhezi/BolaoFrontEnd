import { handleUnauthorizedStatus, isSessionExpired } from '@/lib/auth-session';

export class SessionExpiredError extends Error {
  constructor() {
    super('Sessão expirada. Faça login novamente.');
    this.name = 'SessionExpiredError';
  }
}

export type ApiFetchOptions = {
  /**
   * redirect: toast + login (default)
   * throw: only throws SessionExpiredError (for background refresh)
   */
  onUnauthorized?: 'redirect' | 'throw';
};

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: ApiFetchOptions
): Promise<Response> {
  if (isSessionExpired()) {
    throw new SessionExpiredError();
  }

  const res = await fetch(input, init);
  const unauthorizedHandling = options?.onUnauthorized ?? 'redirect';

  if (handleUnauthorizedStatus(res.status, unauthorizedHandling)) {
    throw new SessionExpiredError();
  }

  return res;
}