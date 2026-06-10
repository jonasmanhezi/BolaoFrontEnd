"use client";

import { useState } from 'react';
import { BookOpen, Target, Trophy } from 'lucide-react';
import { AppMobileHeader } from '@/components/layout/app-mobile-header';
import { MobileSideMenu } from '@/components/layout/mobile-side-menu';
import { FrostedCard } from '@/components/ui/frosted-card';
import { PONTUACAO_REGRAS, REGRAS_SECOES } from '@/lib/bolao-regras';

export default function RegrasPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bolao-palpites-bg bolao-palpites-page text-white relative">
      <AppMobileHeader onMenuOpen={() => setMenuOpen(true)} />
      <MobileSideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative z-10 max-w-xl mx-auto w-full px-6 py-6 pb-32">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <BookOpen size={22} className="text-violet-300/80" />
            <h1 className="text-2xl font-bold tracking-wide">Regras</h1>
          </div>
          <p className="text-sm opacity-70">
            Como funciona o bolão da Copa do Mundo 2026
          </p>
        </div>

        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Target size={16} className="text-emerald-300/70" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/35">
              Sistema de pontuação
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {PONTUACAO_REGRAS.map((regra) => (
              <FrostedCard key={regra.pontos} className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 w-14 h-14 rounded-2xl border flex flex-col items-center justify-center ${regra.destaque}`}
                  >
                    <span className="text-xl font-black tabular-nums leading-none">{regra.pontos}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">pts</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white/90">{regra.titulo}</h3>
                    <p className="text-sm text-white/55 mt-1 leading-relaxed">{regra.descricao}</p>
                    <p className="text-xs text-white/35 mt-2 italic">{regra.exemplo}</p>
                  </div>
                </div>
              </FrostedCard>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Trophy size={16} className="text-amber-300/70" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/35">
              Regras gerais
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {REGRAS_SECOES.map((secao) => (
              <FrostedCard key={secao.id} className="p-5">
                <h3 className="font-semibold text-white/90 mb-3">{secao.titulo}</h3>
                <ul className="space-y-2.5">
                  {secao.itens.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-white/60 leading-relaxed">
                      <span className="text-emerald-400/80 shrink-0 mt-1.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </FrostedCard>
            ))}
          </div>
        </section>

        <FrostedCard className="p-4 text-center">
          <p className="text-xs text-white/40 leading-relaxed">
            As regras seguem a lógica oficial do sistema: placar exato vale 25 pontos,
            tendência correta vale 10 e palpite errado vale 0.
          </p>
        </FrostedCard>
      </div>
    </div>
  );
}