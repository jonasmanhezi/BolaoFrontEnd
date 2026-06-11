'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, History, Home, Trophy, LogOut, X } from 'lucide-react';
import { clearGrupoSession, getGrupoNomeFromStorage } from '@/lib/grupo';

interface MobileSideMenuProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/palpites', label: 'Palpites', icon: Home },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/historico', label: 'Histórico', icon: History },
  { href: '/regras', label: 'Regras', icon: BookOpen },
];

export function MobileSideMenu({ open, onClose }: MobileSideMenuProps) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const grupoNome = getGrupoNomeFromStorage();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    clearGrupoSession();
    window.location.href = '/login';
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed top-0 left-0 z-[90] h-dvh w-[min(82vw,300px)] flex flex-col border-r border-white/10 bg-[#0e1238]/95 backdrop-blur-2xl shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="min-w-0">
            <img src="/fifa.png" alt="Copa do Mundo" className="h-10 w-auto object-contain" />
            {grupoNome && (
              <p className="text-[11px] text-white/50 mt-1 truncate">{grupoNome}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl liquid-glass-pill flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/12 text-white border border-white/15'
                    : 'text-white/65 hover:bg-white/8 hover:text-white'
                }`}
              >
                <Icon size={20} className={active ? 'text-white' : 'text-white/50'} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-8 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-red-300/90 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}