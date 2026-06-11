import { getBackendApiBase } from '@/lib/backend-url';
import { getAuthHeaders } from '@/lib/api-headers';
import { apiFetch } from '@/lib/api-fetch';
import { getCampeonatoIdFromStorage } from '@/lib/grupo';

export const FASE_ID = 1;

export function getCampeonatoId(): number {
  return getCampeonatoIdFromStorage();
}
const PAGE_SIZE = 50;

export interface Palpite {
  id?: number;
  partidaId: number;
  golsCasa: number;
  golsVisitante: number;
  pontuacaoObtida?: number;
}

export interface PalpiteLocal {
  id?: number;
  golsCasa: string;
  golsFora: string;
}

export interface PaginatedPalpiteResponse {
  content: Palpite[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function getUserIdFromStorage(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('userId');
  if (!raw || raw.trim() === '') return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

async function parseErrorResponse(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return data.message || fallback;
}

function normalizePalpite(raw: unknown): Palpite | null {
  if (!raw || typeof raw !== 'object') return null;

  const item = raw as Record<string, unknown>;
  const partidaId = item.partidaId ?? item.partida_id;
  const golsCasa = item.golsCasa ?? item.gols_casa;
  const golsVisitante = item.golsVisitante ?? item.gols_visitante;

  if (partidaId == null || golsCasa == null || golsVisitante == null) {
    return null;
  }

  return {
    id: item.id != null ? Number(item.id) : undefined,
    partidaId: Number(partidaId),
    golsCasa: Number(golsCasa),
    golsVisitante: Number(golsVisitante),
    pontuacaoObtida:
      item.pontuacaoObtida != null
        ? Number(item.pontuacaoObtida)
        : item.pontuacao_obtida != null
          ? Number(item.pontuacao_obtida)
          : undefined,
  };
}

function normalizePalpitesPayload(payload: unknown): Palpite[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizePalpite).filter((p): p is Palpite => p !== null);
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const content = obj.content;

    if (Array.isArray(content)) {
      return content.map(normalizePalpite).filter((p): p is Palpite => p !== null);
    }
  }

  return [];
}

export async function getPalpitesPaginados(
  usuarioId: number,
  faseId: number = FASE_ID,
  page: number = 0,
  size: number = PAGE_SIZE
): Promise<PaginatedPalpiteResponse> {
  const res = await apiFetch(
    `${getBackendApiBase()}/palpites/usuario/${usuarioId}/campeonato/${getCampeonatoId()}/fase/${faseId}?page=${page}&size=${size}`,
    { headers: getAuthHeaders() }
  );

  if (res.status === 403) {
    throw new Error(await parseErrorResponse(res, 'Acesso negado ao consultar palpites.'));
  }

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res, `Erro ao buscar palpites (HTTP ${res.status})`));
  }

  const json = await res.json();
  const content = normalizePalpitesPayload(json);

  if (Array.isArray(json)) {
    return {
      content,
      page: 0,
      size: content.length,
      totalElements: content.length,
      totalPages: 1,
    };
  }

  return {
    content,
    page: Number((json as PaginatedPalpiteResponse).page ?? 0),
    size: Number((json as PaginatedPalpiteResponse).size ?? size),
    totalElements: Number((json as PaginatedPalpiteResponse).totalElements ?? content.length),
    totalPages: Math.max(Number((json as PaginatedPalpiteResponse).totalPages ?? 1), 1),
  };
}

export async function getPalpitesPorCampeonatoFase(faseId: number = FASE_ID): Promise<Palpite[]> {
  const res = await apiFetch(
    `${getBackendApiBase()}/palpites/campeonato/${getCampeonatoId()}/fase/${faseId}`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res, `Erro ao buscar palpites (HTTP ${res.status})`));
  }

  const json = await res.json();
  return normalizePalpitesPayload(json);
}

async function getPalpitesPaginadosCompletos(
  usuarioId: number,
  faseId: number = FASE_ID
): Promise<Palpite[]> {
  const todos: Palpite[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const resultado = await getPalpitesPaginados(usuarioId, faseId, page, PAGE_SIZE);
    todos.push(...resultado.content);
    totalPages = resultado.totalPages;
    page += 1;
  }

  return todos;
}

export async function getPalpitesDoUsuario(faseId: number = FASE_ID): Promise<Palpite[]> {
  const userId = getUserIdFromStorage();

  if (userId) {
    try {
      return await getPalpitesPaginadosCompletos(userId, faseId);
    } catch (error) {
      console.warn('[PalpitesService] Falha no GET paginado, tentando fallback por campeonato/fase.', error);
    }
  }

  return getPalpitesPorCampeonatoFase(faseId);
}

export async function atualizarPalpite(
  palpiteId: number,
  golsCasa: number,
  golsVisitante: number
): Promise<Palpite> {
  const res = await apiFetch(`${getBackendApiBase()}/palpites/${palpiteId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ golsCasa, golsVisitante }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res, 'Falha ao atualizar palpite.'));
  }

  const json = await res.json();
  return normalizePalpite(json) ?? (json as Palpite);
}

export async function criarOuAtualizarPalpite(
  partidaId: number,
  golsCasa: number,
  golsVisitante: number,
  palpiteId?: number
): Promise<Palpite> {
  if (palpiteId) {
    return atualizarPalpite(palpiteId, golsCasa, golsVisitante);
  }

  const res = await apiFetch(`${getBackendApiBase()}/palpites`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partidaId, golsCasa, golsVisitante, campeonatoId: getCampeonatoId() }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res, 'Falha ao registrar palpite.'));
  }

  const json = await res.json();
  return normalizePalpite(json) ?? (json as Palpite);
}

export function mapPalpitesToRecord(palpites: Palpite[]): Record<number, PalpiteLocal> {
  return palpites.reduce<Record<number, PalpiteLocal>>((acc, p) => {
    if (!p.partidaId) return acc;

    acc[p.partidaId] = {
      id: p.id,
      golsCasa: String(p.golsCasa),
      golsFora: String(p.golsVisitante),
    };
    return acc;
  }, {});
}

export async function getPalpitesParaPartidas(
  partidas: Array<{ faseId?: number }> = []
): Promise<Palpite[]> {
  const faseIds = new Set<number>([FASE_ID]);

  for (const partida of partidas) {
    if (partida.faseId) {
      faseIds.add(partida.faseId);
    }
  }

  const results = await Promise.all(
    Array.from(faseIds).map((faseId) => getPalpitesDoUsuario(faseId))
  );

  return results.flat();
}

export function findDateWithPalpite(
  partidas: Array<{ id: number; data: string }>,
  palpitesMap: Record<number, PalpiteLocal>
): string | null {
  const partidaComPalpite = partidas.find((partida) => {
    const palpite = palpitesMap[partida.id];
    return !!palpite && palpite.golsCasa !== '' && palpite.golsFora !== '';
  });

  return partidaComPalpite?.data ?? null;
}