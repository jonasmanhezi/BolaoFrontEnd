'use client';

import { Crown, Medal } from 'lucide-react';
import { FrostedCard } from '@/components/ui/frosted-card';
import type { RankingEntry } from '@/lib/ranking';
import {
  displayName,
  getInitials,
  isCurrentUserEntry,
} from '@/components/ranking/ranking-utils';
import { cn } from '@/lib/utils';

interface RankingPodiumProps {
  podium: RankingEntry[];
  currentUserId: number | null;
}

const PODIUM_ORDER = [2, 1, 3] as const;

const PODIUM_STYLES: Record<
  number,
  {
    height: string;
    accent: string;
    avatar: string;
    badge: string;
    icon?: 'crown' | 'medal';
  }
> = {
  1: {
    height: 'pt-8 pb-5',
    accent: 'ring-1 ring-amber-300/35 shadow-[0_0_32px_rgba(251,191,36,0.12)]',
    avatar: 'bg-linear-to-br from-amber-300/30 to-amber-500/20 border-amber-200/35 text-amber-100',
    badge: 'bg-amber-400/20 text-amber-200 border-amber-300/25',
    icon: 'crown',
  },
  2: {
    height: 'pt-6 pb-4 mt-4',
    accent: 'ring-1 ring-white/20',
    avatar: 'bg-linear-to-br from-white/20 to-white/5 border-white/25 text-white/90',
    badge: 'bg-white/12 text-white/80 border-white/15',
    icon: 'medal',
  },
  3: {
    height: 'pt-5 pb-4 mt-6',
    accent: 'ring-1 ring-amber-700/30',
    avatar: 'bg-linear-to-br from-amber-700/35 to-amber-900/20 border-amber-600/30 text-amber-100/90',
    badge: 'bg-amber-800/25 text-amber-200/80 border-amber-700/25',
    icon: 'medal',
  },
};

function PodiumSlot({
  entry,
  currentUserId,
}: {
  entry: RankingEntry | undefined;
  currentUserId: number | null;
}) {
  if (!entry) {
    return <div className="flex-1" />;
  }

  const style = PODIUM_STYLES[entry.posicao];
  const isCurrentUser = isCurrentUserEntry(entry, currentUserId);

  return (
    <div className="flex-1 min-w-0">
      <FrostedCard
        className={cn(
          'text-center h-full',
          style.height,
          style.accent,
          isCurrentUser && 'ring-2 ring-[#4a62d8]/50'
        )}
      >
        <div
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border mb-3',
            style.badge
          )}
        >
          {style.icon === 'crown' ? <Crown size={10} /> : <Medal size={10} />}
          {entry.posicao}º
        </div>

        <div
          className={cn(
            'mx-auto mb-2.5 w-11 h-11 rounded-full border flex items-center justify-center text-xs font-bold',
            style.avatar
          )}
        >
          {getInitials(entry.nome)}
        </div>

        <p className="text-xs font-semibold leading-tight px-1 truncate">
          {displayName(entry, currentUserId)}
        </p>

        <div className="mt-2.5 inline-flex flex-col items-center px-3 py-1.5 rounded-lg frosted-card-inner min-w-[64px]">
          <span className="text-xl font-black tabular-nums">{entry.pontuacao}</span>
          <span className="text-[8px] uppercase tracking-widest text-white/40">pts</span>
        </div>
      </FrostedCard>
    </div>
  );
}

export function RankingPodium({ podium, currentUserId }: RankingPodiumProps) {
  const byPosition = Object.fromEntries(podium.map((e) => [e.posicao, e]));

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/35 px-1 mb-3">
        Pódio
      </h3>
      <div className="flex items-end gap-2">
        {PODIUM_ORDER.map((pos) => (
          <PodiumSlot
            key={pos}
            entry={byPosition[pos]}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}