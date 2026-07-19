import { getGrupoIdFromStorage } from '@/lib/grupo';
import type { Palpite } from '@/lib/palpites';
import type { Partida } from '@/lib/partidas';
import { partidaFinalizada } from '@/lib/partida-status';

// Prank para o grupo 1: Antonio Garcia aparece como campeão do bolão,
// 10 pontos à frente do Danilo, e os palpites dele viram acertos em cheio.
// Só ativa a partir de 19/07/2026 às 19h30 (horário de Brasília).
// Remover este módulo depois da brincadeira.
export const PRANK_GRUPO_ID = 1;
export const PRANK_START = new Date('2026-07-19T19:30:00-03:00');

const KNOCKOUT_START_DATE = '2026-06-28';

// Preview local: força o prank antes da data. NÃO subir como true.
const FORCE_PRANK_PREVIEW = false;

export function isPrankActive(): boolean {
  if (getGrupoIdFromStorage() !== PRANK_GRUPO_ID) return false;
  return FORCE_PRANK_PREVIEW || Date.now() >= PRANK_START.getTime();
}

// Bloqueio geral dos palpites alheios: para todos os usuários,
// a partir de 18/07/2026.
const PALPITES_LOCK_START = new Date('2026-07-18T00:00:00-03:00');

export function isPalpitesLockActive(): boolean {
  return FORCE_PRANK_PREVIEW || Date.now() >= PALPITES_LOCK_START.getTime();
}

export function isPrankChampionName(nome: string): boolean {
  const normalizado = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return normalizado.includes('antonio garcia');
}

function pontuacaoMaxima(partida: Partida): number {
  if (partida.data === '2026-07-19') return 100; // grande final, placar em cheio
  if (partida.data === '2026-07-18') return 80; // terceiro lugar, placar em cheio
  const knockout = partida.data >= KNOCKOUT_START_DATE;
  if (!knockout) return 25;
  if (partida.temPenalti && partida.winnerId != null) return 70;
  return 50;
}

/**
 * Reescreve os palpites como se o jogador tivesse cravado o placar exato
 * (e o vencedor dos pênaltis) de toda partida finalizada. Partidas
 * finalizadas sem palpite registrado ganham um palpite fabricado, para
 * nunca parecer que o jogador deixou de palpitar.
 */
export function applyPalpitesPrank(palpites: Palpite[], partidas: Partida[]): Palpite[] {
  const palpitesMap = new Map(palpites.map((p) => [p.partidaId, p]));
  const partidaIds = new Set(partidas.map((p) => p.id));
  const result: Palpite[] = [];

  for (const partida of partidas) {
    const existente = palpitesMap.get(partida.id);
    const finalizada =
      partidaFinalizada(partida) &&
      partida.golsCasa != null &&
      partida.golsVisitante != null;

    if (!finalizada) {
      if (existente) result.push(existente);
      continue;
    }

    result.push({
      ...(existente ?? { partidaId: partida.id }),
      golsCasa: partida.golsCasa!,
      golsVisitante: partida.golsVisitante!,
      palpiteWinnerId:
        partida.temPenalti && partida.winnerId != null
          ? partida.winnerId
          : (existente?.palpiteWinnerId ?? null),
      pontuacaoObtida: pontuacaoMaxima(partida),
    });
  }

  // preserva palpites de partidas que não vieram na lista
  for (const palpite of palpites) {
    if (!partidaIds.has(palpite.partidaId)) result.push(palpite);
  }

  return result;
}
