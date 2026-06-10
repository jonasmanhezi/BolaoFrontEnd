'use client';

import { DEFAULT_TEAM_LOGO } from '@/lib/partidas';
import type { Partida } from '@/lib/partidas';
import { partidaFinalizada, partidaTemResultado } from '@/lib/partida-status';
import type { Palpite } from '@/lib/palpites';

interface PalpiteHistoryCardProps {
  palpite: Palpite;
  partida?: Partida;
}

function TeamColumn({
  logo,
  sigla,
  name,
}: {
  logo: string;
  sigla: string;
  name: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <img
        src={logo}
        alt={name}
        className="w-10 h-10 object-contain drop-shadow-sm"
        onError={(e) => {
          const img = e.currentTarget;
          img.onerror = null;
          img.src = DEFAULT_TEAM_LOGO;
        }}
      />
      <span className="text-[10px] font-bold tracking-[0.16em] text-white/85">{sigla}</span>
    </div>
  );
}

function getPontuacaoMeta(palpite: Palpite, partida?: Partida) {
  const finalizada = !!partida && partidaFinalizada(partida);

  if (palpite.pontuacaoObtida != null && finalizada) {
    if (palpite.pontuacaoObtida > 0) {
      return {
        label: `+${palpite.pontuacaoObtida} pts`,
        className: 'text-emerald-300 bg-emerald-400/12 border-emerald-400/25',
      };
    }

    return {
      label: '0 pts',
      className: 'text-white/45 bg-white/5 border-white/10',
    };
  }

  if (partida?.status === 'EM_ANDAMENTO') {
    return {
      label: 'Ao vivo',
      className: 'text-amber-300 bg-amber-400/12 border-amber-400/25',
    };
  }

  return {
    label: 'Aguardando',
    className: 'text-amber-200/80 bg-amber-400/10 border-amber-400/20',
  };
}

export function PalpiteHistoryCard({ palpite, partida }: PalpiteHistoryCardProps) {
  const pontuacao = getPontuacaoMeta(palpite, partida);
  const showOfficialScore = !!partida && partidaTemResultado(partida);

  return (
    <div className="frosted-card">
      <div className="frosted-card__blur" aria-hidden />
      <div className="frosted-card__glass" aria-hidden />
      <div className="frosted-card__shine" aria-hidden />

      <div className="frosted-card__content p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/45 tabular-nums">
            {partida ? `${partida.horario}` : 'Partida não encontrada'}
          </span>
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${pontuacao.className}`}
          >
            {pontuacao.label}
          </span>
        </div>

        {partida ? (
          <div className="flex items-center gap-3">
            <TeamColumn logo={partida.logoCasa} sigla={partida.siglaCasa} name={partida.casa} />

            <div className="flex flex-col items-center shrink-0 px-1 min-w-[88px]">
              <span className="text-[9px] uppercase tracking-widest text-white/35 mb-1">
                Seu palpite
              </span>
              <span className="text-xl font-bold tabular-nums">
                {palpite.golsCasa} × {palpite.golsVisitante}
              </span>
              {showOfficialScore && (
                <>
                  <span className="text-[9px] uppercase tracking-widest text-white/35 mt-2 mb-1">
                    Resultado
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-white/70">
                    {partida.golsCasa} × {partida.golsVisitante}
                  </span>
                </>
              )}
            </div>

            <TeamColumn logo={partida.logoFora} sigla={partida.siglaFora} name={partida.fora} />
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-white/60">Partida #{palpite.partidaId}</p>
            <p className="text-lg font-bold tabular-nums mt-1">
              {palpite.golsCasa} × {palpite.golsVisitante}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}