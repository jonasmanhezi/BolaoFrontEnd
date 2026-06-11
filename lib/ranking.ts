import { getBackendApiBase } from '@/lib/backend-url';
import { getAuthHeaders } from '@/lib/api-headers';
import { apiFetch } from '@/lib/api-fetch';

export interface RankingEntry {
  posicao: number;
  userId: number;
  nome: string;
  pontuacao: number;
}

function normalizeRankingEntry(raw: unknown): RankingEntry | null {
  if (!raw || typeof raw !== 'object') return null;

  const item = raw as Record<string, unknown>;
  const posicao = item.posicao ?? item.position;
  const userId = item.userId ?? item.user_id;
  const nome = item.nome ?? item.nomeUsuario ?? item.name;
  const pontuacao = item.pontuacao ?? item.points;

  if (posicao == null || userId == null || nome == null || pontuacao == null) {
    return null;
  }

  return {
    posicao: Number(posicao),
    userId: Number(userId),
    nome: String(nome),
    pontuacao: Number(pontuacao),
  };
}

export async function getRanking(): Promise<RankingEntry[]> {
  const res = await apiFetch(`${getBackendApiBase()}/ranking`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { message?: string }).message || `Erro ao carregar ranking (${res.status})`
    );
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data
    .map(normalizeRankingEntry)
    .filter((entry): entry is RankingEntry => entry !== null);
}

export function getUserIdFromStorage(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('userId');
  if (!raw || raw.trim() === '') return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}