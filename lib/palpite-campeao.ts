import { getBackendApiBase } from '@/lib/backend-url';
import { getAuthHeaders } from '@/lib/api-headers';

export interface PalpiteCampeao {
  id: number;
  usuarioId: number;
  timeSelecionadoId: number;
  createdAt: string;
}

export interface Time {
  id: number;
  nome: string;
  logo: string;
}

// Usa fetch direto (não apiFetch) de propósito: um 401/erro vindo deste
// microsserviço não deve envenenar o estado global de sessão e derrubar o
// resto do app. A pré-checagem do modal é silenciosa.
export async function getMeuPalpiteCampeao(): Promise<PalpiteCampeao | null> {
  const res = await fetch(`${getBackendApiBase()}/palpites-campeao/meu-palpite`, {
    headers: getAuthHeaders(),
  });

  // 404 ou 204 = ainda não palpitou
  if (res.status === 404 || res.status === 204) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // Corpo pode vir vazio mesmo com 200 → trata como "sem palpite"
  const text = await res.text();
  if (!text.trim()) return null;

  try {
    const data = JSON.parse(text);
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return null;
    }
    return data as PalpiteCampeao;
  } catch {
    return null;
  }
}

export async function registrarPalpiteCampeao(timeSelecionadoId: number): Promise<PalpiteCampeao> {
  const res = await fetch(`${getBackendApiBase()}/palpites-campeao`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ timeSelecionadoId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || 'Erro ao registrar palpite de campeão');
  }

  return res.json();
}

export async function getTimes(): Promise<Time[]> {
  const res = await fetch(`${getBackendApiBase()}/times`);
  if (!res.ok) throw new Error('Erro ao buscar times');
  return res.json();
}
