"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { TeamBadge } from '@/components/match/team-badge';
import { MatchPalpiteCard, PalpiteDeadlineBanner } from '@/components/match/match-palpite-card';
import { PalpiteCtaButton } from '@/components/match/palpite-cta-button';
import { ScoreStepper } from '@/components/match/score-stepper';
import {
  formatDateLong,
  getTodayBrazilDateString,
  getCalendarDayMarker,
  resolveDefaultCalendarDate,
} from '@/lib/match-time';
import { CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { AppMobileHeader } from '@/components/layout/app-mobile-header';
import { MobileSideMenu } from '@/components/layout/mobile-side-menu';
import {
  Partida,
  getAllPartidas,
  CALENDAR_END_DATE,
  CALENDAR_START_DATE,
  generateBrazilDateRange,
} from '@/lib/partidas';
import {
  partidaTemResultado,
  partidaAoVivo,
  partidaFinalizada,
  palpiteAberto,
} from '@/lib/partida-status';
import {
  criarOuAtualizarPalpite,
  getPalpitesDoUsuario,
  mapPalpitesToRecord,
  type PalpiteLocal,
} from '@/lib/palpites';
import { SessionExpiredError } from '@/lib/api-fetch';
import { isSessionExpired, redirectToLogin } from '@/lib/auth-session';
import { hasGrupoSession } from '@/lib/grupo';

export default function PalpitesPage() {
  const router = useRouter();

  const calendarDates = generateBrazilDateRange(CALENDAR_START_DATE, CALENDAR_END_DATE);
  const todayBrazil = getTodayBrazilDateString();
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState(() =>
    resolveDefaultCalendarDate(calendarDates)
  );
  const [allPartidas, setAllPartidas] = useState<Partida[]>([]);
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
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;
  const ease = [0.22, 1, 0.36, 1] as const;

  const aplicarPalpites = (partidas: Partida[], lista: Awaited<ReturnType<typeof getPalpitesDoUsuario>>) => {
    const mapa = mapPalpitesToRecord(lista);
    setPalpites(mapa);
    setTotalPalpitesCarregados(lista.length);

  };

  const buscarPalpites = async (partidas: Partida[]) => {
    setLoadingPalpites(true);
    setPalpitesError('');

    try {
      const palpitesDoBackend = await getPalpitesDoUsuario();
      aplicarPalpites(partidas, palpitesDoBackend);
    } catch (e: unknown) {
      if (e instanceof SessionExpiredError) {
        return;
      }
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

    if (!hasGrupoSession()) {
      router.replace('/entrar-grupo');
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

  useEffect(() => {
    const todayButton = calendarScrollRef.current?.querySelector(
      `[data-calendar-date="${todayBrazil}"]`
    );
    todayButton?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [todayBrazil]);

  const partidasDoDia = allPartidas.filter((p) => p.data === selectedDate);

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
    if (!palpiteAberto(game)) {
      if (partidaAoVivo(game)) {
        toast.error('Apostas bloqueadas', {
          description: 'Não é possível apostar enquanto o jogo está em andamento.',
        });
      } else if (partidaFinalizada(game)) {
        toast.error('Jogo finalizado', {
          description: 'Não é mais possível enviar ou alterar palpites para esta partida.',
        });
      } else {
        toast.error('Palpites encerrados', {
          description: 'O prazo fecha 5 minutos antes do início do jogo.',
        });
      }
      return;
    }

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
    if (isSessionExpired()) return;
    if (!palpiteAberto(selectedGame)) {
      toast.error('Palpites encerrados', {
        description: 'O prazo fecha 5 minutos antes do início do jogo.',
      });
      closeModal();
      return;
    }
    if (!modalGolsCasa || !modalGolsFora) {
      toast.error('Preencha os dois placares!');
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

      const isEdicao = !!palpiteExistente?.id;
      toast.success(isEdicao ? 'Palpite atualizado!' : 'Palpite enviado!', {
        description: `${selectedGame.casa} ${golsCasaNum} × ${golsForaNum} ${selectedGame.fora}`,
      });

      closeModal();
    } catch (e: unknown) {
      if (e instanceof SessionExpiredError) {
        redirectToLogin({
          sessionExpired: true,
          toastDescription: 'Seu palpite não foi salvo. Faça login e tente novamente.',
        });
        return;
      }
      console.error(e);
      const message = e instanceof Error ? e.message : 'verifique o backend e se a partida existe';
      toast.error('Erro ao salvar palpite', { description: message });
    }
  };

  return (
    <div className="min-h-dvh bolao-palpites-bg bolao-palpites-page text-white relative">

      <AppMobileHeader onMenuOpen={() => setMenuOpen(true)} />
      <MobileSideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6 pb-32">
        <motion.div
          className="mb-6"
          initial={animate ? { opacity: 0, y: -10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <h1 className="text-2xl font-bold tracking-wide">Palpites</h1>
          <p className="text-sm opacity-70 mt-1">
            Faça seus palpites para a Copa do Mundo 2026
          </p>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={animate ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animate ? 0.08 : 0, duration: 0.45, ease }}
        >
          <h2 className="text-sm font-medium mb-3 opacity-70 tracking-widest">CALENDÁRIO</h2>
          <div
            ref={calendarScrollRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          >
            {calendarDates.map((date, index) => {
              const { weekday, day } = formatDateDisplay(date);
              const isSelected = date === selectedDate;
              const dayMarker = getCalendarDayMarker(date, todayBrazil);
              return (
                <motion.button
                  key={date}
                  data-calendar-date={date}
                  onClick={() => setSelectedDate(date)}
                  initial={animate ? { opacity: 0, y: 14 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: animate ? 0.12 + index * 0.025 : 0,
                    duration: 0.35,
                    ease,
                  }}
                  className={`min-w-[58px] min-h-[56px] px-3 py-2 rounded-2xl text-center transition-all duration-300 flex-shrink-0 ${
                    isSelected
                      ? 'liquid-glass-pill-active'
                      : 'liquid-glass-pill hover:bg-white/10'
                  }`}
                >
                  <div className="text-[10px] opacity-60 tracking-widest">{weekday}</div>
                  <div className="text-2xl font-semibold tabular-nums">{day}</div>
                  {dayMarker === 'today' ? (
                    <span
                      className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-emerald-400"
                      aria-hidden
                    />
                  ) : dayMarker === 'past' ? (
                    <span
                      className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-white/35"
                      aria-hidden
                    />
                  ) : (
                    <span className="mx-auto mt-1 block h-1.5 w-1.5" aria-hidden />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className="mb-4 flex items-center justify-between"
          initial={animate ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animate ? 0.28 : 0, duration: 0.4, ease }}
        >
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
        </motion.div>

        {palpitesError && (
          <div className="mb-4 text-[10px] text-red-400 opacity-80">
            {palpitesError}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-4 max-w-xl mx-auto w-full animate-pulse">
            {[0, 1].map((item) => (
              <div key={item} className="frosted-card h-44">
                <div className="frosted-card__blur" aria-hidden />
                <div className="frosted-card__glass" aria-hidden />
                <div className="frosted-card__shine" aria-hidden />
                <span className="sr-only">Carregando jogos</span>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {partidasDoDia.length === 0 ? (
              <motion.div
                key={`empty-${selectedDate}`}
                className="frosted-card p-8 text-center text-white/60"
                initial={animate ? { opacity: 0, y: 16 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={animate ? { opacity: 0, y: -8 } : undefined}
                transition={{ duration: 0.35, ease }}
              >
                <div className="frosted-card__blur" aria-hidden />
                <div className="frosted-card__glass" aria-hidden />
                <div className="frosted-card__shine" aria-hidden />
                <p className="frosted-card__content">Nenhum jogo nesta data.</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedDate}
                className="flex flex-col gap-4 max-w-xl mx-auto w-full"
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={animate ? { opacity: 0 } : undefined}
                transition={{ duration: 0.25 }}
              >
                {partidasDoDia.map((game, index) => (
                  <motion.div
                    key={game.id}
                    className="flex flex-col gap-4"
                    initial={animate ? { opacity: 0, y: 22 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: animate ? index * 0.08 : 0,
                      duration: 0.42,
                      ease,
                    }}
                  >
                    <MatchPalpiteCard
                      game={game}
                      palpite={palpites[game.id]}
                      onAction={() => openPalpiteModal(game)}
                    />
                    {index === 0 && (
                      <motion.div
                        initial={animate ? { opacity: 0, y: 10 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: animate ? 0.12 : 0,
                          duration: 0.38,
                          ease,
                        }}
                      >
                        <PalpiteDeadlineBanner />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && selectedGame && (
          <motion.div
            className="fixed inset-0 z-[100] bg-[#050716]/85 backdrop-blur-sm flex items-end justify-center"
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={animate ? { opacity: 0 } : undefined}
            transition={{ duration: 0.22 }}
            onClick={closeModal}
          >
            <motion.div
              className="w-full max-w-md palpite-modal-sheet rounded-t-[28px] rounded-b-none p-6 pb-10"
              initial={animate ? { y: '100%' } : false}
              animate={{ y: 0 }}
              exit={animate ? { y: '100%' } : undefined}
              transition={
                animate
                  ? { type: 'spring', damping: 30, stiffness: 320 }
                  : { duration: 0 }
              }
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

            <PalpiteCtaButton
              onClick={submitPalpiteFromModal}
              className="w-full"
              disabled={!palpiteAberto(selectedGame)}
            >
              {palpiteAtualModal?.id ? 'Atualizar Palpite' : 'Enviar Palpite'}
            </PalpiteCtaButton>

            <p className="text-center text-[11px] opacity-50 mt-4">
              {palpiteAberto(selectedGame)
                ? 'Palpites se encerram 5 minutos antes do início da partida'
                : 'Prazo encerrado para esta partida'}
            </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
