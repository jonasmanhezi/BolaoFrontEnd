'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FrostedCardProps {
  className?: string;
  children: ReactNode;
  knockout?: boolean;
}

export function FrostedCard({ className, children, knockout }: FrostedCardProps) {
  return (
    <div className={cn('frosted-card', knockout && 'frosted-card--knockout', className)}>
      <div className="frosted-card__blur" aria-hidden />
      <div className="frosted-card__glass" aria-hidden />
      <div className="frosted-card__shine" aria-hidden />
      <div className="frosted-card__content">{children}</div>
    </div>
  );
}