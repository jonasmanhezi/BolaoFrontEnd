'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Partida } from '@/lib/partidas';
import { PalpiteCtaButton } from '@/components/match/palpite-cta-button';
import { partidaTemResultado } from '@/lib/partida-status';
import type { PalpiteLocal } from '@/lib/palpites';

interface EventSide {
  sigla: string;
  nomePt: string;
  player: string;
  /** camadas de background estilo camisa do país */
  banner: string[];
  /** classes de posição/tamanho da foto (sobrepõe o padrão) */
  imgClass?: string;
}

interface VersusEvent {
  titulo: string;
  dataLabel: string;
  showCup: boolean;
  left: EventSide;
  right: EventSide;
}

const VERSUS_EVENTS: Record<string, VersusEvent> = {
  // Disputa de 3º lugar — França x Inglaterra
  '2026-07-18': {
    titulo: 'Terceiro Lugar',
    dataLabel: '18 JUL 2026',
    showCup: false,
    left: {
      sigla: 'FRA',
      nomePt: 'França',
      player: '/final/mbappe.png?v=1',
      imgClass: 'left-3 top-10 h-[118%]',
      banner: [
        // filetes dourados discretos (detalhes da camisa)
        'repeating-linear-gradient(90deg, transparent 0px, transparent 30px, rgba(212,175,55,0.18) 30px, rgba(212,175,55,0.18) 31px, transparent 31px, transparent 62px)',
        // listras tonais em dois azuis (padrão tonal da camisa)
        'repeating-linear-gradient(90deg, rgba(20,40,120,0.55) 0px, rgba(20,40,120,0.55) 31px, rgba(10,25,80,0.55) 31px, rgba(10,25,80,0.55) 62px)',
        // base: azul profundo com toque vermelho (meiões) embaixo
        'linear-gradient(180deg, rgba(8,18,60,0.55) 0%, rgba(20,40,120,0.35) 40%, rgba(120,20,30,0.3) 100%)',
      ],
    },
    right: {
      sigla: 'ENG',
      nomePt: 'Inglaterra',
      player: '/final/harry.png?v=1',
      imgClass: '-right-7 min-[430px]:-right-16 top-12 h-[110%]',
      banner: [
        // filetes vermelhos finos (detalhes da camisa)
        'repeating-linear-gradient(90deg, transparent 0px, transparent 30px, rgba(206,17,38,0.28) 30px, rgba(206,17,38,0.28) 31px, transparent 31px, transparent 62px)',
        // listras claras em dois tons de branco/gelo
        'repeating-linear-gradient(90deg, rgba(240,244,250,0.4) 0px, rgba(240,244,250,0.4) 31px, rgba(200,210,225,0.35) 31px, rgba(200,210,225,0.35) 62px)',
        // base: gelo com navy da gola no topo
        'linear-gradient(180deg, rgba(20,30,70,0.45) 0%, rgba(230,236,245,0.25) 40%, rgba(150,160,180,0.3) 100%)',
      ],
    },
  },
  // Grande Final — Espanha x Argentina
  '2026-07-19': {
    titulo: 'Grande Final',
    dataLabel: '19 JUL 2026',
    showCup: true,
    left: {
      sigla: 'ESP',
      nomePt: 'Espanha',
      player: '/final/yamal.png?v=2',
      imgClass: 'left-4 top-8 h-[120%]',
      banner: [
        // pinstripes finas douradas, como as da camisa
        'repeating-linear-gradient(90deg, transparent 0px, transparent 26px, rgba(255,196,0,0.28) 26px, rgba(255,196,0,0.28) 27px, transparent 27px, transparent 54px)',
        // listras largas em dois tons de vermelho
        'repeating-linear-gradient(90deg, rgba(198,11,30,0.55) 0px, rgba(198,11,30,0.55) 27px, rgba(150,5,20,0.55) 27px, rgba(150,5,20,0.55) 54px)',
        // base: ombro navy da camisa no topo, vermelho profundo embaixo
        'linear-gradient(180deg, rgba(23,32,84,0.5) 0%, rgba(198,11,30,0.35) 30%, rgba(120,5,18,0.3) 100%)',
      ],
    },
    right: {
      sigla: 'ARG',
      nomePt: 'Argentina',
      player: '/final/messi.png?v=2',
      banner: [
        // listras verticais celeste/branco
        'repeating-linear-gradient(90deg, rgba(108,172,228,0.55) 0px, rgba(108,172,228,0.55) 30px, rgba(240,248,255,0.4) 30px, rgba(240,248,255,0.4) 60px)',
        // profundidade: filete celeste escuro na borda de cada listra
        'repeating-linear-gradient(90deg, rgba(35,110,175,0.3) 0px, rgba(35,110,175,0.3) 4px, transparent 4px, transparent 30px)',
        // base com gradiente de profundidade
        'linear-gradient(180deg, rgba(61,143,209,0.45) 0%, rgba(108,172,228,0.3) 40%, rgba(30,80,130,0.35) 100%)',
      ],
    },
  },
};

export function isGrandeFinal(game: Partida): boolean {
  const event = VERSUS_EVENTS[game.data];
  if (!event) return false;
  const siglas = [event.left.sigla, event.right.sigla];
  return siglas.includes(game.siglaCasa) && siglas.includes(game.siglaFora);
}

interface FinalVersusFullscreenProps {
  game: Partida;
  palpite?: PalpiteLocal;
  onPalpite: () => void;
  /** Volta para a tela de palpites no dia anterior */
  onBack: () => void;
}

export function FinalVersusFullscreen({
  game,
  palpite,
  onPalpite,
  onBack,
}: FinalVersusFullscreenProps) {
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;
  const ease = [0.22, 1, 0.36, 1] as const;

  const event = VERSUS_EVENTS[game.data];
  if (!event) return null;
  const { left, right } = event;

  // Placar/gols mapeados pro lado visual, independente de quem é casa no backend
  const leftIsCasa = game.siglaCasa === left.sigla;
  const leftGols = leftIsCasa ? game.golsCasa : game.golsVisitante;
  const rightGols = leftIsCasa ? game.golsVisitante : game.golsCasa;
  const leftLogo = leftIsCasa ? game.logoCasa : game.logoFora;
  const rightLogo = leftIsCasa ? game.logoFora : game.logoCasa;

  const temPalpite = !!palpite && palpite.golsCasa !== '' && palpite.golsFora !== '';
  const palpiteLeft = leftIsCasa ? palpite?.golsCasa : palpite?.golsFora;
  const palpiteRight = leftIsCasa ? palpite?.golsFora : palpite?.golsCasa;

  return (
    <div className="relative flex h-[calc(100dvh-68px)] flex-col overflow-hidden bg-gradient-to-b from-[#2a1c05] via-[#181005] to-[#080500]">
      {/* botão voltar */}
      <motion.button
        type="button"
        onClick={onBack}
        aria-label="Voltar para os palpites"
        className="absolute left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl liquid-glass-pill text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        initial={animate ? { opacity: 0, x: -12 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: animate ? 0.3 : 0, duration: 0.4, ease }}
      >
        <ArrowLeft size={22} />
      </motion.button>

      {/* arena: jogadores + banners de cores dos países */}
      <div className="relative min-h-0 flex-[1.2] overflow-hidden">
        {/* banner do país da esquerda */}
        <motion.div
          className="absolute inset-y-0 left-0 z-0 w-[58%]"
          style={{
            background: left.banner.join(', '),
            WebkitMaskImage: 'linear-gradient(to right, black 78%, transparent 100%)',
            maskImage: 'linear-gradient(to right, black 78%, transparent 100%)',
          }}
          initial={animate ? { opacity: 0, x: -40 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: animate ? 0.05 : 0, duration: 0.7, ease }}
          aria-hidden
        />
        {/* banner do país da direita */}
        <motion.div
          className="absolute inset-y-0 right-0 z-0 w-1/2"
          style={{
            background: right.banner.join(', '),
            WebkitMaskImage: 'linear-gradient(to left, black 55%, transparent 100%)',
            maskImage: 'linear-gradient(to left, black 55%, transparent 100%)',
          }}
          initial={animate ? { opacity: 0, x: 40 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: animate ? 0.05 : 0, duration: 0.7, ease }}
          aria-hidden
        />

        {/* jogador da esquerda */}
        <motion.img
          src={left.player}
          alt={left.nomePt}
          className={`absolute z-10 w-auto max-w-none object-cover object-top drop-shadow-[0_12px_36px_rgba(0,0,0,0.75)] ${left.imgClass ?? '-left-4 top-8 h-[120%]'}`}
          initial={animate ? { opacity: 0, x: -80 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: animate ? 0.1 : 0, duration: 0.7, ease }}
        />

        {/* jogador da direita */}
        <motion.img
          src={right.player}
          alt={right.nomePt}
          className={`absolute z-10 w-auto max-w-none object-cover object-top drop-shadow-[0_12px_36px_rgba(0,0,0,0.75)] ${right.imgClass ?? '-right-4 top-8 h-[120%]'}`}
          initial={animate ? { opacity: 0, x: 80 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: animate ? 0.1 : 0, duration: 0.7, ease }}
        />

        {/* VS dourado ao centro — fonte estilizada */}
        <motion.span
          className="absolute left-1/2 top-[45%] z-30 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text px-2 text-5xl font-black italic leading-normal text-transparent"
          initial={animate ? { opacity: 0, scale: 2.4 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: animate ? 0.55 : 0, duration: 0.45, ease }}
        >
          VS
        </motion.span>

        {/* taça ao centro, entre os dois (apenas na final) */}
        {event.showCup && (
          <motion.div
            className="absolute bottom-[-10px] left-1/2 z-20 h-[40%] -translate-x-1/2"
            initial={animate ? { opacity: 0, y: 50 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animate ? 0.65 : 0, duration: 0.65, ease }}
          >
            {/* halo dourado pulsante atrás da taça */}
            <motion.div
              className="absolute left-1/2 top-1/2 h-[130%] w-[220%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(251,191,36,0.4)_0%,rgba(251,191,36,0.12)_45%,transparent_70%)]"
              animate={animate ? { opacity: [0.7, 1, 0.7], scale: [1, 1.08, 1] } : undefined}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
            <motion.img
              src="/final/cup.png?v=2"
              alt="Taça da Copa do Mundo"
              className="relative h-full w-auto object-contain brightness-110 saturate-125 drop-shadow-[0_0_14px_rgba(251,191,36,0.7)]"
              animate={animate ? { y: [0, -8, 0] } : undefined}
              transition={{ delay: 1.4, duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}

        {/* fade para o fundo escuro */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-28 bg-gradient-to-t from-[#100a02] to-transparent"
          aria-hidden
        />
      </div>

      {/* data / horário / placar */}
      <motion.div
        className="relative z-10 -mt-1 shrink-0 text-center"
        initial={animate ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animate ? 0.75 : 0, duration: 0.55, ease }}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[6px] text-amber-300/75">
          {event.titulo}
        </div>
        {partidaTemResultado(game) ? (
          <div className="mt-1 text-[56px] font-black leading-none tabular-nums tracking-tight text-white">
            {leftGols} <span className="text-amber-400">×</span> {rightGols}
          </div>
        ) : (
          <>
            <div className="mt-1 text-[44px] font-black leading-none tracking-tight text-white max-[380px]:text-[38px]">
              {event.dataLabel}
            </div>
            <div className="mt-1 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-[40px] font-black leading-none tabular-nums tracking-tight text-transparent max-[380px]:text-[34px]">
              {game.horario}
            </div>
          </>
        )}

        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-white/50">
          <img src={leftLogo} alt={left.nomePt} className="h-4 w-4 object-contain" />
          <span className="font-semibold tracking-wide">{left.nomePt}</span>
          <span className="text-white/30">·</span>
          <span className="font-semibold tracking-wide">{right.nomePt}</span>
          <img src={rightLogo} alt={right.nomePt} className="h-4 w-4 object-contain" />
        </div>

        {temPalpite && palpite && (
          <div className="mt-1.5 text-[11px] text-amber-200/70">
            Seu palpite:{' '}
            <span className="font-bold tabular-nums">
              {palpiteLeft} × {palpiteRight}
            </span>
          </div>
        )}
      </motion.div>

      {/* CTA */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-md shrink-0 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5"
        initial={animate ? { opacity: 0, y: 18 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animate ? 0.9 : 0, duration: 0.5, ease }}
      >
        <PalpiteCtaButton onClick={onPalpite} className="w-full" knockout>
          {temPalpite ? 'Alterar Palpite' : 'Dar Palpite'}
        </PalpiteCtaButton>
      </motion.div>
    </div>
  );
}
