"use client";

import { AuthGlassPanel } from '@/components/auth/auth-glass-panel';
import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <AuthShell>
      <AuthGlassPanel>
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold tracking-tight">Criar Conta</h1>
          <p className="text-white/80 mt-1 text-sm">Junte-se ao Bolão da Copa 2026</p>
        </div>

        <RegisterForm idPrefix="register-page" />
      </AuthGlassPanel>

      <div className="text-center mt-5 text-sm text-white/55">
        Já tem conta?{' '}
        <a href="/login" className="text-white hover:underline">
          Entrar
        </a>
      </div>
    </AuthShell>
  );
}