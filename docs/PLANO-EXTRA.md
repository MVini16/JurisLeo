---
data: 21-09-2026
projeto: JurisLeo
tipo: proposta (nada disto está implementado)
---

# Plano extra — mais funcionalidades, ecrã à medida e animações

Pedido do Vini em 21-09-2026: juntar o máximo de ferramentas úteis para a Leonor estudar e se preparar para a advocacia, deixando-a escolher o que quer ver no ecrã principal, e trazer animações do CodePen.

Nada aqui foi construído. É para escolheres o que entra e em que ordem. Tudo o que for visual segue o CLAUDE.md: primeiro preview em HTML, depois código.

---

## 1. Ecrã à medida: módulos que ela liga e desliga

Regra: **tudo o que é novo nasce como módulo**, com um interruptor. Ela liga e desliga em Perfil → "O teu ecrã".

**Como funciona (sem migração, sem mexer nas regras):**

- `src/data/modulos.js` — registo fixo: `id`, nome, descrição curta, categoria, se vem ligado por defeito, e onde aparece (cartão no Dashboard, entrada no menu, ou os dois).
- `configuracoes/dados.modulos` — objeto `{ [id]: true|false }`. Um módulo que não esteja lá usa o valor por defeito, por isso **contas já criadas funcionam sem migração** (a lição do `initFirestore` do CLAUDE.md).
- `configuracoes/dados.dashboardOrdem` — lista de ids dos cartões, na ordem que ela escolher (arrastar ou setas, que no telemóvel são mais fiáveis).
- `src/hooks/useModulos.js` — lê e escreve, com o mesmo padrão anti-ciclo do `ThemeContext`.
- Dashboard e NavBar passam a desenhar-se a partir do registo, em vez de cartões fixos.
- Alguns cartões ficam **sempre ligados** (Agora, Faltas em risco, Próxima frequência). Um erro aqui é a Leonor não ver uma falta a chegar ao limite.
- "Repor tudo como estava" num botão.

Decisão visual (a ver em preview): lista de interruptores por categoria, ou um "ecrã principal" onde ela vê os cartões em miniatura e toca para tirar ou pôr.

---

## 2. Catálogo de funcionalidades novas

Marcado: **[spec]** já está na spec e ainda falta · **[novo]** proposta nova · **[BD]** precisa de dados novos no Firestore.

### Estudar melhor

| Módulo | O que faz |
|---|---|
| Modo Frequência **[spec 14.8]** | A partir de 30/11, ecrã cheio: cadeira mais próxima, dias que faltam, checklist da matéria. |
| Mapa da matéria **[novo][BD]** | Por cadeira, lista de temas (do programa), cada um "não vi / vi / percebo / dominado". Dá a percentagem de matéria dominada. |
| Plano de estudo da semana **[novo]** | A partir das datas de frequência e do mapa da matéria, sugere o que estudar cada dia. Ela aceita, muda ou ignora. |
| Leituras com ritmo **[novo]** | Dado o manual, as páginas e a data da frequência, diz "12 páginas por dia chegam". Usa os dados de `useLeituras`. |
| Modo exame **[novo]** | Cronómetro de 90 minutos (a duração da prova escrita da avaliação contínua, secção 5.3), com um caso prático do arquivo, sem consultar mais nada. No fim, ela cola o que escreveu e autoavalia-se. |
| Quiz de artigos **[novo]** | Repetição espaçada sobre a biblioteca de artigos dela (número, epígrafe, "de que trata?"). Usa o mesmo motor dos flashcards. |
| Fichas de jurisprudência **[novo][BD]** | Tribunal, processo, sumário, questão, decisão e fundamento. Serve para os comentários de jurisprudência, que o regulamento lista como elemento de avaliação. |
| Esquemas e mapas mentais **[novo]** | Caixas ligadas por setas, por cadeira. Simples, em SVG, sem biblioteca. |
| Bibliografia **[novo][BD]** | Livros, artigos e acórdãos por cadeira, com a referência já formatada para copiar. |
| Latim do dia **[novo]** | Um brocardo por dia, com significado, a partir do glossário. Cartão pequeno no Dashboard. |
| Cronómetro com pausas **[spec 14.9]** | Aviso aos 90 minutos e modo "estou a passar-me". |
| Sebenta compilada **[spec 14.5]** | Junta as anotações de uma cadeira num documento. |
| Estatísticas de estudo **[novo]** | Horas por cadeira e por semana, dias seguidos a estudar, mapa de calor do semestre. Já há `sessoesEstudo`. |

### Organizar a vida académica

| Módulo | O que faz |
|---|---|
| Choques e coincidências **[spec 14.8]** | A lógica está feita e testada; falta ligar ao calendário. |
| Calculadora de dias úteis **[novo]** | "Quantos dias úteis tenho para o recurso?" Conta sem fins de semana nem feriados (`feriados.js` já existe). Útil para as 24 horas do comprovativo e os 2 dias úteis do recurso. |
| Tarefas com subtarefas **[spec 14.9]** | Um trabalho grande partido em passos. |
| Modo "o que faço agora?" **[novo]** | Um botão que escolhe uma só coisa, tendo em conta prazos, faltas e energia. Ideal para dias em que não sabe por onde começar. |
| Perguntas para o stor **[novo]** | Lista simples, por cadeira, de coisas para perguntar. Complementa a lista de dúvidas dos casos. |
| Atalhos do ecrã principal **[novo]** | Botões que ela escolhe: "nova anotação", "registar falta", "iniciar estudo". |
| Exportar e backup **[spec 19]** | Importador de JSON e exportação em markdown. |

### Preparar-se para ser advogada

Estes precisam de fontes verificadas antes de qualquer texto. **Não invento regras nem prazos** (CLAUDE.md).

| Módulo | O que faz |
|---|---|
| Roteiro do percurso **[novo]** | Checklist do caminho até advogada (licenciatura, mestrado, estágio, exame da Ordem). Só depois de o Vini confirmar as etapas e os prazos reais. |
| Portfólio **[novo][BD]** | Trabalhos, comentários e casos de que ela se orgulha, com data e cadeira. Serve para candidaturas a estágios. |
| Diário de estágio **[novo][BD]** | Para quando começar a estagiar: o que viu, o que aprendeu, dúvidas. |
| Modelos de peças **[novo]** | Só estrutura e checklist (por exemplo, o que tem uma petição). Sem inventar texto jurídico. |

### Cuidar de si

| Módulo | O que faz |
|---|---|
| Registo de bem-estar **[spec 25]** | Humor, energia, motivação, com o cuidado descrito na spec. |
| Respiração guiada **[spec 14.9]** | No modo "estou a passar-me". |
| Marcos do semestre **[spec 14.9]** | Recompensa visual quando cumpre etapas. |
| Frase de força **[spec 16]** | Já existe parte. |

---

## 3. Animações do CodePen

**Estado da pesquisa:** consegui os resultados de pesquisa e os títulos, **não abri as pens ao vivo**, por isso ainda não vi cada uma a mexer. Antes de escolher, abre os links.

**Como se aplica:** não copio código. As pens do CodePen são normalmente MIT, mas cada autor pode indicar outra licença e não consegui confirmar uma a uma. **Recrio cada efeito de raiz** em CSS ou SVG, com as variáveis do `index.css` (sem cores hardcoded), só com `transform` e `opacity`, saltável e com `prefers-reduced-motion`. Fica a referência como inspiração.

| # | Efeito | Onde entra | Inspiração |
|---|---|---|---|
| 1 | Partículas douradas a brilhar | Abertura da app e celebração | [Shimmering Gold Particles](https://codepen.io/githiro/pen/RNGYRw) |
| 2 | Brilho dourado a passar no texto | Título "JurisLeo" na abertura | [Golden Animation Effect on Text](https://codepen.io/ponycorn/pen/LYRJOxW) |
| 3 | Visto com confetti | Nota aprovada, tarefa concluída | [Affirm Success Animation](https://codepen.io/haniotis/pen/mEbQQK) |
| 4 | Livro que se abre | Abrir uma cadeira | [Book opening animation](https://codepen.io/valerite-dev/pen/XjOeeK) |
| 5 | Virar página | Mudar de anotação | [Page flip, pure CSS](https://codepen.io/saquiboye/pen/RGzrpv) |
| 6 | Cartão que vira em 3D | Flashcards | [Card flip](https://codepen.io/desandro/pen/LmWoWe) |
| 7 | Martelo de juiz | Concluir tarefa | [Animated SVG Hammer](https://codepen.io/ParsonsProjects/pen/VLKPJK) e [Hammer animation](https://codepen.io/marilex/pen/gqvONw) (usa GSAP, que não vamos instalar; refaço em CSS) |
| 8 | Círculo que respira | Modo "estou a passar-me" | [Apple Watch Breathe](https://codepen.io/geoffgraham/pen/zKMEPE) |
| 9 | Esqueleto a brilhar | Carregamento de listas | [Pure CSS Skeleton Shimmer](https://codepen.io/maoberlehner/pen/bQGZYB) |
| 10 | Anel de contagem decrescente | Modo Frequência e Dashboard | [Countdown timer with SVG circle](https://codepen.io/zebateira/pen/VvqJwm) |

**Abertura da app (o pedido do Vini):** as animações 1 e 2 são a base. Ideia: a balança do splash atual a equilibrar-se, o título a acender com brilho dourado, partículas a subir, e depois a app a entrar em cascata. Falta perceber se é o splash atual melhorado ou uma animação nova ao abrir com sessão iniciada. Vou fazer 3 previews antes de qualquer código.

---

## 4. Ordem proposta

1. **Acabar a tarefa 14** (família no modal). À espera da escolha A ou B dos chips.
2. **Tarefa 15**, ligar ao calendário: multi-dia, choques visíveis, feriados, faixas das épocas. A lógica pura já está feita.
3. **Sistema de módulos** (secção 1). Vem cedo porque tudo o que vem depois nasce dentro dele.
4. **Consola, passo 1** (só leitura, PIN, regras de admin), seguido do resumo agregado.
5. **Registo de bem-estar**, que alimenta o bloco D da consola.
6. **Animações**: primeiro a abertura da app, depois as 9 restantes por ordem de uso.
7. **Módulos de estudo** pela ordem que ela mais usar: Modo Frequência, mapa da matéria, plano de estudo, quiz de artigos, modo exame.
8. **Preparação para advogada**, depois de confirmadas as fontes.

Pontos de paragem para o Vini escolher visualmente: chips da família, layout do ecrã à medida, abertura da app, layout da consola.
