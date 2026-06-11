import { toast } from 'sonner';
import { clearGrupoSession } from '@/lib/grupo';

const SESSION_EXPIRED_REDIRECT_MS = 1500;

let redirectingToLogin = false;
let sessionExpired = false;

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  clearGrupoSession();
}

export function isSessionExpired(): boolean {
  return sessionExpired || redirectingToLogin;
}

type RedirectToLoginOptions = {
  sessionExpired?: boolean;
  toastDescription?: string;
};

export function redirectToLogin(options?: RedirectToLoginOptions): void {
  if (typeof window === 'undefined') return;

  const goToLogin = () => {
    clearAuthSession();
    window.location.replace('/login');
  };

  if (options?.sessionExpired) {
    sessionExpired = true;

    if (!redirectingToLogin) {
      redirectingToLogin = true;
      toast.error('Sessão expirada', {
        description: options.toastDescription ?? 'Faça login novamente para continuar.',
        duration: 4000,
      });
      window.setTimeout(goToLogin, SESSION_EXPIRED_REDIRECT_MS);
      return;
    }

    if (options.toastDescription) {
      toast.error('Sessão expirada', {
        description: options.toastDescription,
        duration: 4000,
      });
    }
    return;
  }

  if (redirectingToLogin) return;
  redirectingToLogin = true;
  goToLogin();
}

export type UnauthorizedHandling = 'redirect' | 'throw';

export function handleUnauthorizedStatus(
  status: number,
  handling: UnauthorizedHandling = 'redirect'
): boolean {
  if (status !== 401) return false;

  if (handling === 'throw') {
    sessionExpired = true;
    return true;
  }

  redirectToLogin({ sessionExpired: true });
  return true;
}