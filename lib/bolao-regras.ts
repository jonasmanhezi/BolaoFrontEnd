export interface RegraSecao {
  id: string;
  titulo: string;
  itens: string[];
}

export const PONTUACAO_GRUPOS = [
  {
    pontos: 25,
    titulo: 'Placar exato',
    descricao: 'Você acertou o número de gols dos dois times.',
    exemplo: 'Palpite 2×1 · Resultado 2×1',
    destaque: 'text-emerald-300 bg-emerald-400/12 border-emerald-400/25',
  },
  {
    pontos: 10,
    titulo: 'Tendência correta',
    descricao: 'Errou o placar, mas acertou quem venceu ou que deu empate.',
    exemplo: 'Palpite 2×1 · Resultado 3×1 (vitória da casa nos dois)',
    destaque: 'text-cyan-300 bg-cyan-400/12 border-cyan-400/25',
  },
  {
    pontos: 0,
    titulo: 'Palpite incorreto',
    descricao: 'A tendência do jogo não bateu com o seu palpite.',
    exemplo: 'Palpite 2×1 · Resultado 1×2',
    destaque: 'text-white/45 bg-white/5 border-white/10',
  },
] as const;

export const PONTUACAO_KNOCKOUT = [
  {
    id: 'ko-exato',
    pontos: 50,
    titulo: 'Placar exato',
    descricao: 'Você acertou o número de gols dos dois times no tempo regulamentar.',
    exemplo: 'Palpite 2×1 · Resultado 2×1',
    destaque: 'text-amber-300 bg-amber-400/15 border-amber-400/30',
  },
  {
    id: 'ko-ganhador',
    pontos: 20,
    titulo: 'Acertou o ganhador',
    descricao: 'Errou o placar, mas acertou qual time avançou de fase no tempo regulamentar.',
    exemplo: 'Palpite 2×1 · Resultado 3×1 (mesmo vencedor)',
    destaque: 'text-orange-300 bg-orange-400/12 border-orange-400/25',
  },
  {
    id: 'ko-errou',
    pontos: 0,
    titulo: 'Palpite incorreto',
    descricao: 'O time que você apostou não passou de fase.',
    exemplo: 'Palpite vitória do Brasil · Resultado Argentina avança',
    destaque: 'text-white/45 bg-white/5 border-white/10',
  },
] as const;

export const PONTUACAO_PENALTI = [
  {
    id: 'pen-exato-acertou',
    pontos: 70,
    titulo: 'Placar exato + acertou o vencedor nos pênaltis',
    descricao: 'Você cravou o placar empatado e ainda escolheu o time certo para vencer a disputa de pênaltis.',
    exemplo: 'Palpite 1×1 + Portugal · Resultado 1×1, Portugal vence nos pênaltis',
    destaque: 'text-amber-300 bg-amber-400/15 border-amber-400/30',
  },
  {
    id: 'pen-exato-errou',
    pontos: 50,
    titulo: 'Placar exato + errou o vencedor nos pênaltis',
    descricao: 'Você acertou o placar empatado, mas o time que escolheu nos pênaltis não avançou.',
    exemplo: 'Palpite 1×1 + Brasil · Resultado 1×1, Argentina vence nos pênaltis',
    destaque: 'text-amber-300/70 bg-amber-400/10 border-amber-400/20',
  },
  {
    id: 'pen-empate-acertou',
    pontos: 40,
    titulo: 'Acertou o empate + acertou o vencedor nos pênaltis',
    descricao: 'Errou o placar, mas previu o empate no tempo regulamentar e escolheu o time certo nos pênaltis.',
    exemplo: 'Palpite 0×0 + França · Resultado 2×2, França vence nos pênaltis',
    destaque: 'text-orange-300 bg-orange-400/12 border-orange-400/25',
  },
  {
    id: 'pen-empate-errou',
    pontos: 20,
    titulo: 'Acertou o empate + errou o vencedor nos pênaltis',
    descricao: 'Previu o empate corretamente, mas errou o time vencedor nos pênaltis.',
    exemplo: 'Palpite 0×0 + Espanha · Resultado 2×2, Alemanha vence nos pênaltis',
    destaque: 'text-orange-300/60 bg-orange-400/8 border-orange-400/15',
  },
] as const;

export const BONUS_CAMPEAO = {
  pontos: 100,
  titulo: 'Palpite Campeão',
  descricao: 'Você disse quem ia levantar a taça — e acertou. Bônus direto na conta.',
  exemplo: 'Palpite feito nos primeiros 2 dias do mata-mata',
  destaque: 'text-amber-300 bg-amber-400/15 border-amber-400/30',
};

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
      'Em caso de empate na pontuação, os participantes dividem a posição.',
    ],
  },
  {
    id: 'historico',
    titulo: 'Histórico',
    itens: [
      'Na tela de Histórico você vê todos os palpites que já fez.',
      'Cada card mostra seu palpite, o resultado oficial e quantos pontos você ganhou naquela partida.',
      'É possível filtrar por fase para ver o desempenho em cada etapa do torneio.',
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

export const REGRAS_SECOES_KNOCKOUT: RegraSecao[] = [
  {
    id: 'formato',
    titulo: 'Formato eliminatório',
    itens: [
      'A partir dos 16 avos de final, cada jogo é de mata-mata: quem perde vai para casa.',
      'Os palpites seguem a mesma lógica — informe o placar que você espera no tempo regulamentar.',
      'Os palpites continuam fechando 5 minutos antes do início de cada partida.',
    ],
  },
  {
    id: 'pontuacao-ko',
    titulo: 'Por que os pontos são diferentes?',
    itens: [
      'No mata-mata os jogos têm muito mais peso: acertar o ganhador já vale 20 pontos, o dobro da tendência correta na fase de grupos.',
      'Cravar o placar exato vale 50 pontos — dois vezes o valor da fase de grupos — premiando quem faz a análise mais precisa.',
      'A diferença de pontuação reflete a dificuldade maior de prever jogos eliminatórios.',
    ],
  },
  {
    id: 'penaltis',
    titulo: 'Palpite de pênaltis',
    itens: [
      'Nos jogos eliminatórios, sempre que você palpitar empate, o sistema vai pedir que você escolha qual time vence nos pênaltis.',
      'O vencedor nos pênaltis é escolhido no mesmo momento do palpite — não é possível alterar depois que o jogo começa.',
      'Se você editar o palpite e mudar para um placar sem empate, o sistema descarta automaticamente o vencedor de pênaltis que você havia escolhido.',
      'O campo de pênaltis só aparece em jogos do mata-mata (16 avos em diante). Na fase de grupos não existe essa opção, pois empates são resultado válido.',
      'Acertar o vencedor nos pênaltis dá bônus de pontos sobre a pontuação base do palpite — veja a tabela de pênaltis para os valores exatos.',
    ],
  },
  {
    id: 'campeao',
    titulo: 'Palpite Campeão',
    itens: [
      'Nos primeiros 2 dias do mata-mata, você pode dizer quem vai ser o campeão da Copa.',
      'O palpite é feito às cegas: você escolhe sem saber o chaveamento completo.',
      'Se o seu time levantar a taça, você ganha 100 pontos de bônus direto na classificação.',
      'Cada usuário pode fazer apenas um palpite de campeão. Escolha com sabedoria.',
    ],
  },
];
