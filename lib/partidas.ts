import { getTeamSigla } from '@/lib/teams';
import { formatPartidaDataHora } from '@/lib/match-time';

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
  timeCasaId?: number;
  timeVisitanteId?: number;
  temPenalti?: boolean;
  winnerId?: number | null;
  penaltiCasa?: number | null;
  penaltiVisitante?: number | null;
}

interface RawPartida {
  id: number;
  timeCasaId?: number;
  time_casa_id?: number;
  timeVisitanteId?: number;
  time_visitante_id?: number;
  dataHoraPartida?: string;
  data_hora_partida?: string;
  nomeCasa?: string;
  nome_casa?: string;
  nomeVisitante?: string;
  nome_visitante?: string;
  logoCasa?: string;
  logo_casa?: string;
  logoFora?: string;
  logo_fora?: string;
  golsCasa?: number | null;
  gols_casa?: number | null;
  golsVisitante?: number | null;
  gols_visitante?: number | null;
  status?: string;
  campeonatoId?: number;
  campeonato_id?: number;
  faseId?: number;
  fase_id?: number;
  temPenalti?: boolean;
  tem_penalti?: boolean;
  winnerId?: number | null;
  winner_id?: number | null;
  penaltiCasa?: number | null;
  penalti_casa?: number | null;
  penaltiVisitante?: number | null;
  penalti_visitante?: number | null;
}

import { getBackendApiBase } from '@/lib/backend-url';

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

export async function getAllPartidas(): Promise<Partida[]> {
  if (allMatchesCache) return allMatchesCache;
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = (async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${getBackendApiBase()}/partidas`, {
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw: RawPartida[] = await res.json();
      const mapped: Partida[] = raw.map((p) => {
        const timeCasaId = p.timeCasaId ?? p.time_casa_id;
        const timeVisitanteId = p.timeVisitanteId ?? p.time_visitante_id;
        const casaInfo = getTeamInfo(timeCasaId);
        const foraInfo = getTeamInfo(timeVisitanteId);
        const { data, horario } = formatPartidaDataHora(
          p.dataHoraPartida ?? p.data_hora_partida ?? null
        );

        const casa = p.nomeCasa ?? p.nome_casa ?? casaInfo.name;
        const fora = p.nomeVisitante ?? p.nome_visitante ?? foraInfo.name;

        return {
          id: p.id,
          data,
          horario,
          casa,
          fora,
          siglaCasa: getTeamSigla(casa) !== '---' ? getTeamSigla(casa) : casaInfo.sigla,
          siglaFora: getTeamSigla(fora) !== '---' ? getTeamSigla(fora) : foraInfo.sigla,
          nomeCasa: casa,
          nomeVisitante: fora,
          logoCasa: getTeamLogo(p.logoCasa ?? p.logo_casa, casaInfo.logo),
          logoFora: getTeamLogo(p.logoFora ?? p.logo_fora, foraInfo.logo),
          golsCasa: p.golsCasa ?? p.gols_casa ?? null,
          golsVisitante: p.golsVisitante ?? p.gols_visitante ?? null,
          status: mapPartidaStatus(p.status),
          campeonatoId: p.campeonatoId ?? p.campeonato_id,
          faseId: p.faseId ?? p.fase_id,
          timeCasaId,
          timeVisitanteId,
          temPenalti: p.temPenalti ?? p.tem_penalti,
          winnerId: p.winnerId ?? p.winner_id ?? null,
          penaltiCasa: p.penaltiCasa ?? p.penalti_casa ?? null,
          penaltiVisitante: p.penaltiVisitante ?? p.penalti_visitante ?? null,
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

export const CALENDAR_START_DATE = '2026-06-11';
export const CALENDAR_END_DATE = '2026-07-15';

function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, '0');
  const d = String(next.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateBrazilDates(startDateStr: string, count: number): string[] {
  const dates: string[] = [];
  let current = startDateStr;

  for (let i = 0; i < count; i++) {
    dates.push(current);
    current = addDaysToDateString(current, 1);
  }

  return dates;
}

export function generateBrazilDateRange(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  let current = startDateStr;

  while (current <= endDateStr) {
    dates.push(current);
    current = addDaysToDateString(current, 1);
  }

  return dates;
}

export const DEFAULT_TEAM_LOGO =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjE2IiB5PSIyMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzI4MCIgZm9udC1zaXplPSIxNCI+8J+OlTwvdGV4dD48L3N2Zz4=';

export const getTodasPartidas = getAllPartidas;
