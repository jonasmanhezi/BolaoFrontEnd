export interface RegraSecao {
  id: string;
  titulo: string;
  itens: string[];
}

export const PONTUACAO_REGRAS = [
  {
    pontos: 25,
    titulo: 'Placar exato',
    descricao: 'Você acertou o número de gols do time da casa e do visitante.',
    exemplo: 'Palpite 2×1 e resultado 2×1',
    destaque: 'text-emerald-300 bg-emerald-400/12 border-emerald-400/25',
  },
  {
    pontos: 10,
    titulo: 'Tendência correta',
    descricao: 'Você errou o placar, mas acertou quem venceu ou se deu empate.',
    exemplo: 'Palpite 2×1 e resultado 3×1 (vitória da casa nos dois)',
    destaque: 'text-cyan-300 bg-cyan-400/12 border-cyan-400/25',
  },
  {
    pontos: 0,
    titulo: 'Palpite incorreto',
    descricao: 'A tendência do jogo não bateu com o seu palpite.',
    exemplo: 'Palpite 2×1 e resultado 1×2',
    destaque: 'text-white/45 bg-white/5 border-white/10',
  },
] as const;

export const REGRAS_SECOES: RegraSecao[] = [
  {
    id: 'objetivo',
    titulo: 'Objetivo',
    itens: [
      'O bolão é da Copa do Mundo 2026: palpite os jogos, acumule pontos e dispute o ranking com seus amigos.',
      'Quem fizer mais pontos ao longo do torneio fica na frente da classificação.',
    ],
  },
  {
    id: 'palpites',
    titulo: 'Palpites',
    itens: [
      'Para cada partida, informe quantos gols o time da casa e o visitante vão fazer.',
      'Você pode criar e editar palpites enquanto o jogo estiver agendado.',
      'Depois que a partida começa ou termina, o palpite fica bloqueado.',
      'Os palpites se encerram 5 minutos antes do início de cada jogo.',
    ],
  },
  {
    id: 'ranking',
    titulo: 'Ranking',
    itens: [
      'A pontuação de cada palpite é somada automaticamente após o jogo ser finalizado.',
      'O ranking é atualizado com o total de pontos de cada participante.',
      'Em caso de empate, quem tiver o mesmo total divide a posição; o desempate pode considerar a ordem alfabética do nome.',
    ],
  },
  {
    id: 'historico',
    titulo: 'Histórico',
    itens: [
      'Na tela de Histórico você vê todos os palpites que já fez.',
      'Cada card mostra seu palpite, o resultado oficial e quantos pontos você ganhou naquela partida.',
    ],
  },
  {
    id: 'conta',
    titulo: 'Conta',
    itens: [
      'É necessário criar uma conta e fazer login para registrar palpites.',
      'Cada usuário só pode gerenciar os próprios palpites.',
    ],
  },
];