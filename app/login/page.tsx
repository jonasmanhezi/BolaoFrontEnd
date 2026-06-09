"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthSubmitButton } from '@/components/auth/auth-submit-button';
import { RegisterSheet } from '@/components/auth/register-sheet';
import { UnderlineField } from '@/components/auth/underline-field';
import { loginWithCredentials, persistAuthSession } from '@/lib/auth-api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const senhaAtual = senha;
    setSenha('');

    try {
      const data = await loginWithCredentials(email, senhaAtual);

      if (data.token) {
        persistAuthSession(data);
        router.push('/palpites');
      } else {
        setError('Conta criada! Verifique seu email para confirmar e depois faça login.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <form onSubmit={handleLogin} className="space-y-5">
        <UnderlineField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="seu@email.com"
          required
          autoComplete="email"
        />

        <UnderlineField
          id="login-senha"
          label="Senha"
          type="password"
          value={senha}
          onChange={setSenha}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        {error && <p className="text-red-300/90 text-sm text-center">{error}</p>}

        <AuthSubmitButton disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </AuthSubmitButton>
      </form>

      <div className="text-center mt-5 text-sm text-white/55">
        Ainda não tem conta?{' '}
        <button
          type="button"
          onClick={() => setRegisterOpen(true)}
          className="text-white hover:underline"
        >
          Crie uma agora
        </button>
      </div>

      <RegisterSheet open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </AuthShell>
  );
}