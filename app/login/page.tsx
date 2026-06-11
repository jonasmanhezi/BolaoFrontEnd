"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthShell } from '@/components/auth/auth-shell';
import { GlassField } from '@/components/auth/glass-field';
import { GlassButton } from '@/components/ui/glass-button';
import { loginWithCredentials, persistAuthSession } from '@/lib/auth-api';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { hasGrupoSession } from '@/lib/grupo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const senhaAtual = senha;
    setSenha('');

    try {
      const data = await loginWithCredentials(email, senhaAtual);

      if (data.token) {
        persistAuthSession(data);
        router.push(hasGrupoSession() ? '/palpites' : '/entrar-grupo');
      } else {
        toast.success('Verifique seu email para confirmar a conta antes de fazer login.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? getAuthErrorMessage(err.message, 'login')
          : getAuthErrorMessage(undefined, 'login');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell variant="splash">
      <div className="auth-login-logo-area">
        <img
          src="/fifa.png"
          alt="Copa do Mundo 2026"
          className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
        />
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <GlassField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="seu@email.com"
          required
          autoComplete="email"
        />

        <GlassField
          id="login-senha"
          label="Senha"
          type="password"
          value={senha}
          onChange={setSenha}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <div className="pt-2">
          <GlassButton
            type="submit"
            variant="emerald"
            size="lg"
            glowEffect
            fullWidth
            disabled={loading}
            className="w-full h-12 rounded-2xl text-base font-semibold tracking-wide"
          >
            {loading ? 'Entrando...' : 'Logar'}
          </GlassButton>
        </div>
      </form>

      <div className="text-center mt-6 text-sm text-white/80">
        Ainda não tem conta?{' '}
        <Link
          href="/register"
          className="text-white font-semibold hover:underline underline-offset-4"
        >
          Crie uma agora
        </Link>
      </div>
    </AuthShell>
  );
}