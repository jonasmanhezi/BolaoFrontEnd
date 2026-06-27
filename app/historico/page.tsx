"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, Sparkles, Trophy } from 'lucide-react';
import { AppMobileHeader } from '@/components/layout/app-mobile-header';
import { MobileSideMenu } from '@/components/layout/mobile-side-menu';
import { PalpiteHistoryCard } from '@/components/palpite/palpite-history-card';
import { FrostedCard } from '@/components/ui/frosted-card';
import { formatDateLong, getTodayBrazilDateString } from '@/lib/match-time';
import { getAllPartidas, type Partida } from '@/lib/partidas';
import { getPalpitesDoUsuario, type Palpite } from '@/lib/palpites';
import { hasGrupoSession } from '@/lib/grupo';
import { getMeuPalpiteCampeao, getTimes, type PalpiteCampeao, type Time } from '@/lib/palpite-campeao';
import { DEFAULT_TEAM_LOGO } from '@/lib/partidas';

const FASE_LABELS: Record<number, string> = {
  1: 'Fase de Grupos',
  2: 'Oitavas de Final',
  3: 'Quartas de Final',
  4: 'Semifinal',
  5: 'Final',
};

const NAMES_PT: Record<string, string> = {
  'South Africa': 'África do Sul',
  'Algeria': 'Argélia',
  'Angola': 'Angola',
  'Argentina': 'Argentina',
  'Australia': 'Austrália',
  'Austria': 'Áustria',
  'Belgium': 'Bélgica',
  'Bolivia': 'Bolívia',
  'Bosnia & Herzegovina': 'Bósnia e Herzegovina',
  'Brazil': 'Brasil',
  'Cameroon': 'Camarões',
  'Canada': 'Canadá',
  'Cape Verde Islands': 'Cabo Verde',
  'Chile': 'Chile',
  'China': 'China',
  'Colombia': 'Colômbia',
  'Costa Rica': 'Costa Rica',
  'Croatia': 'Croácia',
  'Czech Republic': 'República Tcheca',
  'Denmark': 'Dinamarca',
  'Ecuador': 'Equador',
  'Egypt': 'Egito',
  'England': 'Inglaterra',
  'France': 'França',
  'Germany': 'Alemanha',
  'Ghana': 'Gana',
  'Greece': 'Grécia',
  'Honduras': 'Honduras',
  'Hungary': 'Hungria',
  'Iran': 'Irã',
  'Iraq': 'Iraque',
  'Italy': 'Itália',
  'Ivory Coast': 'Costa do Marfim',
  'Jamaica': 'Jamaica',
  'Japan': 'Japão',
  'Jordan': 'Jordânia',
  'Kenya': 'Quênia',
  'Mexico': 'México',
  'Morocco': 'Marrocos',
  'Netherlands': 'Holanda',
  'New Zealand': 'Nova Zelândia',
  'Nigeria': 'Nigéria',
  'Norway': 'Noruega',
  'Panama': 'Panamá',
  'Paraguay': 'Paraguai',
  'Peru': 'Peru',
  'Poland': 'Polônia',
  'Portugal': 'Portugal',
  'Qatar': 'Catar',
  'Romania': 'Romênia',
  'Russia': 'Rússia',
  'Saudi Arabia': 'Arábia Saudita',
  'Scotland': 'Escócia',
  'Senegal': 'Senegal',
  'Serbia': 'Sérvia',
  'Slovakia': 'Eslováquia',
  'Slovenia': 'Eslovênia',
  'South Korea': 'Coreia do Sul',
  'Spain': 'Espanha',
  'Sweden': 'Suécia',
  'Switzerland': 'Suíça',
  'Tunisia': 'Tunísia',
  'Turkey': 'Turquia',
  'Ukraine': 'Ucrânia',
  'Uruguay': 'Uruguai',
  'USA': 'Estados Unidos',
  'United States': 'Estados Unidos',
  'Venezuela': 'Venezuela',
  'Wales': 'País de Gales',
};

function getNomePt(nome: string) {
  return NAMES_PT[nome] ?? nome;
}

interface HistoricoItem {
  palpite: Palpite;
  partida?: Partida;
}

function buildHistorico(palpites: Palpite[], partidas: Partida[]): HistoricoItem[] {
  const partidasMap = new Map(partidas.map((p) => [p.id, p]));
  return [...palpites]
    .map((palpite) => ({ palpite, partida: partidasMap.get(palpite.partidaId) }))
    .sort((a, b) => {
      const keyA = a.partida ? `${a.partida.data}T${a.partida.horario}` : '';
      const keyB = b.partida ? `${b.partida.data}T${b.partida.horario}` : '';
      return keyB.localeCompare(keyA);
    });
}

function groupHistoricoByDate(items: HistoricoItem[]): Array<{ date: string; items: HistoricoItem[] }> {
  const groups = new Map<string, HistoricoItem[]>();
  for (const item of items) {
    const date = item.partida?.data ?? 'sem-data';
    const current = groups.get(date) ?? [];
    current.push(item);
    groups.set(date, current);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, groupItems]) => ({ date, items: groupItems }));
}

export default function HistoricoPage() {
  const router = useRouter();
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [faseFilter, setFaseFilter] = useState<number | null>(null);
  const [palpiteCampeao, setPalpiteCampeao] = useState<PalpiteCampeao | null>(null);
  const [timeCampeao, setTimeCampeao] = useState<Time | null>(null);

  const isKnockout = getTodayBrazilDateString() >= '2026-06-28';

  const fasesDisponiveis = useMemo(() => {
    const ids = new Set<number>();
    for (const item of historico) {
      if (item.partida?.faseId != null) ids.add(item.partida.faseId);
    }
    return Array.from(ids).sort((a, b) => a - b);
  }, [historico]);

  const filteredHistorico = useMemo(() => {
    if (faseFilter === null) return historico;
    return historico.filter((item) => item.partida?.faseId === faseFilter);
  }, [historico, faseFilter]);

  const groupedHistorico = useMemo(() => groupHistoricoByDate(filteredHistorico), [filteredHistorico]);

  const totalPontos = useMemo(
    () =>
      filteredHistorico.reduce((sum, item) => {
        const pontos = item.palpite.pontuacaoObtida;
        return sum + (typeof pontos === 'number' ? pontos : 0);
      }, 0),
    [filteredHistorico]
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }
    if (!hasGrupoSession()) { router.replace('/entrar-grupo'); return; }

    let cancelled = false;

    async function loadHistorico() {
      setLoading(true);
      setError('');

      try {
        const [partidas, palpites, campeao] = await Promise.all([
          getAllPartidas(),
          getPalpitesDoUsuario(),
          getMeuPalpiteCampeao().catch(() => null),
        ]);

        if (!cancelled) {
          setHistorico(buildHistorico(palpites, partidas));
          setPalpiteCampeao(campeao);

          if (campeao) {
            getTimes()
              .then((times) => {
                if (!cancelled) {
                  const time = times.find((t) => t.id === campeao.timeSelecionadoId) ?? null;
                  setTimeCampeao(time);
                }
              })
              .catch(() => {});
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erro ao carregar histórico');
          setHistorico([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistorico();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className={`min-h-dvh bolao-palpites-bg bolao-palpites-page text-white relative${isKnockout ? ' bolao-palpites-bg--knockout' : ''}`}>
      <AppMobileHeader onMenuOpen={() => setMenuOpen(true)} knockout={isKnockout} />
      <MobileSideMenu open={menuOpen} onClose={() => setMenuOpen(false)} knockout={isKnockout} />

      <div className="relative z-10 max-w-xl mx-auto w-full px-6 py-6 pb-32">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <History size={22} className="text-cyan-300/80" />
            <h1 className="text-2xl font-bold tracking-wide">Histórico</h1>
          </div>
          <p className="text-sm opacity-70">Todos os seus palpites na Copa do Mundo 2026</p>
        </div>

        {/* Palpite campeão */}
        {palpiteCampeao && (
          <div className="mb-5 rounded-2xl border border-amber-400/30 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.10) 0%, rgba(30,18,0,0.6) 100%)' }}
          >
            <div className="px-4 py-3 flex items-center gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center">
                <Trophy size={20} className="text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-0.5">
                  Palpite Campeão · 100 pts
                </p>
                {timeCampeao ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={timeCampeao.logo}
                      alt={timeCampeao.nome}
                      className="w-6 h-6 object-contain"
                      onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = DEFAULT_TEAM_LOGO; }}
                    />
                    <span className="font-semibold text-white text-sm">
                      {getNomePt(timeCampeao.nome)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-white/60">Carregando...</span>
                )}
              </div>
              <span className="shrink-0 text-[10px] text-amber-300/60 font-medium">Cravado</span>
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && historico.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <FrostedCard className="p-4 text-center">
              <div className="text-2xl font-bold tabular-nums">{filteredHistorico.length}</div>
              <div className="text-xs text-white/50 mt-1">Palpites</div>
            </FrostedCard>
            <FrostedCard className="p-4 text-center">
              <div className="text-2xl font-bold tabular-nums text-emerald-300">{totalPontos}</div>
              <div className="text-xs text-white/50 mt-1">Pontos obtidos</div>
            </FrostedCard>
          </div>
        )}

        {/* Filtros de fase */}
        {!loading && fasesDisponiveis.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
            <button
              onClick={() => setFaseFilter(null)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                faseFilter === null
                  ? 'border-white/30 bg-white/14 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:text-white/70'
              }`}
            >
              Todas as fases
            </button>
            {fasesDisponiveis.map((faseId) => {
              const active = faseFilter === faseId;
              const isKo = faseId !== 1;
              return (
                <button
                  key={faseId}
                  onClick={() => setFaseFilter(faseId)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    active
                      ? isKo
                        ? 'border-amber-400/50 bg-amber-400/15 text-amber-300'
                        : 'border-white/30 bg-white/14 text-white'
                      : 'border-white/10 bg-white/5 text-white/50 hover:text-white/70'
                  }`}
                >
                  {FASE_LABELS[faseId] ?? `Fase ${faseId}`}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/8 animate-pulse" />
            ))}
          </div>
        )}

        {/* Erro */}
        {!loading && error && (
          <FrostedCard className="p-6 text-center">
            <p className="text-red-300/90">{error}</p>
          </FrostedCard>
        )}

        {/* Vazio */}
        {!loading && !error && historico.length === 0 && (
          <FrostedCard className="p-10 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full frosted-card-inner flex items-center justify-center">
              <History size={28} className="text-white/40" />
            </div>
            <p className="font-semibold text-white/75">Nenhum palpite ainda</p>
            <p className="text-sm text-white/40 mt-2 max-w-xs mx-auto leading-relaxed">
              Faça seu primeiro palpite e ele aparecerá aqui com o resultado e a pontuação.
            </p>
            <Link
              href="/palpites"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-2xl liquid-glass-pill-active text-sm font-medium"
            >
              <Sparkles size={16} />
              Ir para Palpites
            </Link>
          </FrostedCard>
        )}

        {/* Lista */}
        {!loading && !error && historico.length > 0 && (
          <div className="flex flex-col gap-6">
            {filteredHistorico.length === 0 ? (
              <FrostedCard className="p-8 text-center">
                <p className="text-white/50 text-sm">Nenhum palpite nessa fase.</p>
              </FrostedCard>
            ) : (
              groupedHistorico.map(({ date, items }) => (
                <section key={date}>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-3 px-1">
                    {date === 'sem-data' ? 'Outros palpites' : formatDateLong(date)}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <PalpiteHistoryCard
                        key={item.palpite.id ?? `${item.palpite.partidaId}-${item.palpite.golsCasa}-${item.palpite.golsVisitante}`}
                        palpite={item.palpite}
                        partida={item.partida}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
