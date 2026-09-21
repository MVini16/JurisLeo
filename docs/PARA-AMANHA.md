---
data: 21-09-2026 (à noite)
projeto: JurisLeo
---

# Para amanhã

Enquanto estiveste fora tomei as decisões sozinho, como pediste. Aqui está o que decidi, o que precisas de fazer tu e o que preciso que decidas.

## 1. O que precisas de fazer (2 minutos)

1. **Entrar na consola.** Abre `jurisleo-67124.web.app/admin`. Tens duas maneiras (ver `docs/CONSOLA.md`):
   - **Email e palavra-passe:** já te enviei um email do Firebase para definires a palavra-passe da conta `m4rcusv1nni@gmail.com`. Procura-o (vê também o spam), segue o link, define a palavra-passe, e depois entra em `/admin`.
   - **Google:** Firebase Console, Authentication, Sign-in method, Google, Ativar. Depois "Entrar com Google".
2. Na primeira vez a consola pede-te um **PIN de 6 dígitos**.
3. **Se disser "sem permissão":** o email da conta ainda não está verificado. Diz-me e trato disso.

## 2. O que decidi por ti

| Decisão | O que fiz | Porquê |
|---|---|---|
| Conta da Leonor | Usei a `le***@outlook.pt` (foi a que escolheste) | Precisava do uid para a consola. **Confirma amanhã** que é mesmo a dela: se a consola mostrar cadeiras e notas vazias, era outra |
| Registo de bem-estar | Está feito, mas **desligado por defeito**. Ela liga em Definições | É sensível: aparecia no ecrã de início dela sem tu veres. Ligá-lo por defeito é uma linha em `data/modulos.js` (`defeito: true`) |
| Lembretes de estudo | Ao marcar uma frequência ou exame novo, oferece criar 3 tarefas (14, 7 e 2 dias antes), **ligado por defeito**, ela desliga no modal | São só tarefas; não estraga nada |
| Consola lê só ao abrir | Não é em tempo real | Poupa leituras do Firestore |
| Frases | Citações de filósofos, filmes e séries de memória, sem verificar | Pediste |
| Três deploys | Fiz-os eu, com testes, build e a verificação da `apiKey` antes de cada um | Autorizaste |

## 3. O que preciso que decidas

- **Bem-estar por defeito:** queres que apareça já no ecrã dela, ou só se ela ligar?
- **Consola:** Google ou email e palavra-passe?
- **Séries de que a Leonor gosta:** diz-me quais e acrescento falas.
- **Contas de teste no Firebase:** há 6 contas. Quatro parecem de teste (`vi***@teste.com`, `se***@gmail.com`, `no***@gmail.com`, a `ma***` de 17-09). Queres que as apague? (Apagar uma conta não apaga os dados dela no Firestore.)
- **Perfil:** o resto do Perfil (dados académicos) continua igual. Queres redesenhá-lo? Tenho a pesquisa feita.
- **Decisões antigas por responder:**
  - Caso 25 da avaliação (AC 11, escrito 9, oral 9): "excluída" ou "aprovada com 10"?
  - Intervalos dos flashcards: spec 1-3-7-16-35 ou código 1-2-4-7-15?
  - Aulas práticas previstas: 30 ou 26?
  - Fontes: Playfair e Lato, ou Georgia (não estão carregadas)?
- **Leituras do regulamento a confirmar com a Leonor** (estão assinaladas nos comentários):
  - "Época normal" = escritos e orais da época normal.
  - Só o tipo "exame" aciona a regra das coincidências.

## 4. O que testar no telemóvel (nada disto foi visto num aparelho real)

1. Abrir a app: a abertura em livro, completa. Tocar em "Saltar".
2. Definições: ligar e desligar um cartão, mudar a ordem, ligar o "Como estás hoje".
3. Marcar uma frequência no calendário: ver os 3 lembretes e o "Modo Frequência" em Ferramentas.
4. Criar um cartão "Com lacunas" e revê-lo (a confiança de 1 a 5).
5. Concluir uma tarefa (o martelo).
6. Ferramentas, Prazos e Respirar.
7. Escurecer tudo (tema escuro) e repetir 1 e 2.

## 5. Estado do código
Tudo commitado na `fase-2`, 335 testes a passar. Ver `docs/handoff-21-09-2026.md`.
