# Ideias e funcionalidades — lista viva

Não é a spec (`SPEC.md`, o que a app deve ser) nem o handoff (o que aconteceu numa sessão). É o sítio para guardar ideias, melhorias e coisas notadas de passagem, para não se perderem entre sessões. Cada sessão pode acrescentar, marcar como feita, ou tirar da lista se já não fizer sentido — não precisa de aprovação prévia do Vini para *acrescentar* uma ideia aqui, só para a construir.

---

## Por construir — grandes

- **Consola do Vini** (secção 26 da spec): não existe nada disto no código, nem uma rota. É uma funcionalidade grande — PIN, regras de admin novas no Firestore, sessão de ajuda em tempo real, painel de estatísticas. Vale a pena decidir com o Vini se ainda quer isto e, se sim, planear como uma sessão própria — não é algo para começar a fazer sem falar primeiro (mexe em regras de segurança e cria um segundo "utilizador" com acesso de leitura a tudo).
- **Registo diário de bem-estar** (secção 25 da spec): também nada feito, sem fase atribuída. Precisa de decisão sobre onde vive (secção 25.1) e quando aparece (25.2) antes de começar.
- **Assistente de IA**: secção 23 da spec diz explicitamente para não implementar (sem API grátis viável), só deixar o sítio preparado (`src/services/assistente.js` com a assinatura da função). Confirmar que continua a fazer sentido não mexer nisto.
- **Animações temáticas de direito, marcos, carta escondida** (fase 14): polimento final, só faz sentido perto do fim.

## Por construir — médias

- **Mostrar os choques de coincidências na própria vista do Calendário**, não só como aviso ao criar/editar um evento no modal. Hoje `coincidencias.js` já tem `choquesPorDia()` pronto para isto, só falta ligar à UI do calendário (ex: um selo na célula do dia).
- **Code-splitting por rota** (`React.lazy`): o bundle já vai em ~880KB (256KB gzip), o Vite avisa sempre no build. Não é urgente, mas só cresce a cada fase nova.
- **Notificações push e ecrã de instalação para iOS** (fase 12): PWA já instala e funciona offline, falta a parte de notificar.
- **Modo "estou a passar-me"** e aviso aos 90 minutos de estudo (fase 11).

## Bugs conhecidos, por confirmar

- **"A carregar" infinito em páginas com Firestore em tempo real**, visto no ambiente cloud desta sessão (Calendário, Modo Frequência, e nas primeiras explorações também Notas/Faltas/Cadeiras). Fortemente suspeito de ser o proxy de rede da sessão cloud, não um bug — mas nunca foi confirmado num browser normal, fora deste tipo de ambiente. **Prioridade alta**: confirmar isto assim que possível, porque se for mesmo um bug de produção é grave.
- **Site em produção com ecrã em branco** desde um deploy recente (22-09), provavelmente sem `.env`. Ver `docs/handoff-22-09-2026.md`, secção 5, para os passos de reposição.

## Decisões pendentes (regras de negócio — nunca inventar, só o Vini/a Leonor decidem)

- Intervalos dos flashcards: spec pede 1/3/7/16/35 dias, código tem 1/2/4/7/15.
- Aulas práticas previstas: dados reais têm 30, testes antigos da spec usam 26.
- Fontes: spec pede Playfair Display + Lato, `CLAUDE.md` fixa Georgia — o código já segue o `CLAUDE.md`, falta só corrigir a spec para não dizer o contrário.
- ✅ *Resolvido em 22-09-2026:* caso 25 da avaliação fica "aprovada com 10" (não "excluída").

## Pequenas melhorias notadas de passagem

- O Dashboard mostra "Boa noite Leonor" mesmo numa conta de teste sem nome nenhum preenchido no onboarding — parece um valor por omissão fixo no código (razoável numa app de uma só utilizadora, mas confirmar que é intencional).
- `Cadeira.jsx`, `Anotacao.jsx`, `Caso.jsx` tinham botões de voltar escritos à mão em vez do `BotaoVoltar.jsx` partilhado — **corrigido em 22-09-2026** para `Anotacao`/`Caso` (`Cadeira` já estava certo). De caminho, corrigido também um bug de alinhamento no próprio componente partilhado, que afetava as 13 páginas que já o usavam.
- Ao editar um evento de vários dias (`dataFim`) a partir de uma cópia que não seja o primeiro dia, o modal preenche "Data" com o dia daquela cópia específica, não com a data de início original, e não traz o "Termina em". Funciona (o `id` mantém-se correto, não duplica nada), mas a experiência de edição não é perfeita para esse caso. Baixa prioridade.

## Ideias soltas (ainda sem avaliação de esforço)

- Um pequeno indicador no Dashboard ou no Calendário de "faltam X dias para a janela de frequências" (30 de novembro), aproveitando `calendarioS1.janelaFrequencias` que já existe em `dadosLeonor.js`.
- O Modo Frequência podia, no futuro, sugerir automaticamente marcar uma aula sem sumário como "por rever primeiro" — hoje a checklist só mostra o que já tem sumário escrito, não avisa sobre lacunas.
