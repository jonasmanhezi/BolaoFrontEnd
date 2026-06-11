export type AuthErrorContext = 'login' | 'register';

const GENERIC_LOGIN = 'Não foi possível fazer login. Verifique seus dados e tente novamente.';
const GENERIC_REGISTER = 'Não foi possível criar a conta. Verifique os dados e tente novamente.';

function looksTechnical(message: string): boolean {
  const lower = message.toLowerCase();

  return (
    /https?:\/\//i.test(message) ||
    /\/auth\//i.test(message) ||
    /\/api\//i.test(message) ||
    lower.includes('i/o error') ||
    lower.includes('connection refused') ||
    lower.includes('connect timed out') ||
    lower.includes('supabase') ||
    lower.includes('jwt_secret') ||
    lower.includes('post request for') ||
    lower.includes('erro no login:') ||
    lower.includes('erro ao registrar') ||
    lower.includes('falha no registro:') ||
    lower.includes('resposta inesperada')
  );
}

export function getAuthErrorMessage(
  raw: string | undefined,
  context: AuthErrorContext,
  status?: number
): string {
  const fallback = context === 'login' ? GENERIC_LOGIN : GENERIC_REGISTER;
  const message = raw?.trim();

  if (!message) {
    if (status === 401) return 'Email ou senha incorretos.';
    if (status === 409) return 'Este email já está cadastrado.';
    return fallback;
  }

  const lower = message.toLowerCase();

  if (
    lower.includes('credenciais inválidas') ||
    lower.includes('email ou senha') ||
    lower.includes('invalid login') ||
    lower.includes('invalid credentials')
  ) {
    return 'Email ou senha incorretos.';
  }

  if (
    lower.includes('já existe') ||
    lower.includes('already registered') ||
    lower.includes('user already registered') ||
    lower.includes('email already')
  ) {
    return 'Este email já está cadastrado.';
  }

  if (lower.includes('preencha todos os campos') || lower.includes('obrigatórios')) {
    return 'Preencha todos os campos.';
  }

  if (looksTechnical(message)) {
    return fallback;
  }

  if (message.length <= 120 && !message.includes('/')) {
    return message;
  }

  return fallback;
}