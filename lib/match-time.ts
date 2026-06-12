import type { Partida } from '@/lib/partidas';

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

const NAIVE_ISO_RE =
  /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/;
const HAS_OFFSET_RE = /(?:[zZ]|[+\-]\d{2}:?\d{2}(?::?\d{2})?)$/;

function formatInstantToBrazil(date: Date): { data: string; horario: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00';

  return {
    data: `${get('year')}-${get('month')}-${get('day')}`,
    horario: `${get('hour')}:${get('minute')}`,
  };
}

/** Converte ISO do backend (LocalDateTime ou com offset) para instante absoluto. */
export function parseDataHoraPartida(raw: string): Date {
  const trimmed = raw.trim();

  if (HAS_OFFSET_RE.test(trimmed)) {
    return new Date(trimmed);
  }

  const naive = trimmed.match(NAIVE_ISO_RE);
  if (naive) {
    return new Date(`${naive[1]}T${naive[2]}:${naive[3]}:00-03:00`);
  }

  const normalized = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
  return new Date(`${normalized}-03:00`);
}

export function parsePartidaKickoff(data: string, horario: string): Date {
  const normalizedTime = horario.length === 5 ? `${horario}:00` : horario;
  return new Date(`${data}T${normalizedTime}-03:00`);
}

export function formatPartidaDataHora(raw: string | null): { data: string; horario: string } {
  if (!raw) return { data: '', horario: '' };
  return formatInstantToBrazil(parseDataHoraPartida(raw.trim()));
}

export function getTodayBrazilDateString(now: Date = new Date()): string {
  return formatInstantToBrazil(now).data;
}

export type CalendarDayMarker = 'past' | 'today' | 'future';

export function getCalendarDayMarker(
  dateStr: string,
  todayStr: string = getTodayBrazilDateString()
): CalendarDayMarker {
  if (dateStr < todayStr) return 'past';
  if (dateStr === todayStr) return 'today';
  return 'future';
}

export function resolveDefaultCalendarDate(
  dates: string[],
  todayStr: string = getTodayBrazilDateString()
): string {
  if (dates.length === 0) return todayStr;
  if (todayStr < dates[0]) return dates[0];
  if (todayStr > dates[dates.length - 1]) return dates[dates.length - 1];
  return todayStr;
}

export function formatDateLong(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const raw = utcDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    timeZone: BRAZIL_TIMEZONE,
  });

  return raw
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getKickoffCountdown(partida: Partida, nowMs?: number): string {
  if (partida.status === 'EM_ANDAMENTO') return 'Ao vivo';
  if (partida.status === 'FINALIZADA') return 'Encerrado';
  if (partida.status === 'CANCELADA') return 'Cancelado';
  if (!partida.data || !partida.horario) return '';

  const kickoff = parsePartidaKickoff(partida.data, partida.horario);
  const diffMs = kickoff.getTime() - (nowMs ?? Date.now());

  if (diffMs <= 0) return 'Em breve';

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 1) return `EM ${hours}H`;
  if (minutes >= 1) return `EM ${minutes}MIN`;
  return 'Em breve';
}