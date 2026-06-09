"use client";

import { GlassCard } from '@/components/ui/glass-card';
import { GlassDock } from '@/components/ui/glass-dock';
import Link from 'next/link';
import { Trophy, Home, User, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const dockItems = [
    {
      id: 'palpites',
      icon: <Home size={20} />,
      label: 'Palpites',
      href: '/palpites',
    },
    {
      id: 'ranking',
      icon: <Trophy size={20} />,
      label: 'Ranking',
      href: '/ranking',
    },
    {
      id: 'profile',
      icon: <User size={20} />,
      label: 'Profile',
      href: '/profile',
      active: true,
    },
  ];

  return (
    <div className="min-h-dvh bolao-app-bg text-white pb-24">
      <div className="sticky top-0 z-50 bg-[#0a0f18]/55 backdrop-blur-3xl border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-lg font-bold tracking-wide">Perfil</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 pb-32 space-y-6">
        <GlassCard className="p-6 !bg-white/[0.012]" glowEffect={false}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl font-bold">
              JS
            </div>
            <div>
              <div className="text-xl font-semibold">João Silva</div>
              <div className="text-sm opacity-70">@joaosilva</div>
              <div className="text-xs mt-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded inline-block">
                Nível 12 • 1.850 pontos
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="p-4 text-center !bg-white/[0.012]" glowEffect={false}>
            <div className="text-2xl font-bold">30</div>
            <div className="text-xs opacity-60">Palpites</div>
          </GlassCard>
          <GlassCard className="p-4 text-center !bg-white/[0.012]" glowEffect={false}>
            <div className="text-2xl font-bold">62%</div>
            <div className="text-xs opacity-60">Acerto</div>
          </GlassCard>
          <GlassCard className="p-4 text-center !bg-white/[0.012]" glowEffect={false}>
            <div className="text-2xl font-bold">#6</div>
            <div className="text-xs opacity-60">Posição</div>
          </GlassCard>
        </div>

        <GlassCard className="p-6 !bg-white/[0.012]" glowEffect={false}>
          <h3 className="font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Palpite Brasil 2x1 França</span>
              <span className="text-emerald-400">+50pts</span>
            </div>
            <div className="flex justify-between opacity-70">
              <span>Palpite Argentina 1x1 Inglaterra</span>
              <span>+20pts</span>
            </div>
            <div className="flex justify-between opacity-70">
              <span>Palpite Alemanha 3x0 Espanha</span>
              <span>+80pts</span>
            </div>
          </div>
        </GlassCard>

        <button className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:bg-white/5 rounded-xl transition">
          <LogOut size={18} /> Sair da conta
        </button>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <GlassDock items={dockItems} baseSize={52} maxSize={68} glassIntensity="high" />
      </div>
    </div>
  );
}
