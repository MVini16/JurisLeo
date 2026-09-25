---
data: 25-09-2026
projeto: JurisLeo
tipo: proposta (nada disto está implementado)
---

# 40 funcionalidades novas + 10 de usabilidade

Pesquisa feita a 25-09-2026 em apps de estudo, notas, foco e bem-estar (Anki, RemNote, Quizlet, Brainscape, Knowt, Readwise, Things, Structured, Tiimo, Forest, Finch, Daylio, Day One, Ulysses, Quimbee, CaseBriefs, Lexis+) e nas Apple Human Interface Guidelines. Não repete nada de `IDEIAS-30.md`, `IDEIAS-30-MAIS.md`, `IDEIAS.md`, `PLANO-EXTRA.md` nem de `data/modulos.js`.

Regras que se mantêm: sem IA paga, sem texto da lei (só referências e notas dela), sem rankings nem pressão, tudo exequível numa PWA no iPhone. Esforço: **P** uma sessão · **M** algumas · **G** uma fase.

## A. Memorização

| # | Ideia | O que faz | Inspiração | Esf. |
|---|---|---|---|---|
| 1 | Responder por escrito | Escreve antes de virar; a app mostra as duas lado a lado e marca diferenças (ignora acentos) | [Anki type-in](https://docs.ankiweb.net/templates/fields.html), [Quizlet Write](https://help.quizlet.com/hc/en-us/articles/360030990531-Studying-with-Write-mode) | P |
| 2 | Cartões nos dois sentidos | Interruptor cria o inverso (definição → conceito), cada um com agendamento próprio. Brocardos e glossário | [RemNote Concept/Descriptor](https://help.remnote.com/en/articles/6751778-creating-concept-descriptor-flashcards) | P |
| 3 | Teste misto | 10–15 perguntas geradas dos cartões: escolha múltipla (distratores da mesma cadeira), V/F, escrita. Pode misturar cadeiras | [Quizlet Test](https://quizlet.com/ca/features/studymodes), [Knowt](https://knowt.com/learn-mode) | M |
| 4 | Cartões teimosos | Depois de ~5 falhas sugere reescrever, partir em lacunas ou pausar | [Anki leeches](https://docs.ankiweb.net/leeches.html) | P |
| 5 | Baralhos à medida | "Falhei esta semana", "só esta divisória", "só lacunas", "adiantar revisões" | [Anki filtered decks](https://docs.ankiweb.net/filtered-decks.html) | M |
| 6 | Dias leves | Ela escolhe dias com menos revisões; dias de frequência ficam leves sozinhos | [Anki Easy Days](https://github.com/ankitects/anki/pull/3230) | M |
| 7 | Passagem final garantida | Nos 3 dias antes da frequência, cada cartão da cadeira aparece pelo menos uma vez | [RemNote Exam Scheduler](https://help.remnote.com/en/articles/9102040-understanding-the-exam-scheduler) | P |
| 8 | Destaques que voltam | 3–5 frases destacadas no caderno voltam todos os dias: "ainda útil", "já sei", "fazer cartão" | [Readwise Daily Review](https://docs.readwise.io/readwise/docs/faqs/reviewing-highlights) | M |
| 9 | Folha vermelha | No caderno, esconde o que está destacado; toca para revelar | oclusão do Anki | P |
| 10 | Esconder caixas do mapa | Tapa uma ou todas as caixas do mapa mental e ela tenta lembrar | Anki Image Occlusion | M |
| 11 | Do Significado ao glossário | Na janela "Significado": "guardar no meu glossário" e "fazer cartão" | [Readwise Mastery](https://docs.readwise.io/readwise/guides/mastery) | P |

## B. Escrita e raciocínio jurídico

| # | Ideia | O que faz | Inspiração | Esf. |
|---|---|---|---|---|
| 12 | Folha em branco | Escreve tudo o que se lembra de uma aula; depois compara com o sumário e marca o que faltou | método "blurting" ([Adobe](https://www.adobe.com/acrobat/resources/blurting-method-of-studying.html)) | M |
| 13 | Explica a quem não é de Direito | Explica um tema; a app assinala termos do glossário sem explicação e frases longas. Opcional: enviar ao Vini | técnica de Feynman | M |
| 14 | Caça às questões | 10 min para listar as questões de um caso do arquivo, sem resolver; compara com a resolução dela | [Quimbee issue spotters](https://www.quimbee.com/essay-practice-exams-overview) | M |
| 15 | Esquema de ataque | Frases marcadas ★ juntas numa página por cadeira, para a última revisão; imprime | [BARBRI attack outline](https://www.barbri.com/resources/how-to-create-a-law-school-attack-outline) | M |
| 16 | Doutrina em confronto | Ficha: questão, posição A/B com autor, posição do regente, jurisprudência, "a minha posição" | fichas do Quimbee | P |
| 17 | Fonte oficial numa ligação | Campo de link para DGSI, juris.stj.pt, DR consolidado; não copia texto | [Lexis+](https://www.lexisnexis.com/community/insights/legal/b/product-features/posts/feature-spotlight-brief-analysis) | P |
| 18 | Meta de escrita com prazo | Limite de palavras + data de entrega → quanto escrever por dia | [Ulysses Goals](https://help.ulysses.app/goals) | P |

## C. Organização e tempo

| # | Ideia | O que faz | Inspiração | Esf. |
|---|---|---|---|---|
| 19 | Caixa de entrada | Campo único no +: escreve e esquece; mais tarde vira tarefa, pergunta, cartão ou anotação | [Structured inbox](https://help.structured.app/en/articles/998530), Things | P |
| 20 | Datas como se fala | "sexta 14h", "amanhã", "daqui a 2 semanas" → data. Função pura pt-PT | [Things](https://culturedcode.com/things/support/articles/9780167/) | M |
| 21 | "Esta noite" e "Um dia" | Duas gavetas nas tarefas | [Things](https://culturedcode.com/things/support/articles/4001304/) | P |
| 22 | Linha do dia e janelas livres | Aulas + tarefas numa linha; nos furos mostra "janela de 50 min" e o que cabe | [Tiimo](https://www.tiimoapp.com/product/visual-planning), Structured | M |
| 23 | Quanto domino cada cadeira | % por cadeira a partir da confiança média dos cartões (um guia, não nota) | [Brainscape Mastery](https://brainscape.zendesk.com/hc/en-us/articles/360030693491-How-do-I-track-my-studies) | P |
| 24 | Número no ícone | O ícone mostra quantos cartões há para rever (só com a app instalada e notificações) | [Badging API no WebKit](https://webkit.org/blog/14112/badging-for-home-screen-web-apps/) | P |

## D. Motivação e bem-estar

| # | Ideia | O que faz | Inspiração | Esf. |
|---|---|---|---|---|
| 25 | Companheiro de estudo | Um leãozinho que lê enquanto o cronómetro corre; ganha objetos com horas de foco; nunca morre | [Focus Friend](https://www.fastcompany.com/91388304/focus-friend-app-store-hank-green-bria-sullivan), Finch | M/G |
| 26 | Som de fundo | Chuva, lareira, ruído castanho gerados com Web Audio (sem ficheiros) | Forest | M |
| 27 | O que já fiz | Registo de tudo o que concluiu, por dia e semana | [Things Logbook](https://culturedcode.com/things/support/articles/2803584/) | P |
| 28 | Neste dia | "Há um mês estavas a estudar X" | [Day One](https://dayoneapp.com/features/on-this-day/) | P |
| 29 | O que te faz bem | Cruza bem-estar com hábitos ("nos dias com pausa de almoço estudaste mais"). Só dela, nunca na consola | [Daylio](https://daylio.net/) | M |
| 30 | Começar pequenino | Botão "só 2 minutos": o passo mais pequeno de uma tarefa + cronómetro | [Tiimo](https://www.tiimoapp.com/product) | P |

## E. Vida académica na FDUL

| # | Ideia | O que faz | Inspiração | Esf. |
|---|---|---|---|---|
| 31 | Aquecimento antes da prática | 20 min antes de uma prática: 3 cartões + 1 pergunta para o stor dessa cadeira | [CaseBriefs](https://www.studicata.com/case-briefs) | P |
| 32 | Ensaio de oral | Sorteia perguntas dos cartões, grava a resposta (MediaRecorder, iOS 14.3+) e cronometra; fica só no telemóvel (Storage exige Blaze) | CaseBriefs, Notability | M |
| 33 | Modo apresentação | Página do caderno vira diapositivos (um por título), ecrã cheio, cronómetro | [Obsidian Slides](https://obsidian.md/help/Plugins/Slides) | M |
| 34 | Trabalhos de grupo | Colegas (dos Contactos), partes, prazos internos, "partilhar resumo" | Craft, [Web Share](https://web.dev/articles/web-share) | M |
| 35 | Tudo no Calendário do iPhone | Exporta frequências e prazos em .ics → alertas nativos sem push | [Notion Calendar](https://www.notion.com/releases/2025-02-18) | P |
| 36 | Partilhar anotação ou baralho | Folha de partilha do iPhone com texto limpo; aviso de sigilo no diário de estágio | [navigator.share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) | P |

## F. Só dela e ligação ao Vini

| # | Ideia | O que faz | Inspiração | Esf. |
|---|---|---|---|---|
| 37 | Toque de apoio | O Vini escolhe uma frase curta ("pausa para água?") que aparece discreta; ela responde com ❤️. Mexe nas regras do Firestore | [Finch Good Vibes](https://finch.fandom.com/wiki/Good_Vibes) | M |
| 38 | Estudar juntos à distância | "O Vini está a trabalhar contigo há 25 min". Sem vídeo, sem ranking | [Focusmate](https://www.focusmate.com/), Flora | M |
| 39 | Recompensa combinada | Os dois combinam uma recompensa para um marco, com prazo | Finch | P |
| 40 | Pergunta a dois | Uma pergunta leve por semana; cada um só vê a do outro depois de responder | [Paired](https://www.paired.com/) | M |

## 10 melhorias de usabilidade

| # | Melhoria | Porquê / referência | Esf. |
|---|---|---|---|
| U1 | Háptica nos momentos certos | Fim do foco, tarefa feita, nota lançada. No iOS só via truque do `<input switch>` (e pode deixar de funcionar), por isso sempre acompanhada de sinal visual. [HIG Haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics) | P |
| U2 | Voltar sempre possível | Na PWA instalada não há barra do browser; todos os detalhes com `BotaoVoltar` (e corrigir o ciclo de histórico) | P |
| U3 | Deslizar nas listas | Deslizar numa tarefa para concluir/adiar, com botão alternativo visível. [HIG Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures) | M |
| U4 | Janelas que sobem de baixo | Um `<Folha>` único: pega, média/grande, deslizar para fechar, pergunta se há alterações. [HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) | M |
| U5 | Pesquisa sempre à mão | Em qualquer ecrã, com recentes e filtro por tipo. [HIG Searching](https://developer.apple.com/design/human-interface-guidelines/searching) | M |
| U6 | Ecrã sempre aceso | Foco, Modo Exame, Respirar, cartões. Wake Lock em PWA desde iOS 18.4 ([WebKit](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/)) | P |
| U7 | Transições ao estilo iOS | View Transitions API (Safari 18), respeitando "Reduzir movimento" | M |
| U8 | Teclado certo | `inputmode`/`enterkeyhint` em todos os campos e scroll até ao campo quando o teclado abre | P |
| U9 | Carregamento honesto | Esqueleto logo; ao fim de uns segundos explica e dá "tentar outra vez". [HIG Loading](https://developer.apple.com/design/human-interface-guidelines/loading) | P |
| U10 | Toque longo com ações rápidas | Editar, duplicar, partilhar; as mesmas ações também visíveis. [HIG Context menus](https://developer.apple.com/design/human-interface-guidelines/context-menus) | M |

## Feito a 25-09-2026

#1 responder por escrito (palavras marcadas) · #2 dois sentidos (interruptor ao criar) · #35 Calendário do iPhone (.ics, no Calendário) · #7 passagem final (automática) · U6 ecrã sempre aceso · parte de U9 (erros de leitura já não deixam "A carregar" eterno).

## Top 10 para começar

1. **#1 Responder por escrito** — só mexe nos flashcards, ótimo para artigos e requisitos.
2. **#2 Dois sentidos** — duplica o valor do glossário e dos brocardos sem ela escrever mais.
3. **#35 Calendário do iPhone (.ics)** — alertas nativos já, contornando a falta de push.
4. **U6 Ecrã sempre aceso** — uma chamada de API resolve uma irritação diária.
5. **U9 Carregamento honesto** — tira o pior momento possível (app presa em "A carregar").
6. **#7 Passagem final garantida** — as frequências começam a 30-11.
7. **#16 Doutrina em confronto** — quase só configuração em `data/fichas.js`.
8. **#19 Caixa de entrada** — captura rápida entre aulas.
9. **#31 Aquecimento antes da prática** — junta horário, cartões e perguntas que já existem.
10. **#12 Folha em branco** — maior ganho de aprendizagem por minuto, usa os sumários.

## Limites do iPhone e do Firebase

- Push só com a PWA instalada (iOS 16.4+) e precisa de servidor (Cloud Functions → plano Blaze, a confirmar).
- Sem widgets nativos, Live Activities nem sincronização em segundo plano. Atalhos no ícone (ideia 5 de `IDEIAS-30-MAIS.md`) provavelmente não funcionam em PWA.
- Firebase Storage exige Blaze desde 30-10-2024 → áudio e imagens ficam no telemóvel (IndexedDB).
- Reddit não abriu na pesquisa; as opiniões vêm de artigos e lojas, não de threads.
