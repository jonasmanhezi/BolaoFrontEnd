"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TeamBadge } from '@/components/match/team-badge';
import { MatchPalpiteCard, PalpiteDeadlineBanner } from '@/components/match/match-palpite-card';
import { PalpiteCtaButton } from '@/components/match/palpite-cta-button';
import { ScoreStepper } from '@/components/match/score-stepper';
import { formatDateLong } from '@/lib/match-time';
import { CalendarDays } from 'lucide-react';
import { AppMobileHeader } from '@/components/layout/app-mobile-header';
import { MobileSideMenu } from '@/components/layout/mobile-side-menu';
import {
  Partida,
  getAllPartidas,
  getLastDataSource,
  clearPartidasCache,
  generateBrazilDates,
} from '@/lib/partidas';
import {
  partidaTemResultado,
  partidaAoVivo,
} from '@/lib/partida-status';
import {
  criarOuAtualizarPalpite,
  getPalpitesDoUsuario,
  mapPalpitesToRecord,
  findDateWithPalpite,
  type PalpiteLocal,
} from '@/lib/palpites';

export default function PalpitesPage() {
  const router = useRouter();

  const calendarDates = generateBrazilDates('2026-06-11', 10);

  const [selectedDate, setSelectedDate] = useState(calendarDates[0]);
  const [allPartidas, setAllPartidas] = useState<Partida[]>([]);
  const [dataSource, setDataSource] = useState<'backend' | 'mock'>('mock');
  const [loading, setLoading] = useState(true);
  const [palpites, setPalpites] = useState<Record<number, PalpiteLocal>>({});
  const [loadingPalpites, setLoadingPalpites] = useState(false);
  const [palpitesError, setPalpitesError] = useState('');
  const [totalPalpitesCarregados, setTotalPalpitesCarregados] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Partida | null>(null);
  const [modalGolsCasa, setModalGolsCasa] = useState('');
  const [modalGolsFora, setModalGolsFora] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const aplicarPalpites = (partidas: Partida[], lista: Awaited<ReturnType<typeof getPalpitesDoUsuario>>) => {
    const mapa = mapPalpitesToRecord(lista);
    setPalpites(mapa);
    setTotalPalpitesCarregados(lista.length);

    const dataComPalpite = findDateWithPalpite(partidas, mapa);
    if (dataComPalpite) {
      setSelectedDate((atual) => {
        const visivelTemPalpite = partidas
          .filter((p) => p.data === atual)
          .some((p) => mapa[p.id]?.golsCasa && mapa[p.id]?.golsFora);

        return visivelTemPalpite ? atual : dataComPalpite;
      });
    }
  };

  const buscarPalpites = async (partidas: Partida[]) => {
    setLoadingPalpites(true);
    setPalpitesError('');

    try {
      const palpitesDoBackend = await getPalpitesDoUsuario();
      aplicarPalpites(partidas, palpitesDoBackend);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar palpites';
      console.error('Erro ao carregar palpites:', e);
      setPalpitesError(message);
      setPalpites({});
      setTotalPalpitesCarregados(0);
    } finally {
      setLoadingPalpites(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    let ativo = true;

    const carregarDados = async () => {
      setLoading(true);
      setLoadingPalpites(true);
      setPalpitesError('');

      const palpitesPromise = getPalpitesDoUsuario().catch((e: unknown) => {
        if (!ativo) return [];
        const message = e instanceof Error ? e.message : 'Erro ao carregar palpites';
        setPalpitesError(message);
        setPalpites({});
        setTotalPalpitesCarregados(0);
        return [];
      });

      try {
        const [partidas, palpitesDoBackend] = await Promise.all([
          getAllPartidas(),
          palpitesPromise,
        ]);

        if (!ativo) return;

        setAllPartidas(partidas);
        setDataSource(getLastDataSource());

        if (getLastDataSource() === 'mock') {
          setPalpitesError((prev) =>
            prev || 'Partidas em modo mock — palpites podem não bater com os IDs reais.'
          );
        }

        aplicarPalpites(partidas, palpitesDoBackend);
      } catch (e: unknown) {
        if (!ativo) return;
        const message = e instanceof Error ? e.message : 'Erro ao carregar dados';
        console.error('Erro ao carregar dados:', e);
        setPalpitesError(message);
      } finally {
        if (ativo) {
          setLoading(false);
          setLoadingPalpites(false);
        }
      }
    };

    carregarDados();

    return () => {
      ativo = false;
    };
  }, [router]);

  const partidasDoDia = allPartidas.filter((p) => p.data === selectedDate);

  const recarregar = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    clearPartidasCache();
    setLoading(true);
    setLoadingPalpites(true);
    setPalpitesError('');

    try {
      const [partidas, palpitesDoBackend] = await Promise.all([
        getAllPartidas(),
        getPalpitesDoUsuario(),
      ]);

      setAllPartidas(partidas);
      setDataSource(getLastDataSource());
      aplicarPalpites(partidas, palpitesDoBackend);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao recarregar dados';
      setPalpitesError(message);
    } finally {
      setLoading(false);
      setLoadingPalpites(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return {
      weekday: utcDate.toLocaleDateString('pt-BR', { 
        weekday: 'short', 
        timeZone: 'America/Sao_Paulo' 
      }).toUpperCase(),
      day: day,
    };
  };

  const openPalpiteModal = (game: Partida) => {
    setSelectedGame(game);
    const current = palpites[game.id] || { golsCasa: '', golsFora: '' };
    setModalGolsCasa(current.golsCasa !== '' ? current.golsCasa : '0');
    setModalGolsFora(current.golsFora !== '' ? current.golsFora : '0');
    setModalOpen(true);
  };

  const modalGolsCasaNum = Math.max(0, parseInt(modalGolsCasa || '0', 10) || 0);
  const modalGolsForaNum = Math.max(0, parseInt(modalGolsFora || '0', 10) || 0);
  const palpiteAtualModal = selectedGame ? palpites[selectedGame.id] : undefined;
  const temPalpiteAtualModal =
    !!palpiteAtualModal &&
    palpiteAtualModal.golsCasa !== '' &&
    palpiteAtualModal.golsFora !== '';

  const closeModal = () => {
    setModalOpen(false);
    setSelectedGame(null);
    setModalGolsCasa('');
    setModalGolsFora('');
  };

  const submitPalpiteFromModal = async () => {
    if (!selectedGame) return;
    if (!modalGolsCasa || !modalGolsFora) {
      alert('Preencha os dois placares!');
      return;
    }

    const golsCasaNum = parseInt(modalGolsCasa);
    const golsForaNum = parseInt(modalGolsFora);

    try {
      const palpiteExistente = palpites[selectedGame.id];
      const salvo = await criarOuAtualizarPalpite(
        selectedGame.id,
        golsCasaNum,
        golsForaNum,
        palpiteExistente?.id
      );

      setPalpites((prev) => ({
        ...prev,
        [selectedGame.id]: {
          id: salvo.id ?? palpiteExistente?.id,
          golsCasa: modalGolsCasa,
          golsFora: modalGolsFora,
        },
      }));

      await buscarPalpites(allPartidas);
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'verifique o backend e se a partida existe';
      alert('Erro ao salvar palpite: ' + message);
    } finally {
      closeModal();
    }
  };

  return (
    <div className="min-h-dvh bolao-palpites-bg bolao-palpites-page text-white relative">

      <AppMobileHeader onMenuOpen={() => setMenuOpen(true)} />
      <MobileSideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6 pb-32">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-wide">Palpites</h1>
          <p className="text-sm opacity-70 mt-1">
            Faça seus palpites para a Copa do Mundo 2026
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium mb-3 opacity-70 tracking-widest">CALENDÁRIO</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {calendarDates.map((date) => {
              const { weekday, day } = formatDateDisplay(date);
              const isSelected = date === selectedDate;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`min-w-[58px] min-h-[52px] px-3 py-2 rounded-2xl text-center transition-all duration-300 flex-shrink-0 ${
                    isSelected
                      ? 'liquid-glass-pill-active'
                      : 'liquid-glass-pill hover:bg-white/10'
                  }`}
                >
                  <div className="text-[10px] opacity-60 tracking-widest">{weekday}</div>
                  <div className="text-2xl font-semibold tabular-nums">{day}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarDays size={20} className="text-white/50" />
            <h2 className="text-lg font-semibold tracking-tight">
              {formatDateLong(selectedDate)}
            </h2>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full liquid-glass-pill text-white/60 tabular-nums">
            {loading ? '...' : partidasDoDia.length}{' '}
            {partidasDoDia.length === 1 ? 'jogo' : 'jogos'}
          </span>
        </div>

        {(palpitesError || dataSource === 'mock') && (
          <div className="mb-4 text-[10px] flex flex-wrap items-center gap-x-3 gap-y-1 opacity-60">
            {dataSource === 'mock' && (
              <span className="text-amber-400">● Mock local (fallback)</span>
            )}
            {dataSource === 'backend' && (
              <span className="text-emerald-400">● Backend conectado</span>
            )}
            <button
              onClick={recarregar}
              className="underline hover:opacity-100"
              disabled={loading}
            >
              Recarregar
            </button>
            {palpitesError && <span className="text-red-400">{palpitesError}</span>}
          </div>
        )}

        {partidasDoDia.length === 0 ? (
          <div className="frosted-card p-8 text-center text-white/60">
            <div className="frosted-card__blur" aria-hidden />
            <div className="frosted-card__glass" aria-hidden />
            <div className="frosted-card__shine" aria-hidden />
            <p className="frosted-card__content">Nenhum jogo nesta data.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
            {partidasDoDia.map((game, index) => (
              <div key={game.id} className="flex flex-col gap-4">
                <MatchPalpiteCard
                  game={game}
                  palpite={palpites[game.id]}
                  onAction={() => openPalpiteModal(game)}
                />
                {index === 0 && <PalpiteDeadlineBanner />}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && selectedGame && (
        <div
          className="fixed inset-0 z-[100] bg-[#050716]/85 backdrop-blur-sm flex items-end justify-center"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md palpite-modal-sheet rounded-t-[28px] rounded-b-none p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-xs opacity-60">ENVIAR PALPITE</div>
                <div className="font-semibold text-lg">Confirme seu resultado</div>
              </div>
              <button 
                onClick={closeModal}
                className="text-white/60 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex items-center justify-between mb-6 px-4">
              <TeamBadge
                logo={selectedGame.logoCasa}
                sigla={selectedGame.siglaCasa}
                nome={selectedGame.casa}
                size="lg"
              />
              <div className="text-center min-w-[80px]">
                {partidaTemResultado(selectedGame) ? (
                  <div className="text-2xl font-bold tabular-nums">
                    {selectedGame.golsCasa} × {selectedGame.golsVisitante}
                  </div>
                ) : (
                  <span className="text-sm font-mono text-white/30">VS</span>
                )}
              </div>
              <TeamBadge
                logo={selectedGame.logoFora}
                sigla={selectedGame.siglaFora}
                nome={selectedGame.fora}
                size="lg"
              />
            </div>

            {partidaTemResultado(selectedGame) ? (
              <div className="mb-6 text-center rounded-2xl palpite-modal-inner py-3">
                <div className="text-[10px] uppercase tracking-widest text-white/45 mb-1">
                  {partidaAoVivo(selectedGame) ? 'Resultado parcial' : 'Resultado oficial'}
                </div>
                <div className="text-xl font-semibold tabular-nums text-white/85">
                  {selectedGame.siglaCasa} {selectedGame.golsCasa} × {selectedGame.golsVisitante}{' '}
                  {selectedGame.siglaFora}
                </div>
              </div>
            ) : null}

            {temPalpiteAtualModal && palpiteAtualModal ? (
              <div className="mb-6 text-center rounded-2xl palpite-modal-inner py-3">
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Palpite atual</div>
                <div className="text-2xl font-semibold tabular-nums text-white/85">
                  {palpiteAtualModal.golsCasa} × {palpiteAtualModal.golsFora}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4 mb-8">
              <ScoreStepper
                label={`GOLS ${selectedGame.siglaCasa}`}
                value={modalGolsCasaNum}
                onChange={(v) => setModalGolsCasa(String(v))}
              />
              <ScoreStepper
                label={`GOLS ${selectedGame.siglaFora}`}
                value={modalGolsForaNum}
                onChange={(v) => setModalGolsFora(String(v))}
              />
            </div>

            <PalpiteCtaButton onClick={submitPalpiteFromModal} className="w-full">
              {palpiteAtualModal?.id ? 'Atualizar Palpite' : 'Enviar Palpite'}
            </PalpiteCtaButton>

            <p className="text-center text-[11px] opacity-50 mt-4">
              Palpites não podem ser alterados após o início da partida
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
