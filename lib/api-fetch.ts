import { handleUnauthorizedStatus } from '@/lib/auth-session';

export class SessionExpiredError extends Error {
  constructor() {
    super('Sessão expirada. Faça login novamente.');
    this.name = 'SessionExpiredError';
  }
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);

  if (handleUnauthorizedStatus(res.status)) {
    throw new SessionExpiredError();
  }

  return res;
}