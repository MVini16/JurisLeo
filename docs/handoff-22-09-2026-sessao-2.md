---
data: 22-09-2026 (sessão 2, à tarde/noite — VS Code local, não cloud)
projeto: JurisLeo
branch: fase-2
---

# Handoff — 22-09-2026, sessão 2

Continuação da sessão cloud da manhã (ver `docs/handoff-22-09-2026.md`). Esta sessão foi local, no VS Code do Vini, com browser real — por isso deu para confirmar visualmente tudo o que a sessão cloud não conseguiu ver (o problema do "a carregar" nunca foi do proxy cloud, era um bug real — ver abaixo).

## Estado em 30 segundos

- Branch `fase-2`, 21 commits novos nesta sessão, todos no GitHub.
- `npm test`: **428 testes a passar**. `npx eslint src`: 0 erros. `npm run build`: passa.
- **As 30 ideias de `docs/IDEIAS-30.md` estão todas implementadas.**
- Site em produção verificado a funcionar (antes de qualquer deploy desta sessão).
- Revisão de código alargada feita (8 agentes, todo o diff do dia) — 6 bugs reais corrigidos, duplicações de código documentadas mas não mexidas (ver "por fazer" abaixo).

## O que foi feito, por ordem

### 1. Juntar a `fase-2` do GitHub com o trabalho local
A sessão cloud da manhã e esta sessão local tinham divergido desde 18-09 (30 commits locais vs 7 no GitHub), com sobreposição real: "campo família" e "modo frequência" tinham sido construídos dos dois lados, de forma diferente. Decisões tomadas com o Vini:
- **Coincidências de exames (art. 39.º):** fica só entre provas (frequência/oral/exame), a versão do GitHub — mais fiel ao artigo.
- **Modo Frequência:** as duas versões foram fundidas — cabeçalho animado (anel de dias, frase) da versão local, checklist da matéria com dois modos à escolha dela ("os teus temas" manual, ou "sumários das aulas" automático).
- Família do evento no modal: mantido o estilo de chips, consistente com o filtro já existente no Calendário.

### 2. Bug crítico: "a carregar" infinito num arranque a frio
Reproduzido num Chromium local normal — não era o proxy da sessão cloud, como se suspeitava. Quase todos os hooks de dados leem `getAuth().currentUser` de forma síncrona ao montar, mas a sessão do Firebase Auth só resolve de forma assíncrona. Corrigido num único sítio: `App.jsx` só monta as rotas depois do primeiro `onAuthStateChanged` (novo hook `useAuthPronto`), em vez de corrigir os ~15 hooks um a um.

### 3. Pesquisa real à FDUL (fd.ulisboa.pt)
Fui buscar o Regulamento de Avaliação e o Despacho 54/2026 (calendário escolar) reais, em PDF, para verificar as leituras que estavam por confirmar:
- **Calendário escolar 2026/2027:** todas as datas em `calendarioEscolar.js` batem certo, data a data, com o despacho oficial.
- **Regra de faltas:** o texto oficial (art. 14.º) bate certo, palavra a palavra, com `faltas.js`.
- **Regra de coincidências (art. 39.º):** o artigo só fala em "prova de exame", nunca em frequência (figura à parte, título II). Corrigido `explicarChoque()` para só citar o art. 39.º e o "direito a mudar de data" quando as duas provas são mesmo exames.
- Fechadas as últimas 3 decisões penduradas: fontes (fica Georgia, como o `CLAUDE.md` já mandava), intervalos dos flashcards (corrigido para 1-3-7-16-35, como a spec sempre pediu), aulas práticas 30 vs 26 (afinal não era conflito — só um número de exemplo nos testes).

### 4. As 13 ideias que faltavam da lista de 30 (`docs/IDEIAS-30.md`)
Implementadas em lotes, cada um testado e commitado à parte:
- **7** Modo Exame (90 min, cronómetro, escolhe um caso do arquivo)
- **8** Tópicos de Correção (marca tinha/faltou, diz o que reclamar — com o prazo real de 2 dias úteis do art. 29.º — e o que rever)
- **18** Horas por registar (adaptado: sem tracking de telemóvel, pergunta ao fim do dia se não houver sessão)
- **19** Foco atado a uma tarefa (cronómetro liga-se a uma tarefa; oferece continuar se saíres a meio)
- **22** Missões do dia (25 min, 10 cartões, 1 sumário)
- **23** Sequência a dois (opcional; a consola do Vini mostra só "estudou hoje: sim/não")
- **6** Baralho até à frequência (link do Modo Frequência para os flashcards da cadeira)
- **10** Ligações entre notas (artigos, casos e anotações mostram onde mais aparecem)
- **24** Toga que se completa (capelo, beca, fita, medalha — marcos reais)
- **25** Balanço de domingo (horas, cartões, sumários, pergunta da semana)
- **3** Agendamento que aprende (facilidade própria por flashcard, 0.5x-2.5x)
- **12** Mapas mentais (caixas e setas em SVG, por cadeira — MVP, não a "fase inteira" original)
- **15** Plano de estudo da semana (uma cadeira por dia, a partir das próximas provas)

### 5. Revisão de código alargada (8 agentes, ângulos diferentes)
Corri o `/code-review` a todo o diff do dia. Encontrou 6 bugs reais (todos corrigidos, ver commit `5f03929`):
1. Coincidências consigo próprias — um evento de vários dias chocava com a sua própria cópia do dia seguinte.
2. `proximaFrequencia` com o mesmo bug de comparação de datas que o plano de estudo tinha tido.
3-4. `TopicosCorrecao.jsx` e `MapaMental.jsx` sem guarda para item/mapa apagado — rebentava a página.
5. Sessão de estudo "a meio" contava tempo em pausa como estudo activo.
6. Balanço de domingo e Missões do dia podiam subcontar (hook limitado a 20 sessões).

## Por fazer — para a próxima sessão

### Duplicação de código (encontrada pela revisão, não corrigida)
Nenhum destes é um bug — são todos candidatos a limpeza, só vale a pena mexer com calma, não a meio de outra tarefa:
- `useMapasMentais.js` e `useTopicosCorrecao.js` duplicam quase linha a linha o padrão CRUD de `useCasos.js`/`useCaso.js`. Um `criarHookRecurso(colecao, camposIniciais)` genérico resolveria os três.
- `MapaMental.jsx`/`MapasMentaisLista.jsx` e `TopicosCorrecao.jsx`/`TopicosCorrecaoLista.jsx` partilham o mesmo esqueleto de formulário e de lista, copiado em vez de partilhado.
- `CartaoHorasPorRegistar.jsx` e `CartaoBalancoDomingo.jsx` duplicam o padrão "dispensar até X" com localStorage — um `useDispensavel(chave, chaveAtual)` resolvia.
- `useCadeirasAprovadas.js` usa os pesos estáticos de `dadosLeonor.js` em vez do documento `cadeiras/{id}` do Firestore (que `Cadeiras.jsx` usa) — só importa se ela alguma vez tiver pesos personalizados por cadeira guardados no Firestore, o que ainda não é possível fazer pela UI.
- `choquesPorDia()` em `coincidencias.js` ficou sem nenhuma chamada em produção depois do merge (Calendario.jsx passou a agrupar os avisos por dia diretamente) — ou ganha um utilizador real, ou é para remover.
- Vários hooks novos reimplementam `paraData(valor)` (Timestamp → Date) em vez de importar de `datas.js` — nove cópias ao todo, incluindo de antes desta sessão.

### Performance (baixo impacto real, dado o tamanho da app — não urgente)
- O Dashboard, com os 3 cartões novos opcionais ligados, abre `onSnapshot` duplicados nas mesmas coleções (cada cartão chama o seu próprio hook). Resolve-se levantando os hooks para o Dashboard e passando os dados por props.
- `useCadeirasAprovadas.js` abre 5 listeners (um por cadeira) só para um número no Perfil.
- Alguns cálculos (mapa de nós no editor de mapas mentais, `materiaAteData` no Modo Frequência automático) recalculam-se em cada render sem `useMemo`.

### Decisões que ainda dependem da Leonor (sem urgência, herdadas de sessões anteriores)
- Contas de teste no Firebase Auth — há várias, perguntar se apaga.
- Login da consola do Vini: Google ou email/palavra-passe (as duas já funcionam).
- Séries de que ela gosta, para as citações com falas.
- Se quer bem-estar, sequência a dois e missões do dia ligados por defeito, ou continua a escolher ela mesma em Definições (ficaram todos desligados por defeito, de propósito).

## Como retomar

```bash
git checkout fase-2 && git pull
npm install
npm run dev
```

Precisa do `.env` (ver `.env.example`, criado nesta sessão). `npm test` deve dar 428 a passar.

## Ficheiros novos desta sessão (visão geral, não exaustiva)

`src/hooks/useAuthPronto.js` · `src/services/modoExame.js` + `topicosCorrecao.js` + `horasPorRegistar.js` + `missoesDoDia.js` + `balancoSemana.js` + `toga.js` + `backlinks.js` + `mapaMental.js` + `planoEstudo.js` (todos com teste) · `src/pages/ModoExame`, `TopicosCorrecao(+Lista)`, `MapaMental(+Lista)`, `PlanoEstudo` · `src/components/CartaoHorasPorRegistar`, `CartaoMissoesDoDia`, `CartaoBalancoDomingo`, `PerfilToga` · `.env.example` · `README.md` (substitui o genérico do Vite).

## Skills sugeridas para a próxima sessão

- Uma sessão dedicada só à limpeza de duplicação (lista acima) — não urgente, mas cresce se se continuar a copiar o padrão `useCasos`/`useCaso` para cada ferramenta nova.
- `/security-review` — ainda nunca corrido, apesar de a consola do Vini e a autenticação terem crescido bastante.
- Testar tudo no telemóvel real da Leonor — esta sessão só confirmou num Chromium a 390×844.
