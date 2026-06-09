import type { Partida } from '@/lib/partidas';

export function formatDateLong(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const raw = utcDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
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

  const kickoff = new Date(`${partida.data}T${partida.horario}:00-03:00`);
  const diffMs = kickoff.getTime() - Date.now();

  if (diffMs <= 0) return 'Em breve';

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 1) return `EM ${hours}H`;
  if (minutes >= 1) return `EM ${minutes}MIN`;
  return 'Em breve';
}