'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Crown, Eye, Medal } from 'lucide-react';
import type { RankingEntry } from '@/lib/ranking';
import {
  displayName,
  formatRankingScore,
  getInitials,
  isCurrentUserEntry,
} from '@/components/ranking/ranking-utils';
import { cn } from '@/lib/utils';

interface RankingPodiumProps {
  podium: RankingEntry[];
  currentUserId: number | null;
  onViewPalpites?: (entry: RankingEntry) => void;
}

const PODIUM_ORDER = [2, 1, 3] as const;

const COLUMN_DELAYS: Record<(typeof PODIUM_ORDER)[number], number> = {
  2: 0.08,
  1: 0.22,
  3: 0.36,
};

const PODIUM_CONFIG: Record<
  number,
  {
    blockHeight: string;
    blockWidth: string;
    numberSize: string;
    avatarSize: string;
    initialsSize: string;
    topOffset: string;
    avatarRing: string;
    avatarBg: string;
    avatarText: string;
    badgeBg: string;
    badgeBorder: string;
    badgeIcon: string;
    placeIcon: typeof Crown | typeof Medal;
    placeIconSize: number;
    scoreBadge: string;
    scoreText: string;
  }
> = {
  1: {
    blockHeight: 'h-[7.5rem]',
    blockWidth: 'w-[5.75rem]',
    numberSize: 'text-[3.25rem]',
    avatarSize: 'w-[4.5rem] h-[4.5rem]',
    initialsSize: 'text-base',
    topOffset: 'mb-3',
    avatarRing: 'border-amber-200/90',
    avatarBg: 'bg-linear-to-br from-amber-300/45 via-amber-400/25 to-amber-600/30',
    avatarText: 'text-amber-50',
    badgeBg: 'bg-linear-to-br from-amber-300 to-amber-500',
    badgeBorder: 'border-amber-100/90',
    badgeIcon: 'text-amber-950',
    placeIcon: Crown,
    placeIconSize: 15,
    scoreBadge:
      'border-amber-200/45 bg-linear-to-r from-amber-200/95 to-amber-400/90 shadow-[0_4px_14px_rgba(251,191,36,0.32)]',
    scoreText: 'text-amber-950',
  },
  2: {
    blockHeight: 'h-[5.25rem]',
    blockWidth: 'w-[5.25rem]',
    numberSize: 'text-[2.75rem]',
    avatarSize: 'w-[4rem] h-[4rem]',
    initialsSize: 'text-sm',
    topOffset: 'mb-2.5',
    avatarRing: 'border-slate-200/90',
    avatarBg: 'bg-linear-to-br from-slate-200/40 via-slate-300/25 to-slate-500/30',
    avatarText: 'text-slate-50',
    badgeBg: 'bg-linear-to-br from-slate-200 to-slate-400',
    badgeBorder: 'border-slate-100/90',
    badgeIcon: 'text-slate-800',
    placeIcon: Medal,
    placeIconSize: 14,
    scoreBadge:
      'border-slate-200/50 bg-linear-to-r from-slate-100/95 to-slate-300/90 shadow-[0_4px_14px_rgba(148,163,184,0.28)]',
    scoreText: 'text-slate-800',
  },
  3: {
    blockHeight: 'h-[4rem]',
    blockWidth: 'w-[5.25rem]',
    numberSize: 'text-[2.5rem]',
    avatarSize: 'w-[4rem] h-[4rem]',
    initialsSize: 'text-sm',
    topOffset: 'mb-2.5',
    avatarRing: 'border-orange-300/85',
    avatarBg: 'bg-linear-to-br from-orange-400/35 via-amber-700/25 to-amber-900/35',
    avatarText: 'text-orange-50',
    badgeBg: 'bg-linear-to-br from-orange-400 to-amber-700',
    badgeBorder: 'border-orange-200/85',
    badgeIcon: 'text-amber-950',
    placeIcon: Medal,
    placeIconSize: 14,
    scoreBadge:
      'border-orange-300/45 bg-linear-to-r from-orange-300/90 to-amber-600/85 shadow-[0_4px_14px_rgba(217,119,6,0.28)]',
    scoreText: 'text-amber-950',
  },
};

function PodiumAvatar({
  entry,
  position,
  isCurrentUser,
}: {
  entry: RankingEntry;
  position: number;
  isCurrentUser: boolean;
}) {
  const config = PODIUM_CONFIG[position];
  const PlaceIcon = config.placeIcon;

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center justify-center rounded-full border-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-md',
          config.avatarSize,
          config.avatarRing,
          config.avatarBg,
          isCurrentUser && 'ring-2 ring-[#7dd3fc] ring-offset-2 ring-offset-transparent'
        )}
      >
        <span className={cn('font-bold', config.avatarText, config.initialsSize)}>
          {getInitials(entry.nome)}
        </span>
      </div>

      <div
        className={cn(
          'absolute -top-1.5 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border p-1 shadow-[0_4px_12px_rgba(0,0,0,0.25)]',
          config.badgeBg,
          config.badgeBorder
        )}
        aria-hidden
      >
        <PlaceIcon
          size={config.placeIconSize}
          className={config.badgeIcon}
          strokeWidth={2.25}
          fill="currentColor"
        />
      </div>
    </div>
  );
}

function PodiumColumn({
  entry,
  position,
  currentUserId,
  animate,
  onViewPalpites,
}: {
  entry: RankingEntry | undefined;
  position: (typeof PODIUM_ORDER)[number];
  currentUserId: number | null;
  animate: boolean;
  onViewPalpites?: (entry: RankingEntry) => void;
}) {
  const config = PODIUM_CONFIG[position];

  if (!entry) {
    return (
      <div className={cn('flex flex-col items-center justify-end', config.blockWidth)}>
        <div
          className={cn(
            'ranking-podium-block w-full rounded-t-2xl',
            config.blockHeight,
            position === 1 && 'ranking-podium-block--first'
          )}
          aria-hidden
        />
      </div>
    );
  }

  const isCurrentUser = isCurrentUserEntry(entry, currentUserId);
  const delay = COLUMN_DELAYS[position];
  const Column = animate ? motion.div : 'div';
  const Info = animate ? motion.div : 'div';
  const Block = animate ? motion.div : 'div';

  return (
    <Column
      className={cn('flex min-w-0 flex-1 flex-col items-center', config.topOffset)}
      {...(animate
        ? {
            initial: { opacity: 0, y: 28 },
            animate: { opacity: 1, y: 0 },
            transition: {
              delay,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1] as const,
            },
          }
        : {})}
    >
      <Info
        className="flex flex-col items-center"
        {...(animate
          ? {
              initial: { opacity: 0, scale: 0.82, y: -14 },
              animate: { opacity: 1, scale: 1, y: 0 },
              transition: {
                delay: delay + 0.12,
                type: 'spring' as const,
                stiffness: 280,
                damping: 20,
              },
            }
          : {})}
      >
        <PodiumAvatar entry={entry} position={position} isCurrentUser={isCurrentUser} />

        <p className="mt-2.5 max-w-[6.5rem] truncate text-center text-sm font-semibold text-white">
          {displayName(entry, currentUserId)}
        </p>

        <div
          className={cn(
            'mt-2 inline-flex items-center rounded-full border px-3 py-1',
            config.scoreBadge
          )}
        >
          <span className={cn('text-sm font-bold tabular-nums', config.scoreText)}>
            {formatRankingScore(entry.pontuacao)}
          </span>
        </div>

        {onViewPalpites ? (
          <button
            type="button"
            onClick={() => onViewPalpites(entry)}
            className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/6 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/55 hover:bg-white/10 hover:text-white/80 transition-colors"
          >
            <Eye size={11} />
            Palpites
          </button>
        ) : null}
      </Info>

      <Block
        className={cn(
          'ranking-podium-block mt-4 flex w-full items-center justify-center rounded-t-2xl',
          config.blockHeight,
          config.blockWidth,
          position === 1 && 'ranking-podium-block--first'
        )}
        style={animate ? { transformOrigin: 'bottom' } : undefined}
        {...(animate
          ? {
              initial: { opacity: 0, scaleY: 0 },
              animate: { opacity: 1, scaleY: 1 },
              transition: {
                delay: delay + 0.04,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as const,
              },
            }
          : {})}
      >
        <span
          className={cn(
            'relative z-10 font-black leading-none text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
            config.numberSize
          )}
        >
          {position}
        </span>
      </Block>
    </Column>
  );
}

export function RankingPodium({ podium, currentUserId, onViewPalpites }: RankingPodiumProps) {
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;
  const byPosition = Object.fromEntries(podium.map((entry) => [entry.posicao, entry]));
  const Wrapper = animate ? motion.div : 'div';

  return (
    <Wrapper
      className="ranking-podium -mx-2 mb-2 px-2 pt-2"
      {...(animate
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.35 },
          }
        : {})}
    >
      <div className="flex items-end justify-center gap-2 sm:gap-3">
        {PODIUM_ORDER.map((position) => (
          <PodiumColumn
            key={position}
            entry={byPosition[position]}
            position={position}
            currentUserId={currentUserId}
            animate={animate}
            onViewPalpites={onViewPalpites}
          />
        ))}
      </div>
    </Wrapper>
  );
}