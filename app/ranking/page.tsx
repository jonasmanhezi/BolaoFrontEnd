"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getTodayBrazilDateString } from '@/lib/match-time';
import { RotateCw, Sparkles, Trophy } from 'lucide-react';
import { FrostedCard } from '@/components/ui/frosted-card';
import { AppMobileHeader } from '@/components/layout/app-mobile-header';
import { MobileSideMenu } from '@/components/layout/mobile-side-menu';
import { RankingEntryRow } from '@/components/ranking/ranking-entry-row';
import { RankingPodium } from '@/components/ranking/ranking-podium';
import { RankingSkeleton } from '@/components/ranking/ranking-skeleton';
import { RankingPalpitesSheet } from '@/components/ranking/ranking-palpites-sheet';
import { RankingStatsBar } from '@/components/ranking/ranking-stats-bar';
import { RankingAuraPopup } from '@/components/ranking/ranking-aura-popup';
import { RankingYourStanding } from '@/components/ranking/ranking-your-standing';
import { splitRanking, isCurrentUserEntry } from '@/components/ranking/ranking-utils';
import {
  getRanking,
  getUserIdFromStorage,
  type RankingEntry,
} from '@/lib/ranking';
import { hasGrupoSession } from '@/lib/grupo';

export default function RankingPage() {
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId] = useState<number | null>(() =>
    typeof window !== 'undefined' ? getUserIdFromStorage() : null
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [palpitesEntry, setPalpitesEntry] = useState<RankingEntry | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;

  const { sorted, podium, rest, leader } = splitRanking(ranking);
  const isKnockout = getTodayBrazilDateString() >= '2026-06-28';

  const currentUserEntry = useMemo(
    () => sorted.find((e) => isCurrentUserEntry(e, currentUserId)) ?? null,
    [sorted, currentUserId]
  );
  const currentUserAbove = useMemo(() => {
    if (!currentUserEntry) return null;
    const idx = sorted.findIndex((e) => e.userId === currentUserEntry.userId);
    return idx > 0 ? sorted[idx - 1] : null;
  }, [sorted, currentUserEntry]);

  // mapa userId -> pontos do jogador imediatamente acima
  const gapAboveByUser = useMemo(() => {
    const map = new Map<number, number>();
    for (let i = 1; i < sorted.length; i++) {
      map.set(sorted[i].userId, sorted[i - 1].pontuacao - sorted[i].pontuacao);
    }
    return map;
  }, [sorted]);

  const openPalpites = (entry: RankingEntry) => setPalpitesEntry(entry);
  const closePalpites = () => setPalpitesEntry(null);

  const loadRanking = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await getRanking();
      setRanking(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar ranking';
      setError(message);
      setRanking([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

    loadRanking();
  }, [router, loadRanking]);

  return (
    <div className={`min-h-dvh bolao-palpites-bg bolao-palpites-page text-white relative${isKnockout ? ' bolao-palpites-bg--knockout' : ''}`}>
      <AppMobileHeader onMenuOpen={() => setMenuOpen(true)} knockout={isKnockout} />
      <MobileSideMenu open={menuOpen} onClose={() => setMenuOpen(false)} knockout={isKnockout} />

      <div className="relative z-10 max-w-xl mx-auto w-full px-6 py-6 pb-32">
        <motion.div
          className="mb-6 flex items-start justify-between gap-3"
          initial={animate ? { opacity: 0, y: -10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Trophy size={22} className="text-amber-300/80" />
              <h1 className="text-2xl font-bold tracking-wide">Ranking</h1>
            </div>
            <p className="text-sm opacity-70">
              Os melhores palpiteiros da Copa do Mundo 2026
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadRanking(true)}
            disabled={loading || refreshing}
            aria-label="Atualizar ranking"
            className="shrink-0 mt-1 w-10 h-10 rounded-xl liquid-glass-pill flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RotateCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </motion.div>

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
            {podium.length > 0 && (
              <RankingPodium
                podium={podium}
                currentUserId={currentUserId}
                onViewPalpites={openPalpites}
              />
            )}

            {currentUserEntry && currentUserEntry.posicao > 3 && (
              <motion.div
                initial={animate ? { opacity: 0, y: 14 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: animate ? 0.44 : 0, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <RankingYourStanding entry={currentUserEntry} above={currentUserAbove} knockout={isKnockout} />
              </motion.div>
            )}

            <motion.div
              initial={animate ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: animate ? 0.48 : 0, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <RankingStatsBar
                ranking={ranking}
                leader={leader}
                currentUserId={currentUserId}
              />
            </motion.div>

            {rest.length > 0 && (
              <>
                <motion.div
                  className="flex items-center justify-between px-1"
                  initial={animate ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ delay: animate ? 0.56 : 0, duration: 0.35 }}
                >
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-white/35">
                    Classificação geral
                  </h3>
                  <span className="text-[10px] text-white/30 tabular-nums">
                    {rest.length} {rest.length === 1 ? 'jogador' : 'jogadores'}
                  </span>
                </motion.div>
                <div className="flex flex-col gap-3">
                  {rest.map((entry, index) => (
                    <motion.div
                      key={`${entry.userId}-${entry.posicao}`}
                      initial={animate ? { opacity: 0, x: -18 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: animate ? 0.6 + index * 0.06 : 0,
                        duration: 0.38,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <RankingEntryRow
                        entry={entry}
                        currentUserId={currentUserId}
                        leaderScore={leader?.pontuacao ?? 0}
                        gapToAbove={gapAboveByUser.get(entry.userId) ?? null}
                        knockout={isKnockout}
                        onViewPalpites={openPalpites}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {rest.length === 0 && podium.length > 0 && (
              <motion.div
                initial={animate ? { opacity: 0, y: 12 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: animate ? 0.52 : 0, duration: 0.4 }}
              >
                <FrostedCard className="p-4 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-white/50">
                    <Sparkles size={14} className="text-amber-300/70" />
                    Apenas o pódio por enquanto — convide mais amigos!
                  </div>
                </FrostedCard>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <RankingPalpitesSheet
        entry={palpitesEntry}
        currentUserId={currentUserId}
        open={palpitesEntry != null}
        onClose={closePalpites}
      />

      <RankingAuraPopup
        leader={leader}
        isCurrentUser={leader ? isCurrentUserEntry(leader, currentUserId) : false}
        trigger={!loading && !error && ranking.length > 0}
      />
    </div>
  );
}