import type { Partida } from '@/lib/partidas';

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/** Converte ISO do backend (LocalDateTime ou com offset) para instante absoluto. */
export function parseDataHoraPartida(raw: string): Date {
  const trimmed = raw.trim();
  const hasOffset = /[zZ]|[+\-]\d{2}:?\d{2}$/.test(trimmed);

  if (hasOffset) {
    return new Date(trimmed);
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

  const dateForBr = parseDataHoraPartida(raw);

  const data = new Intl.DateTimeFormat('sv-SE', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateForBr);

  const horario = new Intl.DateTimeFormat('sv-SE', {
    timeZone: BRAZIL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(dateForBr);

  return { data, horario };
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

export function getKickoffCountdown(partida: Partida): string {
  if (partida.status === 'EM_ANDAMENTO') return 'Ao vivo';
  if (partida.status === 'FINALIZADA') return 'Encerrado';
  if (partida.status === 'CANCELADA') return 'Cancelado';
  if (!partida.data || !partida.horario) return '';

  const kickoff = parsePartidaKickoff(partida.data, partida.horario);
  const diffMs = kickoff.getTime() - Date.now();

  if (diffMs <= 0) return 'Em breve';

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 1) return `EM ${hours}H`;
  if (minutes >= 1) return `EM ${minutes}MIN`;
  return 'Em breve';
}