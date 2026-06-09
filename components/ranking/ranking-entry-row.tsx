'use client';

import { FrostedCard } from '@/components/ui/frosted-card';
import type { RankingEntry } from '@/lib/ranking';
import {
  displayName,
  getInitials,
  isCurrentUserEntry,
} from '@/components/ranking/ranking-utils';
import { cn } from '@/lib/utils';

interface RankingEntryRowProps {
  entry: RankingEntry;
  currentUserId: number | null;
  leaderScore: number;
}

export function RankingEntryRow({ entry, currentUserId, leaderScore }: RankingEntryRowProps) {
  const isCurrentUser = isCurrentUserEntry(entry, currentUserId);
  const progress = leaderScore > 0 ? Math.min(100, (entry.pontuacao / leaderScore) * 100) : 0;

  return (
    <FrostedCard
      className={cn(
        'p-4',
        isCurrentUser && 'ring-1 ring-[#4a62d8]/45 shadow-[0_0_24px_rgba(74,98,216,0.15)]'
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
              ? 'bg-[#1a247d]/50 border-[#4a62d8]/40 text-white'
              : 'bg-white/8 border-white/12 text-white/75'
          )}
        >
          {getInitials(entry.nome)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold truncate">{displayName(entry, currentUserId)}</span>
            {isCurrentUser && (
              <span className="shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#1a247d]/60 border border-[#4a62d8]/30 text-white/70">
                você
              </span>
            )}
          </div>

          <div className="mt-2 h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isCurrentUser
                  ? 'bg-linear-to-r from-[#2438a8] to-[#4a62d8]'
                  : 'bg-linear-to-r from-white/20 to-white/35'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-right shrink-0 ml-1">
          <div className="text-xl font-bold tabular-nums text-white/85">{entry.pontuacao}</div>
          <div className="text-[9px] uppercase tracking-widest text-white/35">pontos</div>
        </div>
      </div>
    </FrostedCard>
  );
}