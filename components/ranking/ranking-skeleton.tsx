'use client';

import { FrostedCard } from '@/components/ui/frosted-card';

export function RankingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <FrostedCard key={i} className="h-20">
            <span className="sr-only">Carregando</span>
          </FrostedCard>
        ))}
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <FrostedCard key={i} className="flex-1 h-36">
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