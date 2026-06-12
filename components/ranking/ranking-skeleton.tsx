'use client';

import { FrostedCard } from '@/components/ui/frosted-card';

function PodiumSkeletonColumn({
  blockHeight,
  avatarSize,
}: {
  blockHeight: string;
  avatarSize: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div className={`${avatarSize} rounded-full bg-white/10`} />
      <div className="mt-2.5 h-3.5 w-16 rounded-full bg-white/10" />
      <div className="mt-2 h-7 w-20 rounded-full bg-amber-300/15" />
      <div className={`ranking-podium-block mt-4 w-[5.25rem] rounded-t-2xl ${blockHeight}`} />
    </div>
  );
}

export function RankingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex items-end justify-center gap-2 px-2 pt-2">
        <PodiumSkeletonColumn blockHeight="h-[5.25rem]" avatarSize="w-16 h-16" />
        <PodiumSkeletonColumn blockHeight="h-[7.5rem]" avatarSize="w-[4.5rem] h-[4.5rem]" />
        <PodiumSkeletonColumn blockHeight="h-16" avatarSize="w-16 h-16" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <FrostedCard key={i} className="h-20">
            <span className="sr-only">Carregando</span>
          </FrostedCard>
        ))}
      </div>

      {[0, 1, 2, 3].map((i) => (
        <FrostedCard key={i} className="h-16">
          <span className="sr-only">Carregando</span>
        </FrostedCard>
      ))}
    </div>
  );
}