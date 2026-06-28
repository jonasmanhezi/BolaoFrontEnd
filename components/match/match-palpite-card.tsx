'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronRight, Clock, Pencil } from 'lucide-react';
import { PalpiteCtaButton } from '@/components/match/palpite-cta-button';
import type { Partida } from '@/lib/partidas';
import { DEFAULT_TEAM_LOGO } from '@/lib/partidas';
import { getKickoffCountdown } from '@/lib/match-time';
import {
  partidaTemResultado,
  partidaAoVivo,
  partidaFinalizada,
  palpiteAberto,
} from '@/lib/partida-status';
import type { PalpiteLocal } from '@/lib/palpites';

interface MatchPalpiteCardProps {
  game: Partida;
  palpite?: PalpiteLocal;
  onAction: () => void;
}

function PenaltiWinner({ game, palpite }: { game: Partida; palpite: PalpiteLocal }) {
  if (palpite.palpiteWinnerId == null) return null;
  const isCasa = palpite.palpiteWinnerId === game.timeCasaId;
  const logo = isCasa ? game.logoCasa : game.logoFora;
  const sigla = isCasa ? game.siglaCasa : game.siglaFora;
  return (
    <div className="flex items-center justify-center gap-1 mt-1">
      <span className="text-[9px] text-amber-300/60 uppercase tracking-widest">pen:</span>
      <img src={logo} alt={sigla} className="w-3.5 h-3.5 object-contain" />
      <span className="text-[10px] font-bold text-amber-300/90">{sigla}</span>
    </div>
  );
}

function MiniFlag({ logo, alt }: { logo: string; alt: string }) {
  return (
    <img
      src={logo}
      alt={alt}
      className="w-5 h-5 object-contain rounded-sm"
      onError={(e) => {
        const img = e.currentTarget;
        img.onerror = null;
        img.src = DEFAULT_TEAM_LOGO;
      }}
    />
  );
}

export function MatchPalpiteCard({ game, palpite, onAction }: MatchPalpiteCardProps) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const intervalId = window.setInterval(tick, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const hasPalpite = !!palpite && palpite.golsCasa !== '' && palpite.golsFora !== '';
  const showOfficialScore = partidaTemResultado(game);
  const aoVivo = partidaAoVivo(game);
  const finalizada = partidaFinalizada(game);
  const aberto =
    nowMs == null
      ? game.status === 'AGENDADA' || game.status == null
      : palpiteAberto(game, nowMs);
  const countdown = nowMs == null ? '' : getKickoffCountdown(game, nowMs);
  const showPalpiteEncerradosBanner = !aberto && !aoVivo && !finalizada;

  const isKnockout = game.data >= '2026-06-28';

  return (
    <div className={`frosted-card${isKnockout ? ' frosted-card--knockout' : ''}`}>
      <div className="frosted-card__blur" aria-hidden />
      <div className="frosted-card__glass" aria-hidden />
      <div className="frosted-card__shine" aria-hidden />

      <div className="frosted-card__content">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 text-sm text-white/75">
            <Clock size={15} className="opacity-60" />
            <span className="font-medium tabular-nums">{game.horario}</span>
          </div>
          <div className="flex items-center gap-2">
            {isKnockout ? (
              <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300/90 border border-amber-400/25">
                Eliminatória
              </span>
            ) : (
              <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/8 text-white/55 border border-white/15">
                Fase de Grupos
              </span>
            )}
            <span className="text-xs font-semibold tracking-wide text-white/45 uppercase">
              {countdown}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 pb-4">
          <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <img
                src={game.logoCasa}
                alt={game.casa}
                className="w-12 h-12 object-contain drop-shadow-sm"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = DEFAULT_TEAM_LOGO;
                }}
              />
              <span className="text-[11px] font-bold tracking-[0.18em] text-white/90">
                {game.siglaCasa}
              </span>
            </div>

            <div className="flex flex-col items-center shrink-0 px-1">
              {showOfficialScore ? (
                <>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
                    {aoVivo ? 'Ao vivo' : finalizada ? 'Resultado final' : 'Placar'}
                  </span>
                  <span className="text-lg font-bold tabular-nums">
                    {game.golsCasa} × {game.golsVisitante}
                  </span>
                  {game.temPenalti && game.penaltiCasa != null && game.penaltiVisitante != null && (
                    <>
                      <span className="text-[10px] tabular-nums text-amber-300/80 font-semibold mt-0.5">
                        ({game.penaltiCasa} × {game.penaltiVisitante})
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-amber-300/60 mt-0.5">
                        Pênaltis
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-xs text-white/40 font-medium">Vs</span>
              )}
            </div>

            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <img
                src={game.logoFora}
                alt={game.fora}
                className="w-12 h-12 object-contain drop-shadow-sm"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = DEFAULT_TEAM_LOGO;
                }}
              />
              <span className="text-[11px] font-bold tracking-[0.18em] text-white/90">
                {game.siglaFora}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 shrink-0 w-[72px]">
            {hasPalpite ? (
              <>
                <div className="w-10 h-10 rounded-xl frosted-card-inner bg-emerald-500/15 border-emerald-400/30 flex items-center justify-center">
                  <Check size={18} className="text-emerald-300" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-medium text-emerald-400 text-center leading-tight">
                  Palpite feito
                </span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl frosted-card-inner" />
                <span className="text-[10px] text-white/40 text-center leading-tight">
                  Sem palpite
                </span>
              </>
            )}
          </div>
        </div>

        {finalizada && hasPalpite ? (
          <div className="w-[calc(100%-2rem)] mx-4 mb-4 rounded-xl frosted-card-inner px-4 py-3">
            <p className="text-[10px] font-semibold tracking-widest text-white/45 text-center mb-2">
              SEU PALPITE
            </p>
            <div className="flex items-center gap-1.5 justify-center">
              <MiniFlag logo={game.logoCasa} alt={game.casa} />
              <span className="text-sm font-bold tabular-nums">{palpite.golsCasa}</span>
              <span className="text-white/30 text-xs mx-0.5">×</span>
              <MiniFlag logo={game.logoFora} alt={game.fora} />
              <span className="text-sm font-bold tabular-nums">{palpite.golsFora}</span>
            </div>
            <PenaltiWinner game={game} palpite={palpite} />
          </div>
        ) : null}

        {showPalpiteEncerradosBanner ? (
          <div className="w-[calc(100%-2rem)] mx-4 mb-4 rounded-xl frosted-card-inner px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-200/80">
              Palpites encerrados
            </p>
            <p className="text-[11px] text-white/45 mt-1">
              Prazo fechou 5 minutos antes do jogo
            </p>
          </div>
        ) : finalizada ? null : aberto && hasPalpite ? (
          <button
            type="button"
            onClick={onAction}
            className="frosted-card-inner w-[calc(100%-2rem)] mx-4 mb-4 flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.08] transition-colors text-left"
          >
            <span className="text-[10px] font-semibold tracking-widest text-white/50 shrink-0">
              SEU PALPITE:
            </span>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className="flex items-center gap-1.5 justify-center">
                <MiniFlag logo={game.logoCasa} alt={game.casa} />
                <span className="text-sm font-bold tabular-nums">{palpite.golsCasa}</span>
                <span className="text-white/30 text-xs mx-0.5">vs</span>
                <MiniFlag logo={game.logoFora} alt={game.fora} />
                <span className="text-sm font-bold tabular-nums">{palpite.golsFora}</span>
              </div>
              <PenaltiWinner game={game} palpite={palpite} />
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-white/45">
              <Pencil size={14} />
              <ChevronRight size={16} />
            </div>
          </button>
        ) : aoVivo && hasPalpite ? (
          <div className="frosted-card-inner w-[calc(100%-2rem)] mx-4 mb-4 flex items-center gap-3 px-3 py-3 rounded-xl text-left">
            <span className="text-[10px] font-semibold tracking-widest text-white/50 shrink-0">
              SEU PALPITE:
            </span>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className="flex items-center gap-1.5 justify-center">
                <MiniFlag logo={game.logoCasa} alt={game.casa} />
                <span className="text-sm font-bold tabular-nums">{palpite.golsCasa}</span>
                <span className="text-white/30 text-xs mx-0.5">vs</span>
                <MiniFlag logo={game.logoFora} alt={game.fora} />
                <span className="text-sm font-bold tabular-nums">{palpite.golsFora}</span>
              </div>
              <PenaltiWinner game={game} palpite={palpite} />
            </div>
          </div>
        ) : (
          <PalpiteCtaButton
            onClick={onAction}
            className="w-[calc(100%-2rem)] mx-4 mb-4"
            knockout={isKnockout}
          >
            Enviar Palpite
          </PalpiteCtaButton>
        )}
      </div>
    </div>
  );
}

export function PalpiteDeadlineBanner() {
  return (
    <div className="frosted-banner">
      <div className="frosted-banner__blur" aria-hidden />
      <div className="frosted-banner__glass" aria-hidden />

      <div className="frosted-banner__content flex items-center gap-3 px-4 py-3">
        <p className="flex-1 text-xs text-amber-100/85 leading-relaxed">
          Os palpites se encerram 5 minutos antes de cada jogo.
        </p>
        <div className="shrink-0 flex flex-col items-center justify-center px-2.5 py-1 rounded-xl frosted-card-inner bg-amber-500/12 border-amber-400/25 min-w-[52px]">
          <span className="text-lg font-bold text-amber-300 leading-none">5</span>
          <span className="text-[9px] text-amber-200/70 uppercase">minutos</span>
        </div>
      </div>
    </div>
  );
}