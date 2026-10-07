# Handoff: sessão de 07-10-2026 (parte 2)

Continua o `docs/handoff-07-10-2026-final.md`. Esta sessão acrescentou presenças, feed, sumários, cadernos, desktop e cópia automática. Versão publicada: **2026-10-11**.

## 1. Estado
- Branch `claude/intelligent-goldberg-s0lmvv`, tudo commitado, pushado e **publicado** (último commit de deploy: "Deploy: feed, sumários, cadernos, desktop...").
- `npm run lint`: 0 erros (1 aviso antigo no Calendário). `npx vitest run`: 454 testes a passar.
- Nada disto foi testado no ecrã com login real nem num iPhone. Só em código, testes e capturas do build sem login (`/anotacoes` em mobile e desktop).
- Como publicar: igual ao handoff anterior (mudar `.github/deploy-trigger.txt` e fazer push). Regra 9 do CLAUDE.md: acrescentar entrada no topo de `src/data/novidades.js` antes.

## 2. O que entrou (por zonas)
**Presenças e faltas**
- `services/presencas.js` + `data/estadosAula.js`: estados fui, faltei, faltei com justificação, o professor faltou, não houve aula (+ atalho "estive doente"). Só as práticas (`contaFalta`) contam para o motor `faltas.js`, que **não foi alterado nas fórmulas**.
- Marcas guardadas num só documento por cadeira: `cadeiras/{id}/presencas/dados` (`marcas`, `notasAulas`). Sem coleções novas, sem mexer em regras nem índices.
- Calendário: marcar a aula no detalhe, etiquetas nas vistas, lembrete "aulas por marcar" com "Fui a todas" (com confirmação), práticas realçadas, teóricas tracejadas, aula em curso a piscar.
- Dashboard: bloco "Aulas de hoje" com Fui/Faltei. Página `/faltas` (anel, semáforo, simulador, comprovativos, histórico). Faltas em Cadeiras somam as marcas ao "ajuste manual".
- Corrigido o falso "Excluída" (0 aulas dadas dava `0 >= 0`).
- Opção "As minhas faltas" na partilha com o Vini (desligada por omissão).
- Não se afirma nenhum prazo de comprovativo para aulas: o de 24h em `motivosFalta.js` é de faltas a **exames**.

**Sumários**
- No detalhe da aula: sumário em tópicos, nota, trabalho para casa e dúvida (os dois últimos são palpite, ela não se lembrava das outras duas opções do sumário antigo).
- `/sumarios`: junta tudo por cadeira, flashcard por aula ou por tópico (a resposta é ela que escreve), partilhar texto e imprimir em PDF. Word direto não foi feito.
- O sumário antigo foi tirado pelo Vini de propósito numa versão anterior; o que ela escreveu nessa versão **não foi recuperado** (não se sabe onde o guardava).

**Modo Feed (`/feed`)**
- `services/feed.js` (mistura flashcards, V/F, escolha múltipla, glossário, aulas por marcar e avisos, com mais peso ao que está em atraso), `feedLocal.js`, `pages/Feed.jsx`, `components/feed/` (cartas estilo cartaz, barra social, ecrã "já chegaste" com anel dourado, `AlternarModo`).
- Preferência `modoApp` ('normal' | 'social'): ela alterna no Dashboard, na barra lateral e em "Mais". A app normal fica intacta. Escolhas aprovadas: carta A, barra 1, ecrã final A.
- Limite assumido: sem truques de vício (sem scroll sem fim a esconder a saída, sem culpa). A meta do dia fecha com "já chegaste" e ela decide.

**Cadernos e desktop**
- Estante em dois estilos (prateleira e capas), preferência `estanteEstilo`, botão na página das notas e nas Definições.
- Desktop (≥1100px): `pages/CadernosDesktop.jsx` em três painéis (atalhos N e /), editor embutido (`Anotacao` com `idProp`/`embutida`). Barra lateral completa e agrupada a partir de `data/destinos.js`, paleta Ctrl+K (`PaletaComandos`), Dashboard em duas colunas (≥1000px).

**Ícones, carregamento e ajuda**
- `components/icones/Icone.jsx`: conjunto próprio de ícones SVG animados.
- `EcraCarregar` com frases do Barney e do Damon (`data/carregamento.js`, preferência `carregamento`, escolha em Definições, Brincadeiras).
- Ícone novo (balança com coração e livro, arco, azulejo, cúpula da Estrela) em `public/icon.svg` e PNG (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`), ligado ao manifesto. No iPhone só se vê depois de tirar a app do ecrã principal e voltar a adicioná-la.
- Ajuda: guia completo em `data/guia.js` (renderizado em `/ajuda`) e tópicos novos. **Ao acrescentar uma função, atualizar `guia.js` e `novidades.js`.**

**Nada se perde**
- `hooks/useSincronizarLocal.js` + `services/sincronizarLocal.js`: todas as chaves `jurisleo-*` do localStorage (escolhas, séries, recordes, guardados do feed...) são copiadas sozinhas para `configuracoes/dados.copiaLocal` (campo novo, mesmo documento) e voltam num telemóvel novo. Ganha a versão mais recente de cada chave. Exclui `jurisleo-versao-*`, `-boneco-checkin`, `-admin-resumos`, `-theme` e as `jurisleo-sync-*`. O CLAUDE.md foi atualizado (antes dizia "nunca no Firebase").

**Notificações**
- `public/push-sw.js`: ícone PNG e abre a página indicada no payload (só caminhos da própria app).
- `.github/workflows/lembrete-noite.yml`: lembrete fixo seg a sex às 19:30 UTC. **Só corre depois de estar na `main`** (o GitHub só agenda a partir da branch por omissão) e só com `PUSH_SUBSCRIPTION`. O texto não depende dos dados dela.

## 3. Pendências (por ordem)
1. Testar no iPhone dela: Feed, marcar aulas, sumário, estante, ícone, sincronização (abrir a app num segundo aparelho e ver se as escolhas aparecem).
2. Perguntar-lhe as outras duas opções do sumário antigo e confirmar se "trabalho para casa" e "dúvida" servem.
3. Se houver código do sumário antigo no PC do Vini, ligar os dados antigos ao sítio novo.
4. Fazer merge para `main` se quiserem o lembrete da noite; e ela ativar as notificações (Definições, Os meus dados, Avisos de versão nova) + Vini criar o segredo `PUSH_SUBSCRIPTION`.
5. Desktop: ainda não há coluna do dia à direita no Dashboard (só duas colunas). Estante e três painéis dependem de ela gostar.
6. Verificar as perguntas dos jogos contra o Código Civil/CPA/CVDT (art. 1722.º do Código Civil por confirmar).
7. Vini apagar do PC o `.json` da conta de serviço Firebase.
8. Opcional: "dias juntos" (precisa da data), mais cartas "Abre quando", exportação direta de sumários para Word.

## 4. Decisões e regras a manter
- Sem alterar `firestore.rules`, índices, `firebase.json` nem criar coleções. Novos dados vão para documentos existentes ou para o padrão `dados`.
- Não inventar regras da faculdade. Antes de mexer em `faltas.js`, `avaliacao.js` ou `dadosLeonor.js`, confirmar com a Leonor.
- Privacidade: a consola do Vini só mostra o que ela escolhe enviar. Não criar recolha escondida (nem lembretes que leiam os dados dela).
- Surpresa em `public/s/...`: não mexer no número da versão só por causa dela; endereço do QR na `firebaseapp.com`.
- Não usar `pkill -f` (mata o terminal). `git push` às vezes dá 500: repetir.
