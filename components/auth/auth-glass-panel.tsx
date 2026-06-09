'use client';

import type { ReactNode } from 'react';

interface AuthGlassPanelProps {
  children: ReactNode;
  className?: string;
}

export function AuthGlassPanel({ children, className = '' }: AuthGlassPanelProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 border border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.22)] ${className}`}
    >
      <div
        className="absolute inset-0 bg-white/14 backdrop-blur-3xl"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-linear-to-b from-white/20 via-white/10 to-white/6 pointer-events-none"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}