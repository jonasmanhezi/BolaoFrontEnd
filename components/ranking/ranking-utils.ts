import type { RankingEntry } from '@/lib/ranking';

export function getInitials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function displayName(entry: RankingEntry, currentUserId: number | null): string {
  const isCurrentUser = currentUserId != null && entry.userId === currentUserId;
  return isCurrentUser ? `${entry.nome} (você)` : entry.nome;
}

export function isCurrentUserEntry(entry: RankingEntry, currentUserId: number | null): boolean {
  return currentUserId != null && entry.userId === currentUserId;
}

export function splitRanking(ranking: RankingEntry[]) {
  const sorted = [...ranking].sort((a, b) => a.posicao - b.posicao);
  const podium = sorted.filter((e) => e.posicao <= 3);
  const rest = sorted.filter((e) => e.posicao > 3);
  const leader = sorted.find((e) => e.posicao === 1) ?? sorted[0] ?? null;
  return { sorted, podium, rest, leader };
}