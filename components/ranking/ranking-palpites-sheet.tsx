'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ListChecks, X } from 'lucide-react';
import { PalpiteHistoryCard } from '@/components/palpite/palpite-history-card';
import { formatDateLong } from '@/lib/match-time';
import { getAllPartidas, type Partida } from '@/lib/partidas';
import { getPalpitesDoJogador, type Palpite } from '@/lib/palpites';
import type { RankingEntry } from '@/lib/ranking';
import { displayName, getInitials } from '@/components/ranking/ranking-utils';

interface HistoricoItem {
  palpite: Palpite;
  partida?: Partida;
}

interface RankingPalpitesSheetProps {
  entry: RankingEntry | null;
  currentUserId: number | null;
  open: boolean;
  onClose: () => void;
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

export function RankingPalpitesSheet({
  entry,
  currentUserId,
  open,
  onClose,
}: RankingPalpitesSheetProps) {
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const groupedHistorico = useMemo(() => groupHistoricoByDate(historico), [historico]);

  useEffect(() => {
    if (!open || !entry) return;

    let cancelled = false;

    async function loadPalpites() {
      setLoading(true);
      setError('');

      try {
        const [partidas, palpites] = await Promise.all([
          getAllPartidas(),
          getPalpitesDoJogador(entry!.userId, undefined, { onUnauthorized: 'throw' }),
        ]);

        if (!cancelled) {
          setHistorico(buildHistorico(palpites, partidas));
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Erro ao carregar palpites';
          setError(message);
          setHistorico([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPalpites();

    return () => {
      cancelled = true;
    };
  }, [open, entry]);

  useEffect(() => {
    if (!open) {
      setHistorico([]);
      setError('');
      setLoading(false);
    }
  }, [open]);

  if (!entry) return null;

  const nomeExibicao = displayName(entry, currentUserId);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] bg-[#050716]/85 backdrop-blur-sm flex items-end justify-center"
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={animate ? { opacity: 0 } : undefined}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xl max-h-[88dvh] palpite-modal-sheet rounded-t-[28px] rounded-b-none flex flex-col"
            initial={animate ? { y: '100%' } : false}
            animate={{ y: 0 }}
            exit={animate ? { y: '100%' } : undefined}
            transition={
              animate ? { type: 'spring', damping: 30, stiffness: 320 } : { duration: 0 }
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-6 pt-6 pb-4 border-b border-white/8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">
                    {getInitials(entry.nome)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-white/45">
                      Palpites de
                    </div>
                    <div className="font-semibold text-lg truncate">{nomeExibicao}</div>
                    <div className="text-xs text-white/45 mt-0.5 tabular-nums">
                      #{entry.posicao} · {entry.pontuacao} pontos
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white/60 hover:text-white text-2xl leading-none shrink-0"
                  aria-label="Fechar"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 pb-10">
              {loading && (
                <div className="flex flex-col gap-3 animate-pulse">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="frosted-card h-28">
                      <div className="frosted-card__blur" aria-hidden />
                      <div className="frosted-card__glass" aria-hidden />
                      <div className="frosted-card__shine" aria-hidden />
                    </div>
                  ))}
                </div>
              )}

              {!loading && error && (
                <p className="text-center text-sm text-red-300/90 py-8">{error}</p>
              )}

              {!loading && !error && historico.length === 0 && (
                <div className="text-center py-10">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-full frosted-card-inner flex items-center justify-center">
                    <ListChecks size={20} className="text-white/40" />
                  </div>
                  <p className="text-sm text-white/60">Nenhum palpite registrado ainda.</p>
                </div>
              )}

              {!loading && !error && groupedHistorico.length > 0 && (
                <div className="flex flex-col gap-5">
                  {groupedHistorico.map((group) => (
                    <section key={group.date}>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-3">
                        {group.date === 'sem-data'
                          ? 'Partidas não encontradas'
                          : formatDateLong(group.date)}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {group.items.map((item) => (
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}