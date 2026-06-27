'use client';

import { ChevronUp, Eye } from 'lucide-react';
import { FrostedCard } from '@/components/ui/frosted-card';
import type { RankingEntry } from '@/lib/ranking';
import {
  displayName,
  formatRankingScore,
  getInitials,
  isCurrentUserEntry,
} from '@/components/ranking/ranking-utils';
import { cn } from '@/lib/utils';

interface RankingEntryRowProps {
  entry: RankingEntry;
  currentUserId: number | null;
  leaderScore: number;
  /** Pontos do jogador imediatamente acima (para mostrar o gap). */
  gapToAbove?: number | null;
  knockout?: boolean;
  onViewPalpites?: (entry: RankingEntry) => void;
}

export function RankingEntryRow({
  entry,
  currentUserId,
  leaderScore,
  gapToAbove,
  knockout,
  onViewPalpites,
}: RankingEntryRowProps) {
  const isCurrentUser = isCurrentUserEntry(entry, currentUserId);
  const progress = leaderScore > 0 ? Math.min(100, (entry.pontuacao / leaderScore) * 100) : 0;
  const showGap = gapToAbove != null && gapToAbove > 0;

  return (
    <FrostedCard
      className={cn(
        'p-4',
        isCurrentUser &&
          (knockout
            ? 'ring-1 ring-amber-400/45 shadow-[0_0_24px_rgba(251,191,36,0.15)]'
            : 'ring-1 ring-[#4a62d8]/45 shadow-[0_0_24px_rgba(74,98,216,0.15)]')
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full shrink-0 frosted-card-inner flex items-center justify-center text-xs font-bold text-white/70">
          {entry.posicao}
        </div>

        <div
          className={cn(
            'w-10 h-10 rounded-full shrink-0 border flex items-center justify-center text-xs font-bold',
            isCurrentUser
              ? knockout
                ? 'bg-amber-500/20 border-amber-400/40 text-white'
                : 'bg-[#1a247d]/50 border-[#4a62d8]/40 text-white'
              : 'bg-white/8 border-white/12 text-white/75'
          )}
        >
          {getInitials(entry.nome)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold truncate">{displayName(entry, currentUserId)}</span>
            {isCurrentUser && (
              <span
                className={cn(
                  'shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white/70',
                  knockout
                    ? 'bg-amber-500/20 border border-amber-400/30'
                    : 'bg-[#1a247d]/60 border border-[#4a62d8]/30'
                )}
              >
                você
              </span>
            )}
          </div>

          <div className="mt-2 h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isCurrentUser
                  ? knockout
                    ? 'bg-linear-to-r from-amber-500 to-amber-300'
                    : 'bg-linear-to-r from-[#2438a8] to-[#4a62d8]'
                  : 'bg-linear-to-r from-white/20 to-white/35'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {showGap && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/35">
              <ChevronUp size={11} className="text-emerald-400/70" />
              <span className="tabular-nums">
                {formatRankingScore(gapToAbove!)} {gapToAbove === 1 ? 'ponto' : 'pontos'} para subir
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0 ml-1">
          <div className="text-right">
            <div className="text-xl font-bold tabular-nums text-white/85">{entry.pontuacao}</div>
            <div className="text-[9px] uppercase tracking-widest text-white/35">pontos</div>
          </div>
          {onViewPalpites ? (
            <button
              type="button"
              onClick={() => onViewPalpites(entry)}
              className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/55 hover:bg-white/10 hover:text-white/80 transition-colors"
            >
              <Eye size={12} />
              Palpites
            </button>
          ) : null}
        </div>
      </div>
    </FrostedCard>
  );
}