'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FrostedCardProps {
  className?: string;
  children: ReactNode;
}

export function FrostedCard({ className, children }: FrostedCardProps) {
  return (
    <div className={cn('frosted-card', className)}>
      <div className="frosted-card__blur" aria-hidden />
      <div className="frosted-card__glass" aria-hidden />
      <div className="frosted-card__shine" aria-hidden />
      <div className="frosted-card__content">{children}</div>
    </div>
  );
}