---
data: 21-09-2026
projeto: JurisLeo
tipo: proposta (nada disto está implementado, exceto onde indicado)
---

# 30 ideias para a Leonor, tiradas de apps de estudo e adaptadas à vida de uma advogada

Pesquisa feita a 21-09-2026 em apps de estudo, de flashcards, de foco, de notas e de gestão de escritórios de advogados. Cada ideia diz de onde vem, como se adapta ao direito em Portugal e à advocacia, quanto custa fazer e que dados novos pede.

**Regras que se mantêm em todas:**
- Cada ideia nasce como **módulo ligável** (`src/data/modulos.js`): ela liga e desliga em Definições.
- **Nada de texto da lei**, só referências e notas dela (spec 14.7).
- **Prazos e regras jurídicas concretas** (processuais, da Ordem dos Advogados, do estágio) só entram depois de o Vini confirmar a fonte. Onde a ideia depende disso, está marcado **[fonte a confirmar]**.
- **Sigilo:** nas ideias da vida profissional (26 a 30) a app avisa que não se guardam dados que identifiquem clientes.
- Esforço: **P** = uma sessão · **M** = algumas sessões · **G** = uma fase inteira.

## A. Memorizar melhor

| # | Ideia | De onde vem | Adaptação à Leonor e à advocacia | Esforço |
|---|---|---|---|---|
| 1 | **Lacunas nas notas dela (cloze)** | [Anki](https://en.wikipedia.org/wiki/Anki) usa cartões de lacunas, que a investigação diz serem eficazes | Ela seleciona uma frase da sua anotação e esconde as palavras-chave ("o contrato só é ___ quando..."). Trabalha o texto dela, não o da lei | M |
| 2 | **Confiança de 1 a 5 em vez de certo/errado** | [Brainscape](https://www.brainscape.com/academy/apps-law-students/) agenda pela confiança de quem responde | Em direito muitas respostas são "mais ou menos". Cinco níveis dão intervalos mais justos do que acertar ou falhar | P |
| 3 | **Agendamento que aprende** | [FSRS no Anki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/abc-of-fsrs): menos revisões para a mesma memória | Versão simples: cada cartão tem dificuldade própria. Fica de fora a decisão dos intervalos (spec 1-3-7-16-35 contra código 1-2-4-7-15) até o Vini escolher | M |
| 4 | **Jogo de ligar pares** | [Quizlet Match](https://vertu.com/guides/duolingo-vs-quizlet-the-ultimate-guide-to-modern-learning) | Artigo com epígrafe, brocardo com significado, conceito com definição, contra o relógio. Cinco minutos entre aulas | M |
| 5 | **Cartões em áudio** | [MintDeck](https://www.mintdeck.app/blog/law-student-flashcard-app-2026) estuda por áudio | A app lê o cartão em voz alta (voz do próprio telemóvel), para o metro ou o autocarro | P |
| 6 | **Baralho "matéria até à frequência"** | Ideia nossa, sobre o regulamento (secção 5.3) | A prova de avaliação contínua só cobre a matéria até 6 dias antes. O baralho junta só os cartões e sumários dessa janela | M |

## B. Raciocínio jurídico

| # | Ideia | De onde vem | Adaptação | Esforço |
|---|---|---|---|---|
| 7 | **Modo exame de 90 minutos** | [Quimbee](https://www.brainscape.com/academy/apps-law-students/) e bancos de questões de exame | Um caso do arquivo, cronómetro de 90 min (duração da prova escrita, secção 5.3), sem consultar nada. No fim ela cola o que escreveu e autoavalia-se | M |
| 8 | **Comparar com os tópicos de correção** | Ideia nossa, sobre o regulamento | O regulamento prevê análise questão a questão face aos tópicos publicados. Ela regista os tópicos, marca "tinha / faltou" e a app diz o que reclamar e o que rever **[prazo do recurso: 2 dias úteis, secção 5.3]** | M |
| 9 | **Fichas de jurisprudência** | Fichas de caso do Quimbee: factos, questão, regra, análise, conclusão | Tribunal, processo, sumário, questão, decisão, fundamento, e "o que esta decisão me ensina". Serve para os comentários de jurisprudência que o regulamento lista | M |
| 10 | **Ligações entre tudo (backlinks)** | [Obsidian](https://leaderandlearner.substack.com/p/the-complete-beginners-guide-to-using) mostra que notas ligam a outras | Cada artigo, caso e anotação diz onde mais aparece. "Onde já usei o artigo X?" é a pergunta de uma advogada | M |
| 11 | **Diário dos meus erros** | Ideia nossa, inspirada nos baralhos de erros do Anki | Cada erro numa frequência ou num caso cria um cartão e fica numa lista "não voltar a errar". Depois de um mês vê quais se repetem | M |
| 12 | **Esquemas e mapas mentais** | [Notion e Obsidian](https://www.notion.com/templates/the-student-second-brain-dashboard) | Caixas e setas por cadeira, em SVG simples. Por exemplo o esquema da responsabilidade civil | G |

## C. Tempo, prazos e foco

| # | Ideia | De onde vem | Adaptação | Esforço |
|---|---|---|---|---|
| 13 | **Calculadora de prazos** | O [calendário do Clio](https://www.clio.com/ca/features/legal-calendaring-software/) calcula prazos por regras | Versão segura: dias seguidos ou úteis, sem fins de semana nem feriados (`feriados.js` já existe). Serve já para as 24 h do comprovativo e os 2 dias úteis do recurso. Prazos processuais só depois de confirmados **[fonte a confirmar]** | P |
| 14 | **Prazos em cadeia** | [Tarefas relativas do Clio](https://www.clio.com/features/task-management/) | Ao marcar uma frequência, criam-se sozinhos: começar a estudar (−14 dias), fechar o resumo (−7), revisão final (−2). É o hábito de quem gere prazos de clientes | M |
| 15 | **Plano de estudo da semana** | [Notion para estudantes](https://www.notion.com/templates/the-student-second-brain-dashboard) | A partir das datas de frequência, do mapa da matéria e das notas dela, propõe onde gastar as horas. Ela aceita, muda ou ignora | G |
| 16 | **Folha de horas de estudo** | [Time tracking do Clio](https://www.clio.com/features/legal-time-expense-tracking/) | O cronómetro que já existe passa a registar sessões por cadeira e por tarefa, como um "timesheet". Na advocacia, registar horas é rotina | P |
| 17 | **Mapa de calor do semestre** | [Heatmap do Anki](https://en.wikipedia.org/wiki/Anki_(software)) | Um calendário colorido com os dias que estudou. Entra no Perfil | P |
| 18 | **Horas por registar** | O Clio avisa do [tempo por faturar](https://www.clio.com/features/case-management/) | Ao fim do dia: "estiveste 3 h no telemóvel na biblioteca, queres registar como estudo?" Nunca obriga | P |
| 19 | **Foco atado a uma tarefa** | [Flora](https://nerdynav.com/forest-vs-flora-pomodoro/) liga a sessão a uma tarefa | Uma sessão pertence a uma tarefa ou cadeira. Se abandonar, não há castigo, só "ficou a meio: continuar depois?" | P |
| 20 | **Modo Frequência** | Ideia da spec (14.8) | A partir de 30/11, ecrã cheio com a cadeira mais próxima, dias que faltam e checklist da matéria | M |

## D. Motivação sem pressão

| # | Ideia | De onde vem | Adaptação | Esforço |
|---|---|---|---|---|
| 21 | **Sequência com dias de descanso** | [Duolingo](https://trophy.so/blog/gamified-study-revision-apps): streak com proteção contra falhas | Conta dias em que estudou algo, e deixa marcar 1 dia de descanso por semana sem quebrar a série. O contrário de pressão | P |
| 22 | **Três missões do dia** | Missões diárias do Duolingo | "10 cartões", "1 sumário", "25 minutos". Pequenas, escolhidas por ela nas Definições | M |
| 23 | **Sequência a dois com o Vini** | O [Friend Streak](https://play.google.com/store/apps/editorial?id=mc_apps_editorial_user_edu_duolingo_tips_and_tricks_fcp&hl=en) do Duolingo | Opcional e só se ela ligar: o Vini vê que ela estudou hoje. Sem ligas nem rankings. Tem de constar da lista do que ele vê (spec 26.1) | P |
| 24 | **Toga que se completa** | [Emblemas e níveis](https://viasocket.com/discovery/blog/grdoz1/productivity-apps/8-best-study-tracker-apps-for-consistency) das apps de estudo | Marcos do semestre desbloqueiam peças (capelo, medalha, fita). Fica no Perfil | M |
| 25 | **Balanço de domingo** | A revisão semanal do [Obsidian](https://notesmakr.com/blog/how-to-use-obsidian-for-studying) | Um cartão ao domingo: horas, cartões, sumários, o que ficou por fazer, e uma pergunta para a semana | M |

## E. Preparar a vida de advogada

| # | Ideia | De onde vem | Adaptação | Esforço |
|---|---|---|---|---|
| 26 | **Portfólio e CV jurídico** | Portfólios do Notion | Trabalhos, comentários e casos de que se orgulha, com data e cadeira. Exporta em PDF para candidaturas a estágio | M |
| 27 | **Diário de estágio** | [Gestão de processos do Clio](https://www.clio.com/features/case-management/) | Para quando estagiar: o que viu, o que aprendeu, dúvidas para o patrono. Aviso fixo de **sigilo profissional**: sem nomes nem dados de clientes | M |
| 28 | **Agenda de diligências** | Calendário do Clio | Uma família nova no calendário, "Profissional": audiências e diligências, com hora, local, deslocação e "o que levar". Ainda serve para visitas a tribunais e sessões de estágio | P |
| 29 | **Checklists de peças e de revisão** | Modelos do Clio e do Notion | Só estrutura, nunca texto jurídico: "o que tem uma petição", e "antes de entregar: prazos, factos, pedidos, assinatura". Vinda de fontes que o Vini confirme **[fonte a confirmar]** | M |
| 30 | **Contactos jurídicos** | CRM leve dos escritórios | Professores, colegas, secretarias, tribunais, contactos de estágio, com "voltar a falar com X". Networking também se estuda | P |

## Primeira vaga, por ordem

Escolhi as que dão mais efeito com menos código, e que já têm dados na app:

1. **17 Mapa de calor + 16 folha de horas + 21 sequência** → Perfil novo (já há `sessoesEstudo`). **Em curso.**
2. **13 Calculadora de prazos** → função pura com testes, aproveita `feriados.js`.
3. **14 Prazos em cadeia** e **20 Modo Frequência** → aproveitam o detetor de choques e o calendário oficial.
4. **2 Confiança de 1 a 5** + **5 Cartões em áudio** → mexem só nos flashcards.
5. **7 Modo exame** e **8 Comparar com os tópicos**.
6. **28 Diligências** (é só uma família nova no calendário).

## O que esta pesquisa não cobriu

- Não abri as páginas das apps ao vivo, só os resultados de pesquisa. As fontes servem de inspiração, não de cópia.
- Nada aqui usa IA. A spec (secção 23) manda não integrar assistente de IA por agora.
- Falta o Vini decidir se a Leonor quer **ligas ou competição** (a proposta é que não) e se a **sequência a dois** (23) é uma boa ideia para os dois.
