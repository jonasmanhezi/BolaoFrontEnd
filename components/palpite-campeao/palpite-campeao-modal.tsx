'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, ArrowLeft, X, Flame, Search, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_TEAM_LOGO } from '@/lib/partidas';
import {
  getMeuPalpiteCampeao,
  getTimes,
  registrarPalpiteCampeao,
  type Time,
} from '@/lib/palpite-campeao';

const WINDOW_START = '2026-06-27';
const WINDOW_END = '2026-06-29';

function isWithinWindow(today: string) {
  return today >= WINDOW_START && today <= WINDOW_END;
}

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

function getNomePt(nome: string): string {
  return NAMES_PT[nome] ?? nome;
}

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

type Step = 'announcement' | 'selecting' | 'success';

interface PalpiteCampeaoModalProps {
  todayBrazil: string;
}

export function PalpiteCampeaoModal({ todayBrazil }: PalpiteCampeaoModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('announcement');
  const [times, setTimes] = useState<Time[]>([]);
  const [selectedTime, setSelectedTime] = useState<Time | null>(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isWithinWindow(todayBrazil)) return;

    const token = localStorage.getItem('token');
    const grupoId = localStorage.getItem('grupoId');
    if (!token || !grupoId) return;

    let cancelled = false;
    getMeuPalpiteCampeao()
      .then((palpite) => {
        if (!cancelled && !palpite) setOpen(true);
      })
      .catch(() => {
        // Não foi possível confirmar — abre o modal.
        // Se o usuário já palpitou, o POST vai retornar 400 com mensagem amigável.
        if (!cancelled) setOpen(true);
      });

    return () => {
      cancelled = true;
    };
  }, [todayBrazil]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const dismiss = () => {
    setOpen(false);
  };

  const goToSelection = async () => {
    setStep('selecting');
    if (times.length > 0) return;
    setLoadingTimes(true);
    try {
      const data = await getTimes();
      setTimes(data);
    } catch {
      toast.error('Não foi possível carregar os times. Tente de novo.');
      setStep('announcement');
    } finally {
      setLoadingTimes(false);
    }
  };

  const confirmar = async () => {
    if (!selectedTime) return;
    setSubmitting(true);
    try {
      await registrarPalpiteCampeao(selectedTime.id);
      setStep('success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao registrar palpite';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] bg-[#0a0600]/85 backdrop-blur-md flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={step === 'success' ? () => setOpen(false) : undefined}
        >
          <motion.div
            className="relative w-full max-w-md rounded-t-[28px] sm:rounded-[28px] overflow-hidden border border-amber-400/20 shadow-[0_-8px_60px_rgba(0,0,0,0.6)]"
            style={{
              background:
                'radial-gradient(120% 80% at 50% 0%, rgba(251,191,36,0.12) 0%, transparent 55%), linear-gradient(180deg, #1c1100 0%, #0c0700 100%)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-white/15" />
            </div>

            <div className="px-6 pb-9 pt-3">
              <AnimatePresence mode="wait">
                {step === 'announcement' && (
                  <motion.div
                    key="announcement"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AnnouncementStep onSelect={goToSelection} onDismiss={dismiss} />
                  </motion.div>
                )}
                {step === 'selecting' && (
                  <motion.div
                    key="selecting"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SelectingStep
                      times={times}
                      loading={loadingTimes}
                      selected={selectedTime}
                      submitting={submitting}
                      onSelect={setSelectedTime}
                      onConfirm={confirmar}
                      onBack={() => setStep('announcement')}
                    />
                  </motion.div>
                )}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SuccessStep time={selectedTime} onClose={() => setOpen(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PointRow({
  label,
  detail,
  points,
  highlight,
  delay,
}: {
  label: string;
  detail?: string;
  points: string;
  highlight?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`flex items-center justify-between rounded-2xl px-4 py-3 border ${
        highlight
          ? 'border-amber-400/35 bg-amber-400/10'
          : 'border-white/8 bg-white/[0.03]'
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm text-white/85 leading-tight">{label}</p>
        {detail && <p className="text-[11px] text-white/45 mt-0.5">{detail}</p>}
      </div>
      <span
        className={`shrink-0 ml-3 font-bold tabular-nums ${
          highlight ? 'text-amber-300 text-lg' : 'text-white/80'
        }`}
      >
        {points}
      </span>
    </motion.div>
  );
}

function AnnouncementStep({
  onSelect,
  onDismiss,
}: {
  onSelect: () => void;
  onDismiss: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-amber-300">
          <Flame size={12} />
          Mata-mata
        </span>
        <button
          onClick={onDismiss}
          className="text-white/35 hover:text-white/70 transition-colors -mr-1"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>

      <h2 className="text-[22px] leading-tight font-extrabold text-white mb-2">
        Agora o bicho vai pegar! 🔥
      </h2>
      <p className="text-sm text-white/65 mb-5 leading-relaxed">
        Começou o <span className="text-amber-300 font-semibold">mata-mata</span> e as regras
        mudaram. Cada palpite vale muito mais a partir de agora.
      </p>

      <div className="flex flex-col gap-2 mb-4">
        <PointRow
          label="Acertou quem venceu"
          detail="Só o vencedor da partida"
          points="20 pts"
          delay={0.1}
        />
        <PointRow
          label="Cravou o placar exato"
          detail="Resultado certinho"
          points="50 pts"
          delay={0.18}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.3 }}
        className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/12 to-amber-500/5 px-4 py-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={15} className="text-amber-300" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Palpite às cegas · 100 pts
          </span>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">
          Diga agora quem vai levantar a taça. O palpite fecha em 2 dias e quem cravar o campeão
          leva <span className="text-amber-300 font-bold">100 pontos</span> de bônus.
        </p>
      </motion.div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={onSelect}
          className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-[#1c1100] transition-all active:scale-[0.98]
            bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400
            shadow-[0_6px_24px_rgba(251,191,36,0.35)] hover:shadow-[0_8px_30px_rgba(251,191,36,0.45)]
            flex items-center justify-center gap-2"
        >
          <Trophy size={17} />
          Chutar o campeão
        </button>
        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded-xl text-sm text-white/45 hover:text-white/70 transition-colors"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}

function SelectingStep({
  times,
  loading,
  selected,
  submitting,
  onSelect,
  onConfirm,
  onBack,
}: {
  times: Time[];
  loading: boolean;
  selected: Time | null;
  submitting: boolean;
  onSelect: (t: Time) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return times;
    return times.filter(
      (t) => normalize(t.nome).includes(q) || normalize(getNomePt(t.nome)).includes(q)
    );
  }, [times, query]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft size={19} />
        </button>
        <div className="min-w-0">
          <div className="text-[10px] text-amber-300/70 uppercase tracking-widest font-semibold">
            Palpite às cegas
          </div>
          <div className="font-bold text-white leading-tight">Quem vai ser campeão?</div>
        </div>
      </div>

      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar seleção..."
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/40 transition-colors"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-[88px] rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-white/40 mb-5">
          Nenhuma seleção encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 mb-5 max-h-[280px] overflow-y-auto pr-1 -mr-1">
          {filtered.map((time) => {
            const isSelected = selected?.id === time.id;
            return (
              <button
                key={time.id}
                onClick={() => onSelect(time)}
                className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all text-center ${
                  isSelected
                    ? 'border-amber-400/60 bg-amber-400/15 shadow-[0_0_14px_rgba(251,191,36,0.25)]'
                    : 'border-white/8 bg-white/[0.03] hover:bg-white/8 active:scale-[0.97]'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                    <Check size={11} strokeWidth={3} className="text-[#1c1100]" />
                  </span>
                )}
                <img
                  src={time.logo}
                  alt={time.nome}
                  className="w-9 h-9 object-contain"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = DEFAULT_TEAM_LOGO;
                  }}
                />
                <span className="text-[10px] font-semibold text-white/80 leading-tight line-clamp-2">
                  {getNomePt(time.nome)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={!selected || submitting}
        className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98]
          bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-[#1c1100]
          shadow-[0_6px_24px_rgba(251,191,36,0.35)]
          disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none
          flex items-center justify-center gap-2"
      >
        {submitting ? (
          'Registrando...'
        ) : selected ? (
          <>
            <Trophy size={16} />
            Confirmar {getNomePt(selected.nome)}
          </>
        ) : (
          'Escolha uma seleção'
        )}
      </button>
      <p className="text-center text-[11px] text-white/35 mt-3">
        Você só pode palpitar uma vez. Escolha com sabedoria.
      </p>
    </div>
  );
}

function SuccessStep({ time, onClose }: { time: Time | null; onClose: () => void }) {
  return (
    <div className="text-center py-2">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 220, delay: 0.05 }}
        className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center"
      >
        <Trophy size={32} className="text-amber-300" />
      </motion.div>
      <h2 className="text-xl font-extrabold text-white mb-2">Palpite cravado! 🎉</h2>
      {time && (
        <div className="flex flex-col items-center gap-2 mb-4">
          <img
            src={time.logo}
            alt={time.nome}
            className="w-14 h-14 object-contain"
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src = DEFAULT_TEAM_LOGO;
            }}
          />
          <p className="text-amber-300 font-bold text-lg">{getNomePt(time.nome)}</p>
        </div>
      )}
      <p className="text-sm text-white/60 mb-6 leading-relaxed">
        Se a sua seleção levantar a taça, são{' '}
        <span className="text-amber-300 font-bold">100 pontos</span> direto na sua conta. Boa sorte!
      </p>
      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-xl font-semibold text-sm text-white/85 border border-white/15 hover:bg-white/8 transition-colors"
      >
        Fechar
      </button>
    </div>
  );
}
