# JurisLeo — Contexto do Projeto

## O que é
App pessoal de organização académica para a Leonor, estudante de Direito na FDUL (2.º ano, turma A, subturma 7). Regista horário, cadeiras, tarefas, calendário e faltas, e calcula sozinha o estado de avaliação e de faltas de cada cadeira segundo o regulamento real da faculdade. É uma app de uma só utilizadora — feita por medida para ela, não um produto para terceiros.
Stack: React 19 + Vite + Firebase (Firestore + Authentication) + Firebase Hosting.
Projeto Firebase: `jurisleo-67124` (ver `.firebaserc`).

---

## PROCESSO DE TRABALHO (regras invioláveis)

1. **Auditoria primeiro, código depois.** Antes de qualquer alteração: ler os ficheiros reais envolvidos (componente, serviço, regras), reportar o que se encontrou, parar e esperar aprovação antes de mudanças grandes. Nunca assumir o estado do código — verificar sempre.
2. **Um commit por tarefa.** Ficheiros novos são commitados assim que criados, nunca deixados pendentes.
3. **Um passo de cada vez.** Perguntar se está tudo bem antes de avançar para o passo seguinte, sobretudo em decisões visuais ou de regras de negócio.
4. **Decisões visuais nunca avançam sem preview aprovado.** Gerar a opção (ou 2-3 opções), esperar escolha, só depois código real.
5. **Antes de escrever código, descrever sempre:** que ficheiro(s), que função/secção, o que cada parte faz.
6. **Em dúvida, perguntar.** Nunca inventar regras académicas, prazos ou fórmulas — ver secção "Regras de negócio" abaixo.
7. **Mensagens de commit descritivas** do que o commit realmente contém.
8. **Cadeia de deploy (só quando pedido explicitamente, nunca automático):**
   ```bash
   npm run build && firebase deploy --only firestore,hosting
   ```
   `firestore` inclui as regras (`firestore.rules`) e os índices (`firestore.indexes.json`) — nunca fazer deploy só do hosting quando as regras ou os índices mudarem.

---

## REGRAS ARQUITETURAIS (nunca violar)

- **Stack fixa:** React + Vite + Firebase. Nada de trocar por outra framework ou de adicionar um segundo state manager (context + hooks chegam para uma app desta escala).
- **Separação de camadas, já em uso e para manter:**
  - `src/pages/` → um componente por rota (`App.jsx` define as rotas com `react-router-dom`)
  - `src/components/` → peças reutilizáveis entre páginas (ex. `NavBar`, `ModalCriarEvento`)
  - `src/services/` → lógica pura de negócio (sem Firebase, sem React) **e** os wrappers do Firebase (`firebase.js`, `auth.js`, `initFirestore.js`, `initCalendario.js`)
  - `src/hooks/` → hooks que ligam a UI aos dados (`useDashboard`, `useCalendario`), normalmente com `onSnapshot`
  - `src/context/` → estado partilhado entre páginas (`ThemeContext`)
  - `src/data/` → dados fixos e reais da Leonor (cadeiras, motivos de falta) — nunca inventar cadeiras, regentes ou datas que não estejam aqui
- **Motores de negócio são funções puras e testadas.** `avaliacao.js` e `faltas.js` não importam Firebase nem React de propósito: dá para testar com `vitest` sem mocks. Qualquer regra nova de avaliação/faltas segue este padrão — a UI nunca reimplementa a fórmula, só chama a função.
- **XSS:** o React escapa por omissão. A única forma de furar isto é `dangerouslySetInnerHTML` — evitar sempre; se algum dia for mesmo necessário (ex. texto rico vindo do Firestore), sanitizar antes.
- **Sem cores hardcoded fora do `index.css`.** As variáveis (`--burgundy`, `--gold`, `--bg-light`, `--bg-dark`, etc.) vivem em `:root` e no bloco `@media (prefers-color-scheme: dark)`; CSS de página/componente usa sempre `var(--...)`.
- **Listeners do Firestore (`onSnapshot`) têm sempre de ser desligados** no `return` do `useEffect` (padrão já usado em `useDashboard`/`ThemeContext` com `unsub`). Um listener esquecido continua a gastar leituras depois do componente desmontar.

---

## LIÇÕES DE FIREBASE (contexto obrigatório antes de mexer em regras ou dados)

- **`firestore.rules` já está correta e minimalista:** `match /users/{uid}` com `allow read, write: if request.auth != null && request.auth.uid == uid`, e um `match /{document=**}` recursivo por baixo para cobrir todas as subcoleções (`perfil`, `configuracoes`, `cadeiras/{id}/faltas`, `cadeiras/{id}/avaliacao`, etc.). O comentário no ficheiro já explica: é a única utilizadora, mas a regra fica correta na mesma — **manter esse espírito**: nunca simplificar para uma regra mais permissiva só porque "é só ela".
- **Padrão de documento:** cada subcoleção tem um único documento chamado `dados` (`perfil/dados`, `configuracoes/dados`, `cadeiras/{id}/faltas/dados`, `cadeiras/{id}/avaliacao/dados`). Ao adicionar um nó novo, seguir este padrão em vez de inventar um esquema diferente — mantém `initFirestore.js` e as regras previsíveis.
- **As variáveis `VITE_FIREBASE_*` no `.env` não são segredos verdadeiros.** O Vite embebe-as no bundle final: quem inspecionar o JavaScript da app publicada vê a `apiKey` na mesma. Isto é normal e esperado para configuração pública do Firebase (a segurança real está nas `firestore.rules`, não em esconder esta chave) — mas o `.env` continua fora do git por organização e para não obrigar a reescrever o ficheiro em cada máquina. Existe `.env.example` com os nomes das variáveis vazios.
- **`initCalendario.js` e `initFirestore.js` só correm no registo** (`registar()` em `auth.js`). Se a estrutura de dados mudar, uma conta já criada não é atualizada sozinha — qualquer migração de esquema tem de ser pensada à parte (não há painel de administração nem função de migração ainda).
- **Sincronização tema Firestore ↔ localStorage** (`ThemeContext.jsx`) usa um `useRef` (`aCarregarDoFirestore`) para não reescrever no Firestore o valor que acabou de vir de lá. Padrão a repetir sempre que houver um estado sincronizado nos dois sentidos entre local e remoto, para não entrar em ciclo.

---

## REGRAS DE NEGÓCIO (nunca inventar, só copiar do regulamento real)

- **Avaliação** (`src/services/avaliacao.js`): segue o Regulamento de Avaliação de Conhecimentos da Licenciatura em Direito da FDUL. Método A (avaliação contínua) e Método B (só exame) têm regras diferentes de admissão a oral, recurso e melhoria — já implementadas e testadas em `avaliacao.test.js`. Qualquer ajuste tem de citar a fonte (secção do regulamento) no comentário, como já é feito.
- **Faltas** (`src/services/faltas.js`): exclusão por um quarto ou mais das aulas práticas lecionadas com falta injustificada, ou por metade ou mais das previstas no calendário (justificadas + injustificadas). Testado em `faltas.test.js`. `src/data/motivosFalta.js` tem a lista exata de motivos aceites e o prazo de 24h para comprovativos — são etiquetas oficiais, não parafrasear.
- **`src/data/dadosLeonor.js`** é a fonte de verdade das cadeiras reais do semestre (nome, regente, método, aulas previstas). Vem do horário oficial da FDUL, cruzado com programas e regentes do ano letivo — citar sempre a fonte e a data quando for atualizado, como já está.
- Antes de alterar qualquer fórmula destes três ficheiros, confirmar com a Leonor (via Vini) que a leitura do regulamento está correta — não assumir por lógica própria.

---

## Estrutura de ficheiros (levantada em 17-09-2026)

Entrada: `index.html` → `src/main.jsx` → `src/App.jsx` (rotas).

Páginas (`src/pages/`): `SplashScreen`, `Login`, `Onboarding` (sem NavBar) · `Dashboard`, `Horario`, `Cadeiras`, `Tarefas`, `Calendario`, `Perfil` (com `NavBar`).

Componentes (`src/components/`): `NavBar`, `ModalCriarEvento`.

Hooks (`src/hooks/`): `useDashboard`, `useCalendario`.

Contexto (`src/context/`): `ThemeContext` (+ `useTheme.js`).

Serviços (`src/services/`): `firebase.js` (config + `db`/`auth`), `auth.js` (registar/login/logout, chama `initFirestore` e `initCalendario` no registo), `initFirestore.js`, `initCalendario.js`, `avaliacao.js` + `avaliacao.test.js`, `faltas.js` + `faltas.test.js`.

Dados (`src/data/`): `dadosLeonor.js` (cadeiras reais, cores), `motivosFalta.js`.

Config: `vite.config.js`, `eslint.config.js`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.firebaserc` (projeto `jurisleo-67124`).

---

## Design

- Paleta: burgundy `#6B0F1A` + gold `#C9A84C`, sobre fundo claro `#FAF8F5` / escuro `#1A1014` — tudo via CSS custom properties em `src/index.css`.
- Tipografia: Georgia (serif) — tom mais formal/académico, coerente com o tema de Direito.
  - Exceção aprovada pelo Vini (25-09-2026): no ecrã de início estilo iOS, os títulos e nomes ficam em Georgia e os rótulos pequenos e números usam a fonte do sistema (`var(--fonte-sistema)`, SF no iPhone).
  - Exceção aprovada pelo Vini (24-09-2026): dentro do caderno digital (`EditorCaderno`), a Leonor pode escolher uma letra manuscrita (Caveat, Google Fonts) ou moderna (Lato) para cada página. O resto da app continua em Georgia.
- Tema claro/escuro: segue `prefers-color-scheme` por omissão, mas a Leonor pode escolher no onboarding/perfil; a escolha fica em `localStorage` (`jurisleo-theme`) e sincronizada no Firestore (`configuracoes/dados.tema`), com o `useRef` anti-ciclo descrito acima.
- Viewport fixo sem zoom (`maximum-scale=1, user-scalable=no`) — a app assume-se mobile-first; testar sempre em ecrã de telemóvel antes de dar uma alteração visual como concluída.

## Convenções de código

- Comentários sempre em minúsculas, em português, simples e diretos — já é o padrão em 100% dos ficheiros existentes; manter.
- Nomes de funções e variáveis de domínio em português (`calcularNotaAC`, `estadoFaltas`, `avaliarCadeira`) — só APIs do React/Firebase é que ficam em inglês, por serem da biblioteca.
- Testes ficam ao lado do ficheiro que testam (`avaliacao.js` + `avaliacao.test.js`), com `vitest` (`describe`/`it`/`expect`). Qualquer função nova em `services/` que seja lógica pura (sem Firebase/React) devia nascer com teste.
- Nomes de ficheiros: componentes em PascalCase (`ModalCriarEvento.jsx`), serviços/hooks em camelCase (`useDashboard.js`, `faltas.js`).
- `npm run lint` antes de dar uma tarefa como terminada (eslint já configurado com `react-hooks` e `react-refresh`).

## Developer

- Vini — a construir esta app para a namorada (Leonor), como prenda/ferramenta real de uso diário dela. Ser direto sobre trade-offs, mas sem tornar isto mais complexo do que uma app de uma só utilizadora precisa de ser.
- A utilizadora real é a Leonor: qualquer texto de UI, mensagem de erro ou explicação de nota deve fazer sentido para uma estudante de Direito a usar isto no telemóvel entre aulas — direto, sem jargão técnico.

## Fim de sessão

Ainda não há vault Obsidian nem handoff definidos para este projeto. Se quiseres esse hábito aqui também (como no Next Baller), dizer onde deve ficar guardado o resumo de cada sessão.
