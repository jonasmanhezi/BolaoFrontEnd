'use client';

import type { ReactNode } from 'react';

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-dvh flex flex-col text-white overflow-hidden relative isolate">
      <img
        src="/back.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      />

      <div className="flex-1" />

      <div className="px-4 pb-9 mb-20 relative z-10">
        <div className="w-full max-w-[440px] mx-auto">{children}</div>
      </div>
    </div>
  );
}