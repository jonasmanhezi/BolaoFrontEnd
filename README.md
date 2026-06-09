# Bolão React

Frontend em Next.js + React usando o estilo **Liquid Glass** da [Ein UI](https://ui.eindev.ir/).

## Setup

```bash
cd bolao-react
npm install
npm run dev
```

Abra http://localhost:3000

## Estrutura

- `app/page.tsx` — Splash screen com logo grande centralizado verticalmente, título, subtítulo e botão "ENTRAR" em estilo glass (sem círculo branco ao redor do logo).
- `components/ui/glass-button.tsx` — Botão com variantes (default, primary, etc.) e glow, inspirado diretamente na Ein UI.
- `components/ui/glass-card.tsx` — Card com efeito de vidro líquido (blur, bordas, brilho).
- `app/globals.css` — Estilos base do Liquid Glass (adaptados da lib).
- `lib/utils.ts` — cn helper (para classes).

## Como adicionar mais componentes da Ein UI

1. Acesse https://ui.eindev.ir/docs
2. Escolha o componente (glass-input, glass-table, glass-morph-card, widgets, etc.).
3. Clique em "Copy" no código React + Tailwind.
4. Cole/adapte em um novo arquivo em `components/ui/` (a maior parte é classes Tailwind que funcionam direto).
5. Use o comando shadcn se preferir (configurado no components.json com o registry @einui).

Exemplo de uso:

```tsx
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";

<GlassCard>
  <h3>Partida</h3>
  ...
</GlassCard>

<GlassButton variant="primary" onClick={...}>
  Fazer Palpite
</GlassButton>

## Testando no celular com ngrok

O erro `WebSocket connection to 'wss://...ngrok.../_next/webpack-hmr' failed` é muito comum.

O HMR (hot reload) do Next usa WebSocket. ngrok (especialmente free) + Turbopack/webpack nem sempre conseguem manter o upgrade do WebSocket estável.

### Soluções (do mais recomendado para mobile testing):

**1. Melhor opção: Use o servidor de produção (sem HMR)**
```bash
# Terminal 1
npm run preview:ngrok

# Terminal 2
ngrok http --host-header=rewrite 3000
```
Isso faz build + start em modo produção. Sem websocket de HMR, zero erro, e é exatamente o que vai pro usuário final. Perfeito pra testar cliques, modal, dock etc no celular.

**2. Se quiser ficar no modo dev (com hot reload)**
Tente:
```bash
npm run dev:ngrok
```
(usa `--no-turbo` + `WDS_SOCKET_PORT=0`)

Ou o clássico:
```bash
npm run dev:exposed
```

**3. ngrok command correto (sempre use isso)**
```bash
ngrok http --host-header=rewrite 3000
```

### O que já configuramos pra você:
- `.env.local` com `WDS_SOCKET_PORT=0` e `WDS_SOCKET_HOST=0.0.0.0`
- Vários scripts prontos (`dev:ngrok`, `preview:ngrok`, `start:exposed`)
- O `next dev` agora deve pegar as configs do env automaticamente

Reinicie completamente o servidor (`Ctrl+C` + subir de novo) depois de mudar `.env.local`.

Se o erro de websocket continuar no modo dev, use o `preview:ngrok` que é mais estável pra teste no celular. HMR não é essencial quando você está testando no device físico — basta dar refresh manual na página.

Se quiser desabilitar HMR completamente mesmo no dev, podemos configurar mais no `next.config.ts`.

```

## Logo

O splash usa `/fifa.png`. Coloque seu logo real em `public/fifa.png` (ou altere o src no page.tsx).

## Próximos passos sugeridos

- Criar páginas para Campeonatos, Partidas, Palpites usando os glass components.
- Integrar com a API do backend Spring (mesmos endpoints /campeonatos, /v1/partidas, /v1/palpites com X-User-Id header).
- Adicionar mais componentes da Ein UI (ex: glass-table para listagem de jogos, glass-input para placares).

O projeto está pronto para usar o visual da Ein UI sem precisar de React completo para tudo (mas os componentes portados seguem o mesmo design system).

Qualquer dúvida ou próximo componente para portar, avisa!
