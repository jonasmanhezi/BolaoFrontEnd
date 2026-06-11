'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GlassField } from '@/components/auth/glass-field';
import { GlassButton } from '@/components/ui/glass-button';
import { persistAuthSession, registerAccount } from '@/lib/auth-api';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { hasGrupoSession } from '@/lib/grupo';

interface RegisterFormProps {
  idPrefix?: string;
}

export function RegisterForm({ idPrefix = 'register' }: RegisterFormProps) {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const senhaAtual = senha;
    setSenha('');

    try {
      const data = await registerAccount(nome, email, senhaAtual);

      if (data.token) {
        persistAuthSession(data);
        router.push(hasGrupoSession() ? '/palpites' : '/entrar-grupo');
      } else {
        toast.success('Conta criada! Verifique seu email para confirmar antes de fazer login.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? getAuthErrorMessage(err.message, 'register')
          : getAuthErrorMessage(undefined, 'register');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <GlassField
        id={`${idPrefix}-nome`}
        label="Nome"
        value={nome}
        onChange={setNome}
        placeholder="Seu nome"
        required
        autoComplete="name"
      />

      <GlassField
        id={`${idPrefix}-email`}
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="seu@email.com"
        required
        autoComplete="email"
      />

      <GlassField
        id={`${idPrefix}-senha`}
        label="Senha"
        type="password"
        value={senha}
        onChange={setSenha}
        placeholder="Mínimo 6 caracteres"
        required
        minLength={6}
        autoComplete="new-password"
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
          {loading ? 'Criando conta...' : 'Criar conta'}
        </GlassButton>
      </div>
    </form>
  );
}