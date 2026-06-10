import { getTeamSigla } from '@/lib/teams';

export type PartidaStatus = 'AGENDADA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';

export interface Partida {
  id: number;
  data: string;
  horario: string;
  casa: string;
  fora: string;
  siglaCasa: string;
  siglaFora: string;
  nomeCasa?: string;
  nomeVisitante?: string;
  logoCasa: string;
  logoFora: string;
  golsCasa?: number | null;
  golsVisitante?: number | null;
  status?: PartidaStatus;
  campeonatoId?: number;
  faseId?: number;
}

interface RawPartida {
  id: number;
  timeCasaId?: number;
  timeVisitanteId?: number;
  dataHoraPartida?: string;
  nomeCasa?: string;
  nomeVisitante?: string;
  logoCasa?: string;
  logoFora?: string;
  golsCasa?: number | null;
  golsVisitante?: number | null;
  status?: string;
  campeonatoId?: number;
  faseId?: number;
}

import { getBackendApiBase } from '@/lib/backend-url';

const BACKEND_BASE = getBackendApiBase();

let allMatchesCache: Partida[] | null = null;
let inFlightRequest: Promise<Partida[]> | null = null;
let lastSource: 'backend' | 'mock' = 'mock';

const TEAM_BY_ID: Record<number, { name: string; logo: string; sigla: string }> = {
  1: { name: 'Brasil',     logo: 'https://flagcdn.com/w80/br.png',      sigla: 'BRA' },
  2: { name: 'França',     logo: 'https://flagcdn.com/w80/fr.png',      sigla: 'FRA' },
  3: { name: 'Alemanha',   logo: 'https://flagcdn.com/w80/de.png',      sigla: 'GER' },
  4: { name: 'Espanha',    logo: 'https://flagcdn.com/w80/es.png',      sigla: 'ESP' },
  5: { name: 'Argentina',  logo: 'https://flagcdn.com/w80/ar.png',      sigla: 'ARG' },
  6: { name: 'Inglaterra', logo: 'https://flagcdn.com/w80/gb-eng.png',  sigla: 'ENG' },
  7: { name: 'Portugal',   logo: 'https://flagcdn.com/w80/pt.png',      sigla: 'POR' },
  8: { name: 'Holanda',    logo: 'https://flagcdn.com/w80/nl.png',      sigla: 'NED' },
  9: { name: 'Itália',     logo: 'https://flagcdn.com/w80/it.png',      sigla: 'ITA' },
  10: { name: 'Croácia',   logo: 'https://flagcdn.com/w80/hr.png',      sigla: 'CRO' },
  11: { name: 'Uruguai',   logo: 'https://flagcdn.com/w80/uy.png',      sigla: 'URU' },
  12: { name: 'México',    logo: 'https://flagcdn.com/w80/mx.png',      sigla: 'MEX' },
  13: { name: 'Colômbia',  logo: 'https://flagcdn.com/w80/co.png',      sigla: 'COL' },
  14: { name: 'Chile',     logo: 'https://flagcdn.com/w80/cl.png',      sigla: 'CHI' },
  15: { name: 'Bélgica',   logo: 'https://flagcdn.com/w80/be.png',      sigla: 'BEL' },
  16: { name: 'Polônia',   logo: 'https://flagcdn.com/w80/pl.png',      sigla: 'POL' },
};

function getTeamInfo(id: number | null | undefined) {
  if (!id) {
    return { name: 'Time Desconhecido', logo: 'https://flagcdn.com/w80/xx.png', sigla: '---' };
  }
  const team = TEAM_BY_ID[id];
  if (team) return team;
  return { name: `Time ${id}`, logo: 'https://flagcdn.com/w80/xx.png', sigla: '---' };
}

function mapPartidaStatus(status: string | null | undefined): PartidaStatus | undefined {
  if (!status) return undefined;
  const upper = status.toUpperCase();
  if (upper === 'AGENDADA' || upper === 'EM_ANDAMENTO' || upper === 'FINALIZADA' || upper === 'CANCELADA') {
    return upper;
  }
  return undefined;
}

function getTeamLogo(backendLogo: string | null | undefined, fallbackLogo: string): string {
  if (backendLogo && backendLogo.trim().length > 0) {
    return backendLogo;
  }
  return fallbackLogo;
}

function formatDataHora(dataHora: string | null): { data: string; horario: string } {
  if (!dataHora) return { data: '', horario: '' };

  const raw = dataHora.trim();

  let isoForDate = raw;
  const hasOffset = /[zZ]|[+\-]\d{2}:?\d{2}$/.test(isoForDate);
  if (!hasOffset && !isoForDate.endsWith('Z')) {
    isoForDate = isoForDate + 'Z';
  }
  const dateForBr = new Date(isoForDate);

  const data = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateForBr);

  const timeMatch = raw.match(/(\d{2}):(\d{2})(?::\d{2})?/);
  let horario = '??:??';
  if (timeMatch) {
    horario = `${timeMatch[1]}:${timeMatch[2]}`;
  } else {
    horario = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(dateForBr);
  }

  return { data, horario };
}

export async function getAllPartidas(): Promise<Partida[]> {
  if (allMatchesCache) return allMatchesCache;
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = (async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${BACKEND_BASE}/partidas`, {
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw: RawPartida[] = await res.json();
      const mapped: Partida[] = raw.map((p) => {
        const casaInfo = getTeamInfo(p.timeCasaId);
        const foraInfo = getTeamInfo(p.timeVisitanteId);
        const { data, horario } = formatDataHora(p.dataHoraPartida ?? null);

        const casa = p.nomeCasa || casaInfo.name;
        const fora = p.nomeVisitante || foraInfo.name;

        return {
          id: p.id,
          data,
          horario,
          casa,
          fora,
          siglaCasa: getTeamSigla(casa) !== '---' ? getTeamSigla(casa) : casaInfo.sigla,
          siglaFora: getTeamSigla(fora) !== '---' ? getTeamSigla(fora) : foraInfo.sigla,
          nomeCasa: p.nomeCasa,
          nomeVisitante: p.nomeVisitante,
          logoCasa: getTeamLogo(p.logoCasa, casaInfo.logo),
          logoFora: getTeamLogo(p.logoFora, foraInfo.logo),
          golsCasa: p.golsCasa ?? null,
          golsVisitante: p.golsVisitante ?? null,
          status: mapPartidaStatus(p.status),
          campeonatoId: p.campeonatoId,
          faseId: p.faseId,
        };
      });

      allMatchesCache = mapped;
      lastSource = 'backend';
      return mapped;
    } catch (err) {
      console.warn('[PartidasService] Falha na chamada ao backend 8080. Usando mocks da Copa 2026.', err);
      const mock = getMockAllPartidas();
      allMatchesCache = mock;
      lastSource = 'mock';
      return mock;
    } finally {
      inFlightRequest = null;
    }
  })();

  return inFlightRequest;
}

export async function getPartidasPorData(data: string): Promise<Partida[]> {
  const all = await getAllPartidas();
  return all.filter((p) => p.data === data);
}

export function getLastDataSource(): 'backend' | 'mock' {
  return lastSource;
}

export function clearPartidasCache(): void {
  allMatchesCache = null;
  inFlightRequest = null;
}

function getMockAllPartidas(): Partida[] {
  const mockDates = generateBrazilDates('2026-06-11', 10);

  const mock: Partida[] = [
    { id: 1, data: mockDates[0], horario: '16:00', casa: 'Brasil', fora: 'França', siglaCasa: 'BRA', siglaFora: 'FRA', logoCasa: 'https://flagcdn.com/w80/br.png', logoFora: 'https://flagcdn.com/w80/fr.png', golsCasa: 2, golsVisitante: 1, status: 'FINALIZADA', campeonatoId: 1, faseId: 1 },
    { id: 2, data: mockDates[0], horario: '20:00', casa: 'Alemanha', fora: 'Espanha', siglaCasa: 'GER', siglaFora: 'ESP', logoCasa: 'https://flagcdn.com/w80/de.png', logoFora: 'https://flagcdn.com/w80/es.png', golsCasa: null, golsVisitante: null, status: 'AGENDADA', campeonatoId: 1, faseId: 1 },
    { id: 3, data: mockDates[1], horario: '13:00', casa: 'Argentina', fora: 'Inglaterra', siglaCasa: 'ARG', siglaFora: 'ENG', logoCasa: 'https://flagcdn.com/w80/ar.png', logoFora: 'https://flagcdn.com/w80/gb-eng.png', golsCasa: 1, golsVisitante: 1, status: 'FINALIZADA', campeonatoId: 1, faseId: 1 },
    { id: 4, data: mockDates[1], horario: '17:00', casa: 'Portugal', fora: 'Holanda', siglaCasa: 'POR', siglaFora: 'NED', logoCasa: 'https://flagcdn.com/w80/pt.png', logoFora: 'https://flagcdn.com/w80/nl.png', golsCasa: 0, golsVisitante: 0, status: 'EM_ANDAMENTO', campeonatoId: 1, faseId: 1 },
    { id: 5, data: mockDates[2], horario: '15:00', casa: 'Itália', fora: 'Croácia', siglaCasa: 'ITA', siglaFora: 'CRO', logoCasa: 'https://flagcdn.com/w80/it.png', logoFora: 'https://flagcdn.com/w80/hr.png', golsCasa: null, golsVisitante: null, status: 'AGENDADA', campeonatoId: 1, faseId: 1 },
    { id: 101, data: mockDates[2], horario: '19:00', casa: 'Brasil', fora: 'Marrocos', siglaCasa: 'BRA', siglaFora: 'MAR', logoCasa: 'https://flagcdn.com/w80/br.png', logoFora: 'https://flagcdn.com/w80/ma.png', golsCasa: null, golsVisitante: null, status: 'AGENDADA', campeonatoId: 1, faseId: 1 },
    { id: 6, data: mockDates[3], horario: '19:00', casa: 'Uruguai', fora: 'México', siglaCasa: 'URU', siglaFora: 'MEX', logoCasa: 'https://flagcdn.com/w80/uy.png', logoFora: 'https://flagcdn.com/w80/mx.png', golsCasa: null, golsVisitante: null, status: 'AGENDADA', campeonatoId: 1, faseId: 1 },
    { id: 7, data: mockDates[4], horario: '14:00', casa: 'Colômbia', fora: 'Chile', siglaCasa: 'COL', siglaFora: 'CHI', logoCasa: 'https://flagcdn.com/w80/co.png', logoFora: 'https://flagcdn.com/w80/cl.png', golsCasa: null, golsVisitante: null, status: 'AGENDADA', campeonatoId: 1, faseId: 1 },
    { id: 8, data: mockDates[5], horario: '18:00', casa: 'Bélgica', fora: 'Polônia', siglaCasa: 'BEL', siglaFora: 'POL', logoCasa: 'https://flagcdn.com/w80/be.png', logoFora: 'https://flagcdn.com/w80/pl.png', golsCasa: null, golsVisitante: null, status: 'AGENDADA', campeonatoId: 1, faseId: 1 },
  ];

  return mock;
}

export function generateBrazilDates(startDateStr: string, count: number): string[] {
  const dates: string[] = [];
  const current = new Date(startDateStr + 'T12:00:00Z');
  for (let i = 0; i < count; i++) {
    const brDate = current.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    dates.push(brDate);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

export const DEFAULT_TEAM_LOGO =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjE2IiB5PSIyMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzI4MCIgZm9udC1zaXplPSIxNCI+8J+OlTwvdGV4dD48L3N2Zz4=';

export const getTodasPartidas = getAllPartidas;
