'use client';

import { Target, Trophy, Users } from 'lucide-react';
import { FrostedCard } from '@/components/ui/frosted-card';
import type { RankingEntry } from '@/lib/ranking';
import { isCurrentUserEntry } from '@/components/ranking/ranking-utils';

interface RankingStatsBarProps {
  ranking: RankingEntry[];
  leader: RankingEntry | null;
  currentUserId: number | null;
  knockout?: boolean;
}

export function RankingStatsBar({ ranking, leader, currentUserId, knockout }: RankingStatsBarProps) {
  const currentUserEntry = ranking.find((e) => isCurrentUserEntry(e, currentUserId)) ?? null;

  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      <FrostedCard knockout={knockout} className="p-3 text-center">
        <Users size={15} className="mx-auto mb-1.5 text-white/45" />
        <div className="text-lg font-bold tabular-nums">{ranking.length}</div>
        <div className="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">
          {ranking.length === 1 ? 'jogador' : 'jogadores'}
        </div>
      </FrostedCard>

      <FrostedCard knockout={knockout} className="p-3 text-center">
        <Target size={15} className="mx-auto mb-1.5 text-white/45" />
        <div className="text-lg font-bold tabular-nums">
          {currentUserEntry ? `#${currentUserEntry.posicao}` : '—'}
        </div>
        <div className="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">sua posição</div>
      </FrostedCard>

      <FrostedCard knockout={knockout} className="p-3 text-center">
        <Trophy size={15} className="mx-auto mb-1.5 text-amber-300/80" />
        <div className="text-lg font-bold tabular-nums text-amber-100/90">
          {leader?.pontuacao ?? 0}
        </div>
        <div className="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">recorde</div>
      </FrostedCard>
    </div>
  );
}