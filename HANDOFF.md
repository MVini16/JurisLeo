---
data: 17-09-2026
projeto: JurisLeo
---

# Handoff — 17-09-2026

Sessão longa e densa. A app passou de "Fase 0 por fazer" a ter praticamente toda a lista de funcionalidades da spec original construída e publicada. Este documento é propositadamente extenso — foi pedido "super detalhado", não um resumo de 2 minutos.

## onde ficámos

Acabei de construir Flashcards + Central de Ajuda, tudo publicado em produção. A seguir a isto, o Vini pediu para instalar 4 skills externas (não consegui — ver secção própria) e depois este handoff. **Não há nenhuma tarefa de código a meio.** Tudo o que está descrito abaixo está commitado, no GitHub, e em produção em `jurisleo-67124.web.app`.

## ⚠️ o mais importante a saber antes de tocares em nada

**Este checkout não tem `.env`.** O ficheiro existe agora na máquina local (eu criei-o a meio da sessão, depois de um incidente — ver abaixo), mas está fora do git de propósito (`.gitignore`). Se abrires este projeto noutra máquina, ou se o ficheiro `.env` desaparecer por qualquer razão, **o primeiro build vai partir a produção outra vez** com o mesmo erro `auth/invalid-api-key` — porque o Vite embebe as variáveis `VITE_FIREBASE_*` no bundle em build-time, e sem elas o Firebase rebenta ao iniciar, antes de o React sequer montar (ecrã em branco, `<div id="root">` vazio).

Valores reais (não são segredos verdadeiros — são a config pública do Firebase, a segurança está nas `firestore.rules`, não em escondê-los):

```
VITE_FIREBASE_API_KEY=AIzaSyDHe3k6ncyw4B1xjf4d4sh5bffhwWnqgsU
VITE_FIREBASE_AUTH_DOMAIN=jurisleo-67124.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jurisleo-67124
VITE_FIREBASE_STORAGE_BUCKET=jurisleo-67124.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=422557789490
VITE_FIREBASE_APP_ID=1:422557789490:web:4e110ed7c9adc37513bb2b
```

Se faltar o `.env`, também dá para recuperar com `firebase apps:sdkconfig WEB 1:422557789490:web:4e110ed7c9adc37513bb2b --project jurisleo-67124` (o CLI já está autenticado).

**Disciplina a manter sempre, sem excepção:** depois de `npm run build` e antes de `firebase deploy`, correr:
```
grep -c "AIzaSyDHe3k6ncyw4B1xjf4d4sh5bffhwWnqgsU" dist/assets/*.js
```
Tem de dar `1`. Depois do deploy, repetir contra o bundle publicado (`curl` ao `index.html` para saber o nome do ficheiro, depois `curl` ao ficheiro e `grep`). Fiz isto religiosamente a partir do incidente e apanhou logo se algo tivesse corrido mal outra vez.

## o que foi feito (por ordem)

### Fase 0 — dívida técnica
- Moveu `firebase.js`, `auth.js`, `initFirestore.js` para `src/services/`
- `src/data/dadosLeonor.js` criado — dados reais do 2º ano, Turma A, subturma 7 (5 cadeiras: DA I, DIP I, DO I, DF, HRI), horário completo, cores por cadeira. Substituiu um seed antigo que tinha cadeiras do 1º ano.
- `ModalCriarEvento.jsx` passou a suportar edição (`eventoExistente` prop) — antes só criava
- NavBar (`+`) ligado a acções reais em vez de não fazer nada
- `ThemeContext.jsx` sincroniza tema com `perfil/dados.tema` no Firestore (com `useRef` anti-ciclo, para não reescrever o valor que acabou de vir de lá)
- `firestore.rules` endurecido (estava aberto até 2026-05-31) — **e** `firebase.json` corrigido para referenciar as regras (sem isto, editar `firestore.rules` nunca fazia deploy real — só o hosting)

### Motores (o "coração" da app) — `src/services/`
- `avaliacao.js` — árvore de decisão completa do regulamento (Método A/B, escrito, oral, recurso, melhoria). **25 casos de teste**, todos a passar.
  - **Caso-limite por confirmar com o Vini**: teste #25 (Método A, AC=11, escrito=9, oral=9) — a tabela da spec original dizia "excluída" mas o texto explicativo ao lado resolvia a ambiguidade para "aprovada com 10" (via média arredondada 9,5→10). Implementei conforme o texto explicativo, marcado no código com `// caso limite: confirmar`. Vale a pena confirmar com ela/o Vini qual a leitura correcta do regulamento.
- `faltas.js` — exclusão por 1/4 das lecionadas (injustificadas) ou 1/2 das previstas (total). **8 casos de teste**, todos a passar.
- `repeticaoEspacada.js` (mais tarde, para os Flashcards) — sistema estilo Leitner, 5 níveis, intervalos [1,2,4,7,15] dias. **12 testes**.
- **Total: 48 testes, `npm test` (vitest), todos a passar.**

### Páginas construídas (por esta ordem)
1. **Cadeiras** (`/cadeiras`) — lista das 5 cadeiras com semáforo de faltas + estado de avaliação ao vivo; secção "Recursos" no fundo (Glossário, Artigos, Leituras, Pesquisa, Flashcards)
2. **Cadeira** (`/cadeiras/:id`) — formulário de notas e faltas, ligado directamente aos motores; celebração/consolo ao guardar (ver camada de mimo)
3. **Horário** (`/horario`) — grelha semanal real, destaca dia/tempo lectivo actual
4. **Perfil** (`/perfil`) — dados académicos, tema, **primeiro logout que existiu na app**, depois ganhou: rever tutorial, central de ajuda, exportar dados, reparar cadeiras antigas
5. **Anotações** (`/anotacoes`, `/anotacoes/nova`, `/anotacoes/:id`) — notas de aula por cadeira/tipo, tags, favorito
6. **Casos Práticos** (`/casos`, `/casos/novo`, `/casos/:id`) — estrutura factos→questão→enquadramento→subsunção→conclusão, estado, painel de dúvidas agregadas de todos os casos no topo da lista
7. **Estudo** (`/estudo`) — cronómetro puro (`useCronometro.js`), histórico de sessões
8. **Glossário, Artigos, Leituras** — CRUD simples com formulário inline, sem rota de edição separada
9. **Pesquisa** (`/pesquisa`) — busca global sobre tudo (obrigou a extrair `useTarefas.js` do `Tarefas.jsx` para um hook partilhado)
10. **Flashcards** (`/flashcards`) — gestão + sessão de revisão com cartão a virar (CSS 3D flip)
11. **Ajuda** (`/ajuda`) — central com todos os tópicos em acordeão, mais o botão "?" contextual em toda a app

### Sistema de ajuda contextual
- `src/data/ajuda.js` — `resolverAjuda(pathname)`, cobre rotas fixas e dinâmicas (`/cadeiras/:id`, `/anotacoes/:id`, `/casos/:id`)
- `DicaPrimeiraVez.jsx` — banner que só aparece uma vez por página (guardado em `perfil/dados.dicasVistas`)
- `BotaoAjuda.jsx` — botão "?" fixo, sempre visível, abre modal com o tópico da página actual
- Tudo ligado **num único sítio** (`NavBar.jsx`), não em cada página — decisão deliberada para não ter de tocar em 15 ficheiros sempre que o texto de ajuda mudar

### Camada de mimo (a spec chama-lhe "funcionalidade de primeira classe")
- `src/data/frases.js` — **120+ frases 100% originais** (nunca copiadas de séries/filmes/música — regra explícita da spec), em 8 contextos: geral, madrugada, pós-nota-boa, pós-nota-excelente, pós-nota-baixa, sessão-longa, faltas-apertadas, antes-de-frequência
- `useFrase.js` — `escolherFrase(contexto)` (função pura, anti-repetição via localStorage) + `useFrase(contexto)` (hook, só escolhe no mount — ver nota sobre o padrão "key-remount" abaixo)
- `Celebracao.jsx` — confetti CSS puro + checkmark animado (stroke-dasharray) + frase, ao aprovar uma cadeira
- `EcraConsolo.jsx` — sem números grandes, sem vermelho agressivo, ao excluir
- `MensagemCarinhosa.jsx` — frase contextual reutilizável, usada em Cadeira (faltas apertadas) e Estudo (sessões ≥25min)
- Dashboard usa o banco novo em vez da lista fixa de 10 frases que tinha antes — com tom de madrugada entre as 23h e as 6h

### PWA / offline
- Firestore agora usa `initializeFirestore(app, { localCache: persistentLocalCache(...) })` em vez de `getFirestore()` — dados ficam em IndexedDB, funcionam sem rede, sincronizam sozinhos ao voltar
- `vite-plugin-pwa` configurado — manifest, service worker, instalável no ecrã principal do iPhone
- `public/icon.svg` novo — bordô + balança dourada (o favicon anterior era um roxo genérico do scaffolding do Vite, nunca tinha sido trocado)
- `index.html` ganhou meta tags `apple-mobile-web-app-*`, `theme-color`, `lang="pt-PT"` correcto

### Exportação / backup
- `src/services/exportar.js` — recolhe tudo (perfil, cadeiras+faltas+avaliação, eventos, tarefas, anotações, casos, artigos, glossário, leituras, sessões de estudo) e gera um `.json` para download
- Perfil → "⬇ Exportar os meus dados"
- `src/styles/imprimir.css` + classe `.no-print` (aplicada a sidebar/tabbar/menu+/botão de ajuda/botão de voltar) — Cadeiras ganhou um botão "🖨️ Imprimir" que usa `window.print()` para um resumo limpo em PDF

### Navegação
- `BotaoVoltar.jsx` — componente partilhado, `destino` fixo opcional (senão usa `navigate(-1)`)
- Retrofitado em Anotações, Casos, Artigos, Glossário, Leituras, Estudo, Pesquisa (não tinham nada)
- **Nota de inconsistência**: `Cadeira.jsx`, `Anotacao.jsx`, `Caso.jsx` têm botões de voltar mais antigos, escritos à mão antes de o componente partilhado existir — funcionam bem, mas não usam o `BotaoVoltar.jsx`. Vale a pena unificar num passo de limpeza.
- Menu **+** foi reorganizado: chegou a ter 11 itens (mau para uso de uma mão no telemóvel — o Vini reparou). Ficaram só acções que criam algo (Tarefa, Anotação, Caso, Frequência, Falta, Nota, Estudar); o resto (Glossário, Artigos, Leituras, Pesquisa, Flashcards) passou para uma secção "Recursos" na página Cadeiras.

## decisões de arquitetura (e porquê)

- **Padrão "key-remount" em vez de `useEffect` + `setState`** para hidratar estado local editável a partir de dados assíncronos do Firestore. Motivo: o eslint (`react-hooks/set-state-in-effect`) rejeita chamar `setState` dentro de um efeito de forma incondicional. Solução usada repetidamente: o componente-pai só renderiza o filho quando os dados já chegaram (`{dados && <Filho dados={dados} />}`), e o filho usa `useState(() => valorInicial)` (lazy initializer) em vez de um efeito. Usado em `Cadeira.jsx` (SeccaoAvaliacao/SeccaoFaltas), `Anotacao.jsx`, `Caso.jsx`, `Celebracao.jsx`, `useFrase.js`. **Se precisares de fazer o mesmo padrão outra vez, é este o caminho.**
- **`Celebracao` tem de ser montado condicionalmente pelo pai** (`{celebracaoAtiva && <Celebracao .../>}`), não mantido sempre montado com uma prop `ativa` a alternar — senão o lazy initializer da frase só corre uma vez na vida do componente e nunca mais escolhe frase nova.
- **Ajuda contextual e Dica de primeira visita ligados só no `NavBar.jsx`**, não em cada página — para adicionar/editar ajuda de uma página basta mexer em `src/data/ajuda.js`.
- **`BotaoVoltar` com `destino` fixo vs `navigate(-1)`**: páginas só alcançáveis a partir de "Recursos" (Glossário, Artigos, Leituras, Pesquisa) usam `destino="/cadeiras"` fixo, porque é a única entrada real. Páginas alcançáveis a partir do menu + (Anotações, Casos, Estudo) usam `navigate(-1)`, porque não há um "pai" lógico único.
- **Schema do Firestore para faltas/avaliação foi redesenhado a meio da sessão**: o seed original tinha campos que não batiam certo com o que os motores precisam (`avaliarCadeira`/`estadoFaltas`). Agora `cadeiras/{id}/avaliacao/dados` guarda os inputs em bruto (`provaEscrita`, `outrosElementos`, `exameEscrito`, `exameOral`, `exameRecurso`, `melhoriaOral`) e `cadeiras/{id}/faltas/dados` guarda (`aulasPraticasLecionadas`, `faltasInjustificadas`, `faltasJustificadas`). Os motores calculam tudo o resto em tempo real a partir destes — nunca se guarda o resultado calculado.
- **`seedCadeiras()` e `limparCadeirasAntigas()` exportados separadamente** de `initFirestore.js`, para o Perfil poder oferecer um botão de reparação a contas de teste antigas (criadas antes da correcção do seed do 1º→2º ano), sem precisar de registar de conta nova.

## incidentes desta sessão (importante para não repetir)

### 1. Deploy sem `.env` válido partiu a produção
Depois da Fase 0, fiz 3 deploys sem verificar que este checkout tinha `.env` — não tinha. `apiKey` ficava `undefined`, Firebase rebentava (`auth/invalid-api-key`) logo ao iniciar, ecrã ficava completamente em branco (`<div id="root">` vazio, nem o splash screen chegava a aparecer). O Vini reportou "não dá para fazer nada"; diagnostiquei por uma screenshot da consola do browser. Resolvido via `firebase apps:sdkconfig` (CLI já autenticado, não precisei de pedir nada ao Vini). Ver a secção "mais importante" no topo — isto é o risco nº1 para uma sessão futura.

### 2. Token do GitHub colado no chat
A meio de resolver um problema de permissões do `git push`, o Vini colou um Personal Access Token do GitHub directamente numa resposta a uma pergunta de escolha múltipla (não devia ter sido ali). O classificador de segurança automático bloqueou-me de usar esse token em qualquer comando Bash — correctamente, e não tentei contornar isso por vias alternativas. Disse ao Vini para revogar o token (confirmou que sim) e pedi para ele próprio correr `git push` no terminal dele, o que resolveu (a credencial ficou bem guardada no Git Credential Manager da máquina dele depois disso). **Push continuou a funcionar sozinho por mim durante o resto da sessão, sem precisar de mais nada.**

### 3. Pasta `repos/` inesperada
A meio da sessão apareceu uma pasta `repos/` na raiz do projeto com 6 repositórios clonados (skills/plugins do Claude Code: andrej-karpathy-skills, caveman, impeccable, skills-main, superpowers, ui-ux-pro-max-skill). Tratei inicialmente como suspeito — `git status` mostrava-a como não rastreada apesar de um `git check-ignore` alegar uma regra `.gitignore:26:repos/` que não existia de facto no ficheiro (nunca percebi bem a causa desta inconsistência). Reforcei a exclusão manualmente (`/repos/` no `.gitignore`, confirmado a funcionar) e restringi o `vitest` a `src/**/*.test.{js,jsx}` (o vitest tinha começado a correr os testes desses repos externos, dando um "14 failed" que nada tinha a ver com o JurisLeo). **O Vini depois confirmou que foi ele próprio que pôs a pasta lá, de propósito, para me ajudar** — não é um bug nem contaminação.
- `caveman` e `impeccable` já estão disponíveis como skills instaladas nesta sessão — nada a fazer.
- As outras 4 (`andrej-karpathy-skills`, `skills-main`, `superpowers`, `ui-ux-pro-max-skill`) têm `.claude-plugin/marketplace.json` válidos mas **não consegui instalá-las** — preciso do CLI `claude` (comandos `plugin marketplace add` / `plugin install`), que não está acessível a partir desta sessão (corro dentro da extensão VSCode, sem esse binário no PATH). Também descobri que `~/.claude/skills/synced/` é uma cache gerida por sincronização remota, não uma pasta para copiar ficheiros à mão — não tentei fazer isso à força. **Ficou por fazer.** Comandos para o Vini correr num terminal interactivo:
  ```
  claude plugin marketplace add "C:\Users\MARCUSSILVA\Desktop\JurisLeo-main\repos\andrej-karpathy-skills-main"
  claude plugin marketplace add "C:\Users\MARCUSSILVA\Desktop\JurisLeo-main\repos\skills-main"
  claude plugin marketplace add "C:\Users\MARCUSSILVA\Desktop\JurisLeo-main\repos\superpowers-main"
  claude plugin marketplace add "C:\Users\MARCUSSILVA\Desktop\JurisLeo-main\repos\ui-ux-pro-max-skill-main"
  ```
  depois `claude plugin install <nome>` para cada uma (ou `/plugin` numa sessão interactiva, para escolher visualmente).

### 4. `CLAUDE.md` apareceu sozinho, com regras que contradizem o ritmo desta sessão
A meio da construção das páginas Cadeiras/Cadeira/Horário/Perfil, surgiu um ficheiro `CLAUDE.md` na raiz que eu não criei — quase de certeza gerado pela skill `/init`, correndo numa janela paralela do Vini. O conteúdo está factualmente correcto (descreve bem o estado do código naquele momento), mas tem regras de processo tipo "auditoria primeiro, código depois... parar e esperar aprovação antes de mudanças grandes", "um passo de cada vez, perguntar antes de avançar", "decisões visuais nunca avançam sem preview aprovado" — que contradizem directamente o "força", "continua", "implementa tudo" que o Vini pediu repetidamente pelo chat durante o resto da sessão. Avisei-o uma vez; ele não respondeu directamente a isso (só disse "continua"). **Este ficheiro continua no repositório tal como a skill `/init` o gerou.** Uma sessão futura vai carregá-lo automaticamente como instruções do projecto — se calhar vale a pena o Vini decidir se quer mesmo essas regras de cautela, ou se prefere editá-las para reflectir o ritmo rápido que pediu.

## o que falta claramente (e o que fica de fora por decisão, não por esquecimento)

**Fora de scope, por decisão explícita do Vini:**
- Assistente de IA — a spec já dizia "não implementar" na secção 23; o Vini confirmou a meio da sessão (numa pergunta sobre APIs grátis, respondeu "só queria saber por curiosidade") que não é para mudar isso agora.

**Nunca chegámos a construir, sem terem sido pedidos directamente:**
- Instalação das 4 skills externas (ver incidente #3 acima) — precisa do CLI `claude` numa sessão interactiva do Vini.
- Os campos de personalização do topo da spec original (alcunha, aniversário, cor preferida, piadas internas, séries favoritas) continuam todos `[A PREENCHER]`. A camada de mimo foi construída sem eles (frases genéricas mas calorosas, sem referências pessoais). Se o Vini preencher esses campos nalgum momento, dá para tornar as frases e o easter egg do Onboarding mais pessoais.
- `calendarioEscolar.js` como ficheiro próprio (calendário oficial completo 2026/2027) — só existe um subconjunto (`calendarioS1`) dentro de `dadosLeonor.js`, suficiente para semear o calendário mas sem, por exemplo, um "faltam X dias para o Natal" no Dashboard.
- `coincidencias.js` (detector de coincidências de exames) — não construído, porque ainda não há datas reais de frequências para operar em cima (a spec di-lo explicitamente: "ainda não saíram").
- `planoEstudos2Ano.js` genérico (as 3 turmas TA/TB/TAN completas) — só construí `dadosLeonor.js`, específico da turma dela. É suficiente para o caso de uso real (utilizadora única, turma conhecida), mas a spec original tinha o ficheiro mais genérico.
- Limpeza: unificar `Cadeira.jsx`/`Anotacao.jsx`/`Caso.jsx` para usarem o `BotaoVoltar.jsx` partilhado, em vez dos botões antigos escritos à mão.
- Code-splitting — o bundle já vai em ~815KB (240KB gzip), o Vite avisa sempre no build. Não é urgente, mas uma divisão por rota (`React.lazy`) resolvia isto se algum dia importar.

## próximo passo concreto

**Pedir ao Vini para testar a última leva de funcionalidades** (Flashcards, camada de mimo — celebração/consolo, PWA/instalação no ecrã principal, exportação de dados, central de Ajuda) — nada disto foi testado por ele ainda, só eu verifiquei que compila/builda/os testes passam. Depois disso, as prioridades naturais seriam: (1) resolver a instalação das 4 skills pendentes, (2) decidir o que fazer com o `CLAUDE.md` conflituoso, (3) preencher os campos de personalização se o Vini quiser aprofundar a camada de mimo.

## ficheiros tocados (visão geral, não exaustiva)

- `src/services/`: `firebase.js`, `auth.js`, `initFirestore.js`, `initCalendario.js`, `avaliacao.js`(+test), `faltas.js`(+test), `repeticaoEspacada.js`(+test), `exportar.js`
- `src/data/`: `dadosLeonor.js`, `motivosFalta.js`, `frases.js`, `ajuda.js`
- `src/hooks/`: `useCadeiras.js`, `useCadeira.js`, `useAnotacoes.js`, `useAnotacao.js`, `useCasos.js`, `useCaso.js`, `useArtigos.js`, `useGlossario.js`, `useLeituras.js`, `useTarefas.js`, `useFlashcards.js`, `useCronometro.js`, `useSessoesEstudo.js`, `useFrase.js`, `useDicaPrimeiraVez.js`, `useDashboard.js` (actualizado), `useCalendario.js`
- `src/components/`: `BotaoVoltar.jsx`, `BotaoAjuda.jsx`, `DicaPrimeiraVez.jsx`, `Celebracao.jsx`, `EcraConsolo.jsx`, `MensagemCarinhosa.jsx`, `Tutorial.jsx`, `NavBar.jsx` (muito alterado), `ModalCriarEvento.jsx` (edição)
- `src/pages/`: `Cadeiras`, `Cadeira`, `Horario`, `Perfil`, `Anotacoes`, `Anotacao`, `Casos`, `Caso`, `Estudo`, `Glossario`, `Artigos`, `Leituras`, `Pesquisa`, `Flashcards`, `Ajuda` (todas novas), `Dashboard.jsx` (frase + card de tarefas reais), `Tarefas.jsx` (hook extraído)
- Config: `vite.config.js` (PWA + vitest scope), `firebase.json`, `firestore.rules`, `index.html`, `.gitignore`, `package.json`
- `public/icon.svg` (novo)
- `src/styles/imprimir.css` (novo)

## skills sugeridas para a próxima sessão

- `/code-review` — a app cresceu muito rápido; uma revisão de correção (não só estilo) antes de a Leonor começar a usar a sério seria prudente, principalmente aos motores de avaliação/faltas e às regras do Firestore.
- `/security-review` — nunca corrido nesta sessão; vale a pena, mesmo sendo uma app de uma só utilizadora.

## notas extras

- Git: `https://github.com/MVini16/JurisLeo.git`, branch `main`. Push a funcionar sem fricção desde a resolução do incidente #2.
- Firebase: projecto `jurisleo-67124`, autenticado no CLI desta máquina.
- `npm test` = vitest (48 testes), `npm run lint` = eslint (0 erros, 1 warning antigo em `Calendario.jsx` sobre dependências de um `useEffect`, inofensivo e pré-existente).
- GSAP e anime.js foram instalados (npm) a pedido do Vini para animações futuras, mas **ainda não são usados em lado nenhum do código** — só CSS puro até agora, como a spec original pedia.
