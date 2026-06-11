"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, Sparkles } from 'lucide-react';
import { AppMobileHeader } from '@/components/layout/app-mobile-header';
import { MobileSideMenu } from '@/components/layout/mobile-side-menu';
import { PalpiteHistoryCard } from '@/components/palpite/palpite-history-card';
import { FrostedCard } from '@/components/ui/frosted-card';
import { formatDateLong } from '@/lib/match-time';
import { getAllPartidas, type Partida } from '@/lib/partidas';
import { getPalpitesDoUsuario, type Palpite } from '@/lib/palpites';
import { hasGrupoSession } from '@/lib/grupo';

interface HistoricoItem {
  palpite: Palpite;
  partida?: Partida;
}

function buildHistorico(palpites: Palpite[], partidas: Partida[]): HistoricoItem[] {
  const partidasMap = new Map(partidas.map((partida) => [partida.id, partida]));

  return [...palpites]
    .map((palpite) => ({
      palpite,
      partida: partidasMap.get(palpite.partidaId),
    }))
    .sort((a, b) => {
      const keyA = a.partida ? `${a.partida.data}T${a.partida.horario}` : '';
      const keyB = b.partida ? `${b.partida.data}T${b.partida.horario}` : '';
      return keyB.localeCompare(keyA);
    });
}

function groupHistoricoByDate(items: HistoricoItem[]): Array<{ date: string; items: HistoricoItem[] }> {
  const groups = new Map<string, HistoricoItem[]>();

  for (const item of items) {
    const date = item.partida?.data ?? 'sem-data';
    const current = groups.get(date) ?? [];
    current.push(item);
    groups.set(date, current);
  }

  return Array.from(groups.entries())
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, groupItems]) => ({ date, items: groupItems }));
}

export default function HistoricoPage() {
  const router = useRouter();
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const groupedHistorico = useMemo(() => groupHistoricoByDate(historico), [historico]);

  const totalPontos = useMemo(
    () =>
      historico.reduce((sum, item) => {
        const pontos = item.palpite.pontuacaoObtida;
        return sum + (typeof pontos === 'number' ? pontos : 0);
      }, 0),
    [historico]
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    if (!hasGrupoSession()) {
      router.replace('/entrar-grupo');
      return;
    }

    let cancelled = false;

    async function loadHistorico() {
      setLoading(true);
      setError('');

      try {
        const [partidas, palpites] = await Promise.all([getAllPartidas(), getPalpitesDoUsuario()]);
        if (!cancelled) {
          setHistorico(buildHistorico(palpites, partidas));
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Erro ao carregar histórico';
          setError(message);
          setHistorico([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistorico();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-dvh bolao-palpites-bg bolao-palpites-page text-white relative">
      <AppMobileHeader onMenuOpen={() => setMenuOpen(true)} />
      <MobileSideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative z-10 max-w-xl mx-auto w-full px-6 py-6 pb-32">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <History size={22} className="text-cyan-300/80" />
            <h1 className="text-2xl font-bold tracking-wide">Histórico</h1>
          </div>
          <p className="text-sm opacity-70">Todos os seus palpites na Copa do Mundo 2026</p>
        </div>

        {!loading && !error && historico.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <FrostedCard className="p-4 text-center">
              <div className="text-2xl font-bold tabular-nums">{historico.length}</div>
              <div className="text-xs text-white/50 mt-1">Palpites</div>
            </FrostedCard>
            <FrostedCard className="p-4 text-center">
              <div className="text-2xl font-bold tabular-nums text-emerald-300">{totalPontos}</div>
              <div className="text-xs text-white/50 mt-1">Pontos obtidos</div>
            </FrostedCard>
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-white/5 border border-white/8 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <FrostedCard className="p-6 text-center">
            <p className="text-red-300/90">{error}</p>
          </FrostedCard>
        )}

        {!loading && !error && historico.length === 0 && (
          <FrostedCard className="p-10 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full frosted-card-inner flex items-center justify-center">
              <History size={28} className="text-white/40" />
            </div>
            <p className="font-semibold text-white/75">Nenhum palpite ainda</p>
            <p className="text-sm text-white/40 mt-2 max-w-xs mx-auto leading-relaxed">
              Faça seu primeiro palpite e ele aparecerá aqui com o resultado e a pontuação.
            </p>
            <Link
              href="/palpites"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-2xl liquid-glass-pill-active text-sm font-medium"
            >
              <Sparkles size={16} />
              Ir para Palpites
            </Link>
          </FrostedCard>
        )}

        {!loading && !error && historico.length > 0 && (
          <div className="flex flex-col gap-6">
            {groupedHistorico.map(({ date, items }) => (
              <section key={date}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-3 px-1">
                  {date === 'sem-data' ? 'Outros palpites' : formatDateLong(date)}
                </h2>
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <PalpiteHistoryCard
                      key={item.palpite.id ?? `${item.palpite.partidaId}-${item.palpite.golsCasa}-${item.palpite.golsVisitante}`}
                      palpite={item.palpite}
                      partida={item.partida}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}