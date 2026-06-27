'use client';

import { Menu } from 'lucide-react';

interface AppMobileHeaderProps {
  onMenuOpen: () => void;
  knockout?: boolean;
}

export function AppMobileHeader({ onMenuOpen, knockout }: AppMobileHeaderProps) {
  return (
    <header className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between backdrop-blur-sm border-b border-white/8 ${knockout ? 'bg-[#1a1000]/30' : 'bg-[#0e1238]/35'}`}>
      <button
        type="button"
        onClick={onMenuOpen}
        className="w-11 h-11 rounded-xl liquid-glass-pill flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      <img
        src="/fifa.png"
        alt="Copa do Mundo FIFA 2026"
        className="h-11 w-auto max-w-[140px] object-contain"
      />

      <div className="w-11 shrink-0" aria-hidden />
    </header>
  );
}