'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthSubmitButton } from '@/components/auth/auth-submit-button';
import { UnderlineField } from '@/components/auth/underline-field';
import { persistAuthSession, registerAccount } from '@/lib/auth-api';

interface RegisterFormProps {
  idPrefix?: string;
}

export function RegisterForm({ idPrefix = 'register' }: RegisterFormProps) {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const senhaAtual = senha;
    setSenha('');

    try {
      const data = await registerAccount(nome, email, senhaAtual);

      if (data.token) {
        persistAuthSession(data);
        router.push('/palpites');
      } else {
        setError(
          'Conta criada com sucesso! Verifique seu email para confirmar a conta antes de fazer login.'
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-5">
      <UnderlineField
        id={`${idPrefix}-nome`}
        label="Nome"
        value={nome}
        onChange={setNome}
        placeholder="Seu nome"
        required
        autoComplete="name"
      />

      <UnderlineField
        id={`${idPrefix}-email`}
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="seu@email.com"
        required
        autoComplete="email"
      />

      <UnderlineField
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

      {error && <p className="text-red-300/90 text-sm text-center">{error}</p>}

      <AuthSubmitButton disabled={loading}>
        {loading ? 'Criando conta...' : 'Criar conta'}
      </AuthSubmitButton>
    </form>
  );
}