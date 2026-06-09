import type { Partida } from '@/lib/partidas';

export function partidaTemResultado(partida: Partida): boolean {
  return partida.golsCasa != null && partida.golsVisitante != null;
}

export function partidaAoVivo(partida: Partida): boolean {
  return partida.status === 'EM_ANDAMENTO';
}

export function partidaFinalizada(partida: Partida): boolean {
  return partida.status === 'FINALIZADA';
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