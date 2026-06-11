import { getBackendApiBase } from '@/lib/backend-url';
import { getAuthHeaders } from '@/lib/api-headers';
import { apiFetch } from '@/lib/api-fetch';

export interface Grupo {
  id: number;
  codigo: string;
  nome: string;
  campeonatoId?: number;
}

const GRUPO_ID_KEY = 'grupoId';
const GRUPO_NOME_KEY = 'grupoNome';
const GRUPO_CODIGO_KEY = 'grupoCodigo';
const GRUPO_CAMPEONATO_KEY = 'grupoCampeonatoId';

export function persistGrupoSession(grupo: Grupo): void {
  localStorage.setItem(GRUPO_ID_KEY, String(grupo.id));
  localStorage.setItem(GRUPO_NOME_KEY, grupo.nome);
  localStorage.setItem(GRUPO_CODIGO_KEY, grupo.codigo);
  if (grupo.campeonatoId != null) {
    localStorage.setItem(GRUPO_CAMPEONATO_KEY, String(grupo.campeonatoId));
  }
}

export function clearGrupoSession(): void {
  localStorage.removeItem(GRUPO_ID_KEY);
  localStorage.removeItem(GRUPO_NOME_KEY);
  localStorage.removeItem(GRUPO_CODIGO_KEY);
  localStorage.removeItem(GRUPO_CAMPEONATO_KEY);
}

export function getGrupoIdFromStorage(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(GRUPO_ID_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getGrupoNomeFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GRUPO_NOME_KEY);
}

export function getCampeonatoIdFromStorage(): number {
  if (typeof window === 'undefined') return 1;
  const raw = localStorage.getItem(GRUPO_CAMPEONATO_KEY);
  const parsed = raw ? Number(raw) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function hasGrupoSession(): boolean {
  return getGrupoIdFromStorage() != null;
}

function normalizeGrupo(raw: unknown): Grupo | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = item.id;
  const codigo = item.codigo;
  const nome = item.nome;
  if (id == null || !codigo || !nome) return null;

  return {
    id: Number(id),
    codigo: String(codigo),
    nome: String(nome),
    campeonatoId:
      item.campeonatoId != null
        ? Number(item.campeonatoId)
        : item.campeonato_id != null
          ? Number(item.campeonato_id)
          : undefined,
  };
}

export async function entrarNoGrupo(codigo: string): Promise<Grupo> {
  const res = await apiFetch(`${getBackendApiBase()}/grupos/entrar`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(false),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ codigo: codigo.trim() }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || 'Código de grupo inválido.');
  }

  const grupo = normalizeGrupo(data);
  if (!grupo) {
    throw new Error('Resposta inválida ao entrar no grupo.');
  }

  persistGrupoSession(grupo);
  return grupo;
}

export async function listarMeusGrupos(): Promise<Grupo[]> {
  const res = await apiFetch(`${getBackendApiBase()}/grupos/meus`, {
    headers: getAuthHeaders(false),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || 'Erro ao carregar grupos.');
  }

  if (!Array.isArray(data)) return [];
  return data.map(normalizeGrupo).filter((g): g is Grupo => g !== null);
}