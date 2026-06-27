"use client";

import { useState } from 'react';
import { BookOpen, Target, Trophy, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppMobileHeader } from '@/components/layout/app-mobile-header';
import { MobileSideMenu } from '@/components/layout/mobile-side-menu';
import { FrostedCard } from '@/components/ui/frosted-card';
import { getTodayBrazilDateString } from '@/lib/match-time';
import {
  PONTUACAO_GRUPOS,
  PONTUACAO_KNOCKOUT,
  BONUS_CAMPEAO,
  REGRAS_SECOES,
  REGRAS_SECOES_KNOCKOUT,
} from '@/lib/bolao-regras';

type Tab = 'grupos' | 'knockout';

export default function RegrasPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('grupos');

  const isKnockout = getTodayBrazilDateString() >= '2026-06-28';

  return (
    <div className={`min-h-dvh bolao-palpites-bg bolao-palpites-page text-white relative${isKnockout || tab === 'knockout' ? ' bolao-palpites-bg--knockout' : ''}`}>
      <AppMobileHeader onMenuOpen={() => setMenuOpen(true)} knockout={isKnockout || tab === 'knockout'} />
      <MobileSideMenu open={menuOpen} onClose={() => setMenuOpen(false)} knockout={isKnockout || tab === 'knockout'} />

      <div className="relative z-10 max-w-xl mx-auto w-full px-6 py-6 pb-32">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <BookOpen size={22} className="text-violet-300/80" />
            <h1 className="text-2xl font-bold tracking-wide">Regras</h1>
          </div>
          <p className="text-sm opacity-70">Como funciona o bolão da Copa do Mundo 2026</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-2xl bg-white/5 border border-white/8">
          <button
            onClick={() => setTab('grupos')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'grupos'
                ? 'bg-white/12 text-white border border-white/15 shadow-sm'
                : 'text-white/45 hover:text-white/70'
            }`}
          >
            <Target size={15} />
            Fase de Grupos
          </button>
          <button
            onClick={() => setTab('knockout')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'knockout'
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm'
                : 'text-white/45 hover:text-white/70'
            }`}
          >
            <Flame size={15} />
            Mata a Mata
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'grupos' ? (
            <motion.div
              key="grupos"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              {/* Pontuação grupos */}
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Target size={16} className="text-emerald-300/70" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-white/35">
                    Sistema de pontuação
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  {PONTUACAO_GRUPOS.map((regra) => (
                    <FrostedCard key={regra.pontos} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`shrink-0 w-14 h-14 rounded-2xl border flex flex-col items-center justify-center ${regra.destaque}`}>
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

              {/* Regras gerais */}
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
            </motion.div>
          ) : (
            <motion.div
              key="knockout"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.22 }}
            >
              {/* Pontuação knockout */}
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Flame size={16} className="text-amber-300/70" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-white/35">
                    Pontuação · Mata a Mata
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  {PONTUACAO_KNOCKOUT.map((regra) => (
                    <FrostedCard key={regra.pontos} className="p-4 frosted-card--knockout">
                      <div className="flex items-start gap-4">
                        <div className={`shrink-0 w-14 h-14 rounded-2xl border flex flex-col items-center justify-center ${regra.destaque}`}>
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

              {/* Bônus campeão */}
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Sparkles size={16} className="text-amber-300/70" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-white/35">
                    Bônus especial
                  </h2>
                </div>
                <div
                  className="rounded-2xl border border-amber-400/30 p-4"
                  style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.10) 0%, rgba(30,18,0,0.5) 100%)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-14 h-14 rounded-2xl border flex flex-col items-center justify-center ${BONUS_CAMPEAO.destaque}`}>
                      <span className="text-xl font-black tabular-nums leading-none">{BONUS_CAMPEAO.pontos}</span>
                      <span className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">pts</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-amber-200/90">{BONUS_CAMPEAO.titulo}</h3>
                      <p className="text-sm text-white/55 mt-1 leading-relaxed">{BONUS_CAMPEAO.descricao}</p>
                      <p className="text-xs text-white/35 mt-2 italic">{BONUS_CAMPEAO.exemplo}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Regras do mata-mata */}
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Trophy size={16} className="text-amber-300/70" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-white/35">
                    Regras do mata a mata
                  </h2>
                </div>
                <div className="flex flex-col gap-4">
                  {REGRAS_SECOES_KNOCKOUT.map((secao) => (
                    <FrostedCard key={secao.id} className="p-5 frosted-card--knockout">
                      <h3 className="font-semibold text-amber-200/90 mb-3">{secao.titulo}</h3>
                      <ul className="space-y-2.5">
                        {secao.itens.map((item) => (
                          <li key={item} className="flex gap-2.5 text-sm text-white/60 leading-relaxed">
                            <span className="text-amber-400/70 shrink-0 mt-1.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </FrostedCard>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
