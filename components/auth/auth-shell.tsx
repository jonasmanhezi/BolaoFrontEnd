'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  children: ReactNode;
  variant?: 'splash' | 'photo';
}

export function AuthShell({ children, variant = 'photo' }: AuthShellProps) {
  const isSplash = variant === 'splash';

  return (
    <div
      className={cn(
        'min-h-dvh text-white relative isolate',
        isSplash ? 'bolao-splash-bg' : 'flex flex-col overflow-hidden'
      )}
    >
      {isSplash ? (
        <div className="bolao-splash-highlight absolute inset-0 pointer-events-none z-0" />
      ) : (
        <img
          src="/back.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
        />
      )}

      <div
        className={cn(
          'relative z-10 w-full max-w-[420px] mx-auto px-5',
          isSplash
            ? 'pt-[calc(env(safe-area-inset-top,0px)+3rem)] pb-10'
            : 'mt-auto pb-9 mb-20 flex-1 flex flex-col justify-end'
        )}
      >
        {children}
      </div>
    </div>
  );
}