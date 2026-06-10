"use client";

import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <AuthShell variant="splash">
      <div className="auth-login-logo-area">
        <img
          src="/fifa.png"
          alt="Copa do Mundo 2026"
          className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
        />
      </div>

      <RegisterForm idPrefix="register-page" />

      <div className="text-center mt-6 text-sm text-white/80">
        Já tem conta?{' '}
        <Link href="/login" className="text-white font-medium hover:underline underline-offset-4">
          Entrar
        </Link>
      </div>
    </AuthShell>
  );
}