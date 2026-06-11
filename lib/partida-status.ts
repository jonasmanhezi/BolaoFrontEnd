import type { Partida } from '@/lib/partidas';
import { parsePartidaKickoff } from '@/lib/match-time';

/** Must match backend {@code PalpiteDeadlinePolicy.MINUTOS_ANTES_KICKOFF}. */
export const PALPITE_CLOSE_MINUTES_BEFORE = 5;

export function partidaTemResultado(partida: Partida): boolean {
  return partida.golsCasa != null && partida.golsVisitante != null;
}

export function partidaAoVivo(partida: Partida): boolean {
  return partida.status === 'EM_ANDAMENTO';
}

export function partidaFinalizada(partida: Partida): boolean {
  return partida.status === 'FINALIZADA';
}

export function getPalpiteDeadlineMs(partida: Partida): number | null {
  if (!partida.data || !partida.horario) return null;
  const kickoff = parsePartidaKickoff(partida.data, partida.horario);
  return kickoff.getTime() - PALPITE_CLOSE_MINUTES_BEFORE * 60 * 1000;
}

/** True while status is AGENDADA and current time is before kickoff minus 5 minutes. */
export function palpiteAberto(partida: Partida, nowMs: number = Date.now()): boolean {
  if (partida.status && partida.status !== 'AGENDADA') return false;
  const deadlineMs = getPalpiteDeadlineMs(partida);
  if (deadlineMs == null) return false;
  return nowMs < deadlineMs;
}

export function getStatusLabel(status?: Partida['status']): string {
  switch (status) {
    case 'EM_ANDAMENTO':
      return 'Ao vivo';
    case 'FINALIZADA':
      return 'Finalizado';
    case 'CANCELADA':
      return 'Cancelado';
    case 'AGENDADA':
    default:
      return 'Agendado';
  }
}

export function getStatusColor(status?: Partida['status']): string {
  switch (status) {
    case 'EM_ANDAMENTO':
      return 'text-amber-300 bg-amber-400/15 border-amber-400/30';
    case 'FINALIZADA':
      return 'text-sky-300 bg-sky-400/15 border-sky-400/30';
    case 'CANCELADA':
      return 'text-red-300 bg-red-400/15 border-red-400/30';
    case 'AGENDADA':
    default:
      return 'text-white/50 bg-white/5 border-white/10';
  }
}