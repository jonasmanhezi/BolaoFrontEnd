'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Crown, Sparkles, X } from 'lucide-react';
import type { RankingEntry } from '@/lib/ranking';
import { formatRankingScore, getInitials } from '@/components/ranking/ranking-utils';
import { isPrankActive, isPrankChampionName } from '@/lib/prank';

const AUTO_DISMISS_MS = 5200;

// A partir deste momento o popup passa a celebrar o campeão do bolão.
const CHAMPION_MODE_START = new Date('2026-07-19T19:30:00-03:00');
// Preview local: força o modo campeão antes da data. NÃO subir como true.
const FORCE_CHAMPION_PREVIEW = false;

// Duração de cada ato da sequência do prank (Antonio → VAR → Danilo).
const FAKE_PHASE_MS = 5000;
const VAR_PHASE_MS = 4500;

type Phase = 'fake' | 'var' | 'real' | 'single';

interface RankingAuraPopupProps {
  /** Líder exibido no ranking (durante o prank, o "campeão" falso). */
  leader: RankingEntry | null;
  /** Líder real vindo da API (revelado após o VAR). */
  realLeader: RankingEntry | null;
  isCurrentUser: boolean;
  isRealLeaderCurrentUser: boolean;
  /** Dispara a abertura quando vira true (ex.: depois do ranking carregar). */
  trigger: boolean;
  /** Chamado quando o VAR "corrige" o resultado — a página volta ao ranking real. */
  onPrankReveal?: () => void;
}

function ChampionContent({
  leader,
  isCurrentUser,
  championMode,
  animate,
  badge,
  frase,
  sub,
}: {
  leader: RankingEntry;
  isCurrentUser: boolean;
  championMode: boolean;
  animate: boolean;
  badge: string;
  frase: string;
  sub: string;
}) {
  void championMode;
  return (
    <div className="relative z-10 flex flex-col items-center px-7 pt-10 pb-9">
      {/* badge topo */}
      <motion.div
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 mb-7"
        initial={animate ? { opacity: 0, y: -8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Sparkles size={12} className="text-amber-300" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
          {badge}
        </span>
      </motion.div>

      {/* avatar com aura */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* anel cônico girando */}
        {animate && (
          <div className="absolute w-36 h-36 rounded-full aura-conic blur-[2px] opacity-80" />
        )}
        {/* pulsos */}
        {animate &&
          [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-amber-400/40"
              style={{ width: 96, height: 96 }}
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 2.1, opacity: 0 }}
              transition={{
                duration: 2.4,
                delay: i * 0.8,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}

        <motion.div
          className="relative w-24 h-24 rounded-full border-[3px] border-amber-300/80 bg-gradient-to-br from-amber-400/50 via-amber-500/30 to-orange-400/30 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.6)]"
          initial={animate ? { scale: 0 } : false}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
        >
          <span className="text-2xl font-black text-white drop-shadow">
            {getInitials(leader.nome)}
          </span>

          {/* coroa flutuante */}
          <motion.div
            className="absolute -top-7 left-1/2 -translate-x-1/2"
            initial={animate ? { y: -10, opacity: 0 } : false}
            animate={animate ? { y: [-2, -8, -2], opacity: 1 } : { opacity: 1 }}
            transition={
              animate
                ? { y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, opacity: { delay: 0.4 } }
                : undefined
            }
          >
            <Crown size={32} className="text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]" fill="currentColor" />
          </motion.div>
        </motion.div>
      </div>

      {/* nome */}
      <motion.p
        className="text-lg font-bold text-white text-center mb-1"
        initial={animate ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {isCurrentUser ? `${leader.nome} (você)` : leader.nome}
      </motion.p>

      {/* frase */}
      <motion.h2
        className="text-3xl font-black tracking-tight text-center mb-1 aura-text"
        initial={animate ? { opacity: 0, scale: 0.9 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45, type: 'spring', damping: 14 }}
      >
        {frase}
      </motion.h2>

      <motion.p
        className="text-sm text-white/55 text-center mb-6"
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        {sub}
      </motion.p>

      {/* pontuação */}
      <motion.div
        className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-white/5 px-5 py-2.5"
        initial={animate ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-2xl font-black tabular-nums text-white">
          {formatRankingScore(leader.pontuacao)}
        </span>
        <span className="text-xs text-white/45 uppercase tracking-wider">pontos</span>
      </motion.div>
    </div>
  );
}

function VarContent({ animate }: { animate: boolean }) {
  return (
    <div className="relative z-10 flex flex-col items-center px-7 pt-10 pb-9">
      <motion.div
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/15 px-3 py-1 mb-6"
        initial={animate ? { opacity: 0, y: -8 } : false}
        animate={{ opacity: 1, y: 0 }}
      >
        <span
          className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
          aria-hidden
        />
        <span className="text-[10px] font-bold uppercase tracking-widest text-sky-200">
          VAR · Revisão em andamento
        </span>
      </motion.div>

      <motion.div
        className="w-full overflow-hidden rounded-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5)] mb-6"
        initial={animate ? { opacity: 0, scale: 0.92 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 240 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/prank/var-juiz.gif"
          alt="Juiz revisando o lance no VAR"
          className="w-full h-auto block"
        />
      </motion.div>

      <motion.h2
        className="text-2xl font-black tracking-tight text-center mb-2 text-white"
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Peraí… o VAR foi chamado! 🖥️
      </motion.h2>

      <motion.p
        className="text-sm text-white/55 text-center"
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Revisando a pontuação do campeão…
      </motion.p>
    </div>
  );
}

export function RankingAuraPopup({
  leader,
  realLeader,
  isCurrentUser,
  isRealLeaderCurrentUser,
  trigger,
  onPrankReveal,
}: RankingAuraPopupProps) {
  const [open, setOpen] = useState(false);
  const [championMode, setChampionMode] = useState(false);
  const [phase, setPhase] = useState<Phase>('single');
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;

  const isFinalPhase = phase === 'single' || phase === 'real';

  useEffect(() => {
    if (!trigger || !leader) return;

    setChampionMode(FORCE_CHAMPION_PREVIEW || Date.now() >= CHAMPION_MODE_START.getTime());

    // Sequência do prank: líder exibido é o "campeão" falso e o líder real é outro.
    const prankSequence =
      isPrankActive() &&
      isPrankChampionName(leader.nome) &&
      realLeader != null &&
      realLeader.userId !== leader.userId;

    setPhase(prankSequence ? 'fake' : 'single');

    const showId = window.setTimeout(() => setOpen(true), 350);
    return () => window.clearTimeout(showId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  // Avanço dos atos da sequência do prank
  useEffect(() => {
    if (!open || phase !== 'fake') return;
    const id = window.setTimeout(() => setPhase('var'), FAKE_PHASE_MS);
    return () => window.clearTimeout(id);
  }, [open, phase]);

  useEffect(() => {
    if (!open || phase !== 'var') return;
    const id = window.setTimeout(() => {
      setPhase('real');
      onPrankReveal?.();
    }, VAR_PHASE_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phase]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    if (!isFinalPhase) return () => { document.body.style.overflow = ''; };
    const closeId = window.setTimeout(() => setOpen(false), AUTO_DISMISS_MS);
    return () => {
      document.body.style.overflow = '';
      window.clearTimeout(closeId);
    };
  }, [open, isFinalPhase]);

  // Partículas (geradas uma vez)
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 280,
        delay: Math.random() * 1.8,
        duration: 2.4 + Math.random() * 1.8,
        size: 4 + Math.random() * 6,
        hue: ['#fbbf24', '#fde68a', '#d97706'][i % 3],
      })),
    []
  );

  if (!leader) return null;

  const shownLeader = phase === 'real' ? (realLeader ?? leader) : leader;
  const shownIsCurrentUser = phase === 'real' ? isRealLeaderCurrentUser : isCurrentUser;

  const championFrase = 'É O GRANDE CAMPEÃO! 🏆';
  const auraFrase = 'ESTÁ FARMANDO AURA';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[210] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => isFinalPhase && setOpen(false)}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

          <motion.div
            key={phase === 'var' ? 'var' : phase === 'real' ? 'real' : 'gold'}
            className={`relative w-full max-w-sm rounded-[28px] overflow-hidden border ${
              phase === 'var'
                ? 'border-sky-400/25 bg-[#0b1220]/95 shadow-[0_20px_80px_rgba(56,189,248,0.25)]'
                : 'border-amber-400/25 aura-glow-bg shadow-[0_20px_80px_rgba(217,119,6,0.4)]'
            }`}
            initial={animate ? { scale: 0.8, y: 30, opacity: 0 } : false}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={animate ? { scale: 0.9, opacity: 0 } : undefined}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* partículas subindo */}
            {phase !== 'var' && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {animate &&
                  particles.map((p) => (
                    <motion.span
                      key={p.id}
                      className="absolute rounded-full"
                      style={{
                        left: '50%',
                        bottom: '38%',
                        width: p.size,
                        height: p.size,
                        background: p.hue,
                        boxShadow: `0 0 12px ${p.hue}`,
                      }}
                      initial={{ x: p.x, y: 0, opacity: 0 }}
                      animate={{ x: p.x * 1.3, y: -240, opacity: [0, 1, 0] }}
                      transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
              </div>
            )}

            {isFinalPhase && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 z-20 text-white/40 hover:text-white/80 transition-colors"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            )}

            {phase === 'var' ? (
              <VarContent animate={animate} />
            ) : (
              <ChampionContent
                leader={shownLeader}
                isCurrentUser={shownIsCurrentUser}
                championMode={championMode}
                animate={animate}
                badge={
                  phase === 'real'
                    ? 'Decisão do VAR · Campeão do bolão'
                    : championMode
                      ? 'Campeão do bolão'
                      : 'Líder do bolão'
                }
                frase={
                  phase === 'real'
                    ? championFrase
                    : championMode
                      ? championFrase
                      : auraFrase
                }
                sub={
                  phase === 'real'
                    ? shownIsCurrentUser
                      ? 'Após revisão do VAR: você é o verdadeiro campeão do bolão! 🏆'
                      : 'Após revisão do VAR: é o verdadeiro campeão do bolão! 🏆'
                    : phase === 'fake'
                      ? shownIsCurrentUser
                        ? 'Você terminou em 1º lugar e é o campeão do bolão! 🏆'
                        : 'Terminou em 1º lugar e é o campeão do bolão! 🏆'
                      : championMode
                        ? shownIsCurrentUser
                          ? 'Você terminou em 1º lugar e é o campeão do bolão! 🏆'
                          : 'Terminou em 1º lugar e é o campeão do bolão! 🏆'
                        : shownIsCurrentUser
                          ? 'Você está no topo. Aura em nível máximo. 🔥'
                          : 'Está no topo do bolão e ninguém segura. 🔥'
                }
              />
            )}

            {/* barra de auto-dismiss */}
            {animate && isFinalPhase && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
