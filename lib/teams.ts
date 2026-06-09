const SIGLA_BY_NAME: Record<string, string> = {
  brasil: 'BRA',
  brazil: 'BRA',
  franca: 'FRA',
  france: 'FRA',
  alemanha: 'GER',
  germany: 'GER',
  espanha: 'ESP',
  spain: 'ESP',
  argentina: 'ARG',
  inglaterra: 'ENG',
  england: 'ENG',
  portugal: 'POR',
  holanda: 'NED',
  netherlands: 'NED',
  italia: 'ITA',
  italy: 'ITA',
  croacia: 'CRO',
  croatia: 'CRO',
  uruguai: 'URU',
  uruguay: 'URU',
  mexico: 'MEX',
  méxico: 'MEX',
  colombia: 'COL',
  colômbia: 'COL',
  chile: 'CHI',
  belgica: 'BEL',
  bélgica: 'BEL',
  belgium: 'BEL',
  polonia: 'POL',
  polônia: 'POL',
  poland: 'POL',
  marrocos: 'MAR',
  morocco: 'MAR',
  'south africa': 'RSA',
  'south korea': 'KOR',
  'korea republic': 'KOR',
  canada: 'CAN',
  'czech republic': 'CZE',
  'bosnia & herzegovina': 'BIH',
  'bosnia and herzegovina': 'BIH',
  japan: 'JPN',
  usa: 'USA',
  'united states': 'USA',
  switzerland: 'SUI',
  suica: 'SUI',
  suíça: 'SUI',
  senegal: 'SEN',
  australia: 'AUS',
  cameroon: 'CMR',
  camarao: 'CMR',
  camarões: 'CMR',
  serbia: 'SRB',
  servia: 'SRB',
  ghana: 'GHA',
  ecuador: 'ECU',
  equador: 'ECU',
  iran: 'IRN',
  irã: 'IRN',
  'saudi arabia': 'KSA',
  'costa rica': 'CRC',
  tunisia: 'TUN',
  tunísia: 'TUN',
  denmark: 'DEN',
  dinamarca: 'DEN',
  wales: 'WAL',
  gales: 'WAL',
  scotland: 'SCO',
  escocia: 'SCO',
  paraguay: 'PAR',
  paraguai: 'PAR',
  peru: 'PER',
  qatar: 'QAT',
  catar: 'QAT',
};

function normalizeName(nome: string): string {
  return nome
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function getTeamSigla(nome: string): string {
  const raw = nome.trim();
  if (!raw) return '---';

  const lower = raw.toLowerCase();
  if (SIGLA_BY_NAME[lower]) return SIGLA_BY_NAME[lower];

  const normalized = normalizeName(raw);
  if (SIGLA_BY_NAME[normalized]) return SIGLA_BY_NAME[normalized];

  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  }

  return raw.slice(0, 3).toUpperCase();
}