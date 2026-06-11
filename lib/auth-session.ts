import { clearGrupoSession } from '@/lib/grupo';

let redirectingToLogin = false;

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  clearGrupoSession();
}

export function redirectToLogin(): void {
  if (typeof window === 'undefined' || redirectingToLogin) return;
  redirectingToLogin = true;
  clearAuthSession();
  window.location.replace('/login');
}

export function handleUnauthorizedStatus(status: number): boolean {
  if (status !== 401) return false;
  redirectToLogin();
  return true;
}