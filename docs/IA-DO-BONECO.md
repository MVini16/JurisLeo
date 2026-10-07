# IA do boneco do Vini: desenho

Estado: **só desenho, nada implementado**. O boneco de hoje fala com frases escritas pelo Vini (`src/data/boneco.js`). Este documento descreve como ligar uma IA a sério mais tarde, sem mexer no Firebase e sem pôr nenhuma chave no código da app.

## Regras que não se discutem

1. **Nenhuma chave de API no cliente.** O Vite embebe tudo o que começa por `VITE_` no bundle público. A chave vive só no servidor.
2. **Nada de Firebase novo.** Sem funções, sem coleções, sem regras alteradas. A IA corre num serviço à parte.
3. **O caminho "Estou mesmo mal" nunca passa pela IA.** Continua a ser texto fixo com as linhas de apoio verificadas e o contacto do Vini. Se a IA estiver ligada e ela escrever algo que indique sofrimento sério, o cliente mostra esse mesmo ecrã em vez da resposta do modelo.
4. **O boneco diz sempre o que é.** "Boneco do Vini, não é o Vini a sério." A IA não finge ser uma pessoa.
5. **Privado por omissão.** A conversa não é guardada em nenhum lado (nem no servidor, nem no Firestore). Só vai para o servidor o que ela escreve nessa conversa, nunca as notas, o horário ou as faltas.

## Arquitetura

```
telemóvel (JurisLeo)  --HTTPS-->  proxy fino (Cloudflare Worker ou Cloud Run)  -->  API do modelo
   sem chave                       guarda a chave, limita pedidos,                  
                                   aplica o prompt do sistema
```

- **Proxy fino**: um endpoint `POST /conversa` com `{ mensagens: [{de, texto}] }`, devolve `{ texto }`. Máximo de 10 mensagens de contexto e 500 carateres por mensagem.
- **Quem pode chamar**: o servidor só aceita pedidos com um segredo partilhado por-instalação (guardado em `localStorage`, gerado pelo Vini e posto no telemóvel dela) e do domínio da app (CORS). Uma app para uma só utilizadora não precisa de mais. Alternativa mais forte: verificar o ID token do Firebase Auth no servidor (só leitura, não altera nada no projeto Firebase).
- **Limites**: 30 pedidos por hora e 150 por dia, para a fatura nunca surpreender. Resposta com limite de tokens.
- **Falha graciosa**: se o servidor não responder em 8 segundos, o boneco cai para as frases escritas. A app nunca fica parada à espera da IA.

## Prompt do sistema (rascunho)

Em português de Portugal, tom carinhoso e um pouco brincalhão, frases curtas. É o boneco do Vini, escrito para a Leonor, estudante de Direito na FDUL. Pode:

- perguntar como ela está e ouvir;
- sugerir uma pausa, uma tarefa pequena, ou ir aos flashcards;
- contar piadas com tema jurídico e elogiar com base no que o Vini escreveu (as listas do ficheiro de frases entram como exemplos de voz).

Não pode: dar respostas jurídicas como se fossem certas (remete para o manual e o docente), dar conselhos médicos ou psicológicos, nem prolongar conversa de sofrimento. Se houver sinais de sofrimento sério, responde só com uma frase de acolhimento e indica o botão "Falar com o Vini a sério".

## O que muda na app quando chegar a altura

- `src/services/ia.js` (novo): `perguntarAoBoneco(mensagens)` com timeout de 8 s e fallback.
- Um modo "Escrever" na conversa do boneco, atrás de uma definição desligada por omissão (Definições > Brincadeiras > "Deixar o boneco conversar a sério").
- A URL do servidor em `VITE_IA_URL` (não é segredo). O segredo partilhado fica fora do código.
- Testes: a lógica de limites e de deteção de sofrimento é pura e testa-se com vitest.

## Decisões que ficam para o Vini

1. Onde alojar o proxy (Cloudflare Worker é o mais simples e barato).
2. Que modelo e que orçamento mensal.
3. Se aceita a mensagem de privacidade ("o que escreves aqui vai para um serviço de IA") antes de ligar pela primeira vez.
