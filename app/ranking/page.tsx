"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Trophy } from 'lucide-react';
import { FrostedCard } from '@/components/ui/frosted-card';
import { AppMobileHeader } from '@/components/layout/app-mobile-header';
import { MobileSideMenu } from '@/components/layout/mobile-side-menu';
import { RankingEntryRow } from '@/components/ranking/ranking-entry-row';
import { RankingPodium } from '@/components/ranking/ranking-podium';
import { RankingSkeleton } from '@/components/ranking/ranking-skeleton';
import { RankingStatsBar } from '@/components/ranking/ranking-stats-bar';
import { splitRanking } from '@/components/ranking/ranking-utils';
import { getRanking, getUserIdFromStorage, type RankingEntry } from '@/lib/ranking';

export default function RankingPage() {
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId] = useState<number | null>(() =>
    typeof window !== 'undefined' ? getUserIdFromStorage() : null
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const { podium, rest, leader } = splitRanking(ranking);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    let cancelled = false;

    async function loadRanking() {
      setLoading(true);
      setError('');

      try {
        const data = await getRanking();
        if (!cancelled) {
          setRanking(data);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Erro ao carregar ranking';
          setError(message);
          setRanking([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRanking();

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
            <Trophy size={22} className="text-amber-300/80" />
            <h1 className="text-2xl font-bold tracking-wide">Ranking</h1>
          </div>
          <p className="text-sm opacity-70">
            Os melhores palpiteiros da Copa do Mundo 2026
          </p>
        </div>

        {loading && <RankingSkeleton />}

        {!loading && error && (
          <FrostedCard className="p-6 text-center">
            <p className="text-red-300/90">{error}</p>
          </FrostedCard>
        )}

        {!loading && !error && ranking.length === 0 && (
          <FrostedCard className="p-10 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full frosted-card-inner flex items-center justify-center">
              <Trophy size={28} className="text-white/40" />
            </div>
            <p className="font-semibold text-white/75">Nenhum jogador no ranking ainda</p>
            <p className="text-sm text-white/40 mt-2 max-w-xs mx-auto leading-relaxed">
              Faça seus palpites e aguarde as partidas finalizarem para subir no ranking.
            </p>
          </FrostedCard>
        )}

        {!loading && !error && ranking.length > 0 && (
          <div className="flex flex-col gap-4">
            <RankingStatsBar
              ranking={ranking}
              leader={leader}
              currentUserId={currentUserId}
            />

            {podium.length > 0 && (
              <RankingPodium podium={podium} currentUserId={currentUserId} />
            )}

            {rest.length > 0 && (
              <>
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-white/35">
                    Classificação geral
                  </h3>
                  <span className="text-[10px] text-white/30 tabular-nums">
                    {rest.length} {rest.length === 1 ? 'jogador' : 'jogadores'}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {rest.map((entry) => (
                    <RankingEntryRow
                      key={`${entry.userId}-${entry.posicao}`}
                      entry={entry}
                      currentUserId={currentUserId}
                      leaderScore={leader?.pontuacao ?? 0}
                    />
                  ))}
                </div>
              </>
            )}

            {rest.length === 0 && podium.length > 0 && (
              <FrostedCard className="p-4 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-white/50">
                  <Sparkles size={14} className="text-amber-300/70" />
                  Apenas o pódio por enquanto — convide mais amigos!
                </div>
              </FrostedCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}