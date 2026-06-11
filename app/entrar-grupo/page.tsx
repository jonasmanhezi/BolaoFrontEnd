"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthShell } from '@/components/auth/auth-shell';
import { GlassField } from '@/components/auth/glass-field';
import { GlassButton } from '@/components/ui/glass-button';
import { entrarNoGrupo, hasGrupoSession, listarMeusGrupos, persistGrupoSession } from '@/lib/grupo';

export default function EntrarGrupoPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    if (hasGrupoSession()) {
      router.replace('/palpites');
      return;
    }

    let ativo = true;

    const carregarGrupos = async () => {
      try {
        const grupos = await listarMeusGrupos();
        if (!ativo) return;
        if (grupos.length === 1) {
          persistGrupoSession(grupos[0]);
          router.replace('/palpites');
        }
      } catch {
        // usuário ainda não entrou em nenhum grupo
      } finally {
        if (ativo) setChecking(false);
      }
    };

    carregarGrupos();

    return () => {
      ativo = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) {
      toast.error('Informe o código do seu bolão.');
      return;
    }

    setLoading(true);
    try {
      await entrarNoGrupo(codigo);
      toast.success('Grupo encontrado! Bem-vindo ao bolão.');
      router.push('/palpites');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Não foi possível entrar no grupo.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthShell variant="splash">
        <p className="text-center text-white/70 text-sm">Carregando...</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell variant="splash">
      <div className="auth-login-logo-area">
        <img
          src="/fifa.png"
          alt="Copa do Mundo 2026"
          className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
        />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold tracking-wide">Entrar no bolão</h1>
        <p className="text-sm text-white/70 mt-2">
          Digite o código que você recebeu para participar do seu grupo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <GlassField
          id="grupo-codigo"
          label="Código do grupo"
          value={codigo}
          onChange={setCodigo}
          placeholder="Ex: BOLAO-2026"
          required
          autoComplete="off"
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
            {loading ? 'Validando...' : 'Entrar no grupo'}
          </GlassButton>
        </div>
      </form>
    </AuthShell>
  );
}