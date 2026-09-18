# Estado real do código — auditoria de 18-09-2026

Feita sobre o branch `fase-2` (criado a partir de `main`, commit `1bd1b61`). Nada foi alterado no código. Cada ponto tem o ficheiro onde foi confirmado.

## Os 10 pontos pedidos

1. **`Tarefas.jsx`** — página completa e ligada ao Firestore. Lista, cria, edita, conclui e apaga tarefas (`addDoc`, `updateDoc`, `deleteDoc`); filtros por cadeira, agrupamento por cadeira ou por prazo, modal de criar/editar. A leitura vem do hook `useTarefas` (`onSnapshot` em `users/{uid}/tarefas`). Abre o modal logo se vier do menu + (`location.state.abrirModal`). → `src/pages/Tarefas.jsx`, `src/hooks/useTarefas.js`
2. **Dashboard** — ligado ao Firestore por `useDashboard` (perfil, `eventos`, `aulasSemanais`, tudo em `onSnapshot`) e por `useTarefas` (card de tarefas pendentes). Mostra as aulas de hoje e a próxima frequência. **Não tem** "aula a decorrer" e "aula seguinte" (só lista as aulas do dia). → `src/hooks/useDashboard.js`, `src/pages/Dashboard.jsx`
3. **Caminho real dos dados** — `users/{uid}/...`. Não existe `utilizadores/`. → `src/services/initFirestore.js:14`, `firestore.rules`
4. **Subcoleções que existem de facto** — sob `users/{uid}`:
   - documentos únicos `dados`: `perfil/dados`, `configuracoes/dados`
   - `cadeiras/{id}` com `faltas/dados` e `avaliacao/dados` por dentro
   - `eventos`, `aulasSemanais`, `tarefas`, `anotacoes`, `casos`, `glossario`, `artigos`, `leituras`, `flashcards`, `sessoesEstudo`
   
   → grep de `collection(db, 'users', …)` em `src/hooks/*`, `src/services/exportar.js`
5. **Fase 0, `src/data/` e `src/styles/`** — a Fase 0 (commit `62a4990`) criou só `src/data/dadosLeonor.js`. Não criou nada em `src/styles/`. Os outros ficheiros que lá estão vieram depois: `data/motivosFalta.js`, `data/frases.js`, `data/ajuda.js` e `styles/imprimir.css`. **Não existem** `data/feriados.js`, `data/calendarioEscolar.js`, `data/planoEstudos2Ano.js`. → `git show --stat 62a4990`
6. **Regras do Firestore** — endurecidas e publicadas. O ficheiro só permite `users/{uid}` (e subcoleções) ao próprio utilizador autenticado. Confirmado por um pedido sem autenticação à API REST de `jurisleo-67124`, que devolveu `403 PERMISSION_DENIED` (em modo de teste devolveria 404). `firebase.json` referencia `firestore.rules` e `firestore.indexes.json` desde `01e934c`. → `firestore.rules`, `firebase.json`
7. **Seed com as cinco cadeiras do 2.º ano** — sim. `seedCadeiras` usa `cadeirasS1`: DA I, DIP I, DO I, DF e HRI, turma A, subturma 7, todas em Método A. Ficou também `limparCadeirasAntigas` para contas de teste com o seed do 1.º ano. → `src/services/initFirestore.js`, `src/data/dadosLeonor.js`
8. **`firebase.js` e `initFirestore.js` em `src/services/`** — sim, movidos (`src/firebase.js` e `src/initFirestore.js` já não existem). → `src/services/`
9. **Menu + da NavBar** — faz coisas reais. Oito itens: Nova Tarefa (`/tarefas`, abre o modal), Nova Anotação, Novo Caso, Estudar, Nova Frequência (abre `ModalCriarEvento` ali mesmo) e três que só navegam para `/cadeiras`: **Oral de Melhoria**, **Registar Falta** e **Lançar Nota**. Estes três enviam `state.abrirModal`, mas `Cadeiras.jsx` não o lê, portanto ficam só na lista de cadeiras, sem abrir nada. → `src/components/NavBar.jsx:83-92`, `grep abrirModal`
10. **Modal de editar evento** — preenche os campos: com `eventoExistente`, o `useState` inicial carrega título, data, horas, tipo, cadeira, notas, importância, estado e `contaFalta`, e grava com `updateDoc`. O Calendário liga-o (`eventoEditar`). → `src/components/ModalCriarEvento.jsx:34-50,124-125`, `src/pages/Calendario.jsx:196`

## Discrepâncias importantes com o prompt da sessão

- **Os motores já existem e têm testes.** `src/services/avaliacao.js` já exporta `arredondar`, `calcularNotaAC`, `avaliarCadeira`, `simularNotaNecessaria`, `calcularMediaAnual` e `escalaQualitativa`. `src/services/faltas.js` exporta `estadoFaltas`. `npm test` passa: **48 testes, 3 ficheiros** (avaliação, faltas, repetição espaçada). Ou seja, as tarefas 3, 4, 7 e 8 do prompt já estão feitas (commit `e50e811`). Falta confirmar contra a spec se cobrem os 25 casos e os 8 casos numerados e se o `faltas.js` respeita o ponto 7.4 (ver abaixo).
- **`faltas.js` não segue o ponto 7.4 do prompt.** O motor devolve `faltasRestantes` calculado sobre as aulas *lecionadas* até hoje, não sobre as 30 previstas, e o semáforo fica vermelho/amarelo só por essa proporção. O prompt quer o número principal sobre as 30 previstas, a proporção corrente como número secundário e nunca vermelho antes de metade do semestre com base só na proporção. Isto **contradiz** o código atual, por isso é decisão a tomar.
- **Não existe página `Notas`.** As notas vivem em `/cadeiras/:id` (`Cadeira.jsx`), que já liga os motores e já usa `Celebracao` e `EcraConsolo`. Isso cobre parte das tarefas 5 e 6 (lançar nota + celebração/consolo), mas não há `ArvoreAvaliacao`, simulador com slider, pesos editáveis nem média anual. `simularNotaNecessaria` e `calcularMediaAnual` existem no motor e **não são usadas em nenhuma página**.
- **`Cadeira.jsx` não tem tabs** (Resumo, Anotações, Casos, Notas, Faltas, Leituras, Flashcards). `Cadeiras.jsx` já lista as cadeiras com semáforo e estado.
- **`Horario.jsx` é só leitura**, lê de `dadosLeonor.js` (não do Firestore). Grelha semanal com destaque de hoje e do tempo em curso. Sem vista de hoje no mobile, sem ações ao tocar numa aula, sem edição. Não mostra docente (o campo não existe em `horarioS1`).
- **Calendário (`Calendario.jsx` + `useCalendario.js`)**: eventos com uma só `data` (sem `dataInicio`/`dataFim`), aulas expandidas a partir de `aulasSemanais`. **Não existe** `estadoAula` (`porMarcar`/`fui`/`faltei`/`stotFaltou`/`cancelada`), nem famílias de eventos, nem deteção de choques, nem feriados, nem épocas de exames. `aulasPraticasLecionadas` é um número que a utilizadora edita à mão em `Cadeira.jsx`; nada o conta a partir do calendário.
- **Tipografia**: `src/index.css` usa só Georgia (`font-family: 'Georgia', serif`). Não há Playfair Display nem Lato em `index.css` nem em `index.html`.
- **`docs/SPEC.md` não existe** neste repositório (a pasta `docs/` também não existia). A tarefa 2 depende dela.

## Outras notas

- `.env` existe na máquina local (fora do git). Ver `HANDOFF.md` para o risco de deploy sem ele.
- Rotas: 21 em `src/App.jsx`, sem `/notas`. `/anotacoes/nova` e `/casos/novo` não têm rota própria: caem em `/anotacoes/:id` e `/casos/:id` com `id` = `nova`/`novo`.
- Estado do build/lint desta auditoria: só `npm test` foi corrido (verde). `npm run build` e `npm run lint` não foram corridos.
