'use client';

import { ChevronUp, Crown, TrendingUp } from 'lucide-react';
import type { RankingEntry } from '@/lib/ranking';
import { formatRankingScore, getInitials } from '@/components/ranking/ranking-utils';

interface RankingYourStandingProps {
  entry: RankingEntry;
  /** Jogador imediatamente acima (null se for o líder). */
  above: RankingEntry | null;
  knockout?: boolean;
}

export function RankingYourStanding({ entry, above, knockout }: RankingYourStandingProps) {
  const isLeader = above == null;
  const gap = above ? above.pontuacao - entry.pontuacao : 0;

  return (
    <div
      className={
        knockout
          ? 'rounded-2xl border border-amber-400/40 bg-gradient-to-br from-[#3d2800]/60 to-[#1a1000]/65 backdrop-blur-md p-4 shadow-[0_0_28px_rgba(251,191,36,0.18)]'
          : 'rounded-2xl border border-[#4a62d8]/40 bg-gradient-to-br from-[#1a247d]/55 to-[#0e1238]/60 backdrop-blur-md p-4 shadow-[0_0_28px_rgba(74,98,216,0.18)]'
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={
            knockout
              ? 'shrink-0 w-11 h-11 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-sm font-bold text-white'
              : 'shrink-0 w-11 h-11 rounded-full bg-[#1a247d]/60 border border-[#4a62d8]/40 flex items-center justify-center text-sm font-bold text-white'
          }
        >
          {getInitials(entry.nome)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${knockout ? 'text-amber-300' : 'text-[#9db2ff]'}`}>
              Sua posição
            </span>
            <span className="text-sm font-bold text-white tabular-nums">#{entry.posicao}</span>
          </div>
          {isLeader ? (
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-amber-300">
              <Crown size={12} fill="currentColor" />
              <span className="font-semibold">Você está liderando! 🔥</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-white/55">
              <ChevronUp size={12} className="text-emerald-400/80" />
              <span className="tabular-nums">
                Faltam <span className="font-bold text-white">{formatRankingScore(gap)}</span>{' '}
                {gap === 1 ? 'ponto' : 'pontos'} para o #{above!.posicao}
              </span>
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-black tabular-nums text-white leading-none">
            {formatRankingScore(entry.pontuacao)}
          </div>
          <div className="flex items-center justify-end gap-1 text-[9px] uppercase tracking-widest text-white/40 mt-1">
            <TrendingUp size={10} />
            pontos
          </div>
        </div>
      </div>
    </div>
  );
}
