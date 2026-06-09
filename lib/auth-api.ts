import { encodeCredential } from '@/lib/auth-credentials';

export interface AuthResult {
  token?: string;
  userId?: number;
  nome?: string;
  email?: string;
}

async function parseAuthResponse(res: Response): Promise<AuthResult> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Erro na autenticação (${res.status})`);
  }
  return res.json();
}

export async function loginWithCredentials(email: string, senha: string): Promise<AuthResult> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      credential: encodeCredential(senha),
    }),
  });

  return parseAuthResponse(res);
}

export async function registerAccount(
  nome: string,
  email: string,
  senha: string
): Promise<AuthResult> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome,
      email,
      credential: encodeCredential(senha),
    }),
  });

  return parseAuthResponse(res);
}

export function persistAuthSession(data: AuthResult): void {
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.userId != null) {
    localStorage.setItem('userId', data.userId.toString());
  }
  if (data.nome) {
    localStorage.setItem('userName', data.nome);
  }
}