# Consola do Vini — passo 1 (só leitura)

Rota `/consola`, sem link em lado nenhum. Só a conta do Vini entra; qualquer outra volta em silêncio para o início.

## O que mostra
"Como ela está" (ainda um aviso: o registo de bem-estar não existe), "O que precisa de ti" (faltas no limite, exclusões, tarefas atrasadas, prova nos próximos 7 dias), e, fechados, cadeiras, média, próxima prova, estudo, produção (só números, nunca o texto das anotações) e sistema. A mesma lista está no Perfil dela, em "O que o Vini vê".

Lê os dados ao abrir e quando se toca em Atualizar (não em tempo real, para poupar leituras do Firestore).

## Como pôr a funcionar (uma vez)

1. **Criar a conta do Vini.** Abre a app publicada, escolhe "criar conta" e regista `m4rcusv1nni@gmail.com` com uma palavra-passe tua. (Isto cria uma conta de utilizador; a consola trata-a como administrador só por causa do email.)
2. **Verificar o email.** No Firebase Console: Authentication, Utilizadores, a tua conta. Se o email não estiver verificado, verifica-o (envia o email de verificação a partir da consola do Firebase ou usa "Reset password"). As regras exigem `email_verified`.
3. **Descobrir o uid da Leonor.** Firebase Console, Authentication, Utilizadores, coluna "UID do utilizador" da conta dela.
4. **Acrescentar ao `.env`:** `VITE_UID_LEONOR=<o uid dela>` (há um `.env.example` com todos os nomes).
5. **Publicar** (as regras mudaram):
   ```powershell
   npm test
   npm run build
   firebase deploy --only firestore,hosting
   ```
6. **Entrar:** faz login com a tua conta na página de login: vais direto para `/consola`. Na primeira vez define um PIN de 6 dígitos (fica só neste aparelho).

## Segurança, sem ilusões
- O que protege os dados dela são as **regras do Firestore** (`firestore.rules`): só ela escreve, e só a conta com o teu email verificado lê. O PIN só protege o caso de o telemóvel ou o PC ficarem abertos na tua conta.
- Três PIN errados bloqueiam uma hora. Ao fim de 15 minutos sem mexer a consola bloqueia sozinha.
- A regra nova só **acrescenta** leitura ao admin. Ela continua com o mesmo acesso que tinha.

## O que ainda não existe
Presença em tempo real, alertas guardados, mensagens para ela, sessão de ajuda, o resumo agregado (`resumo/estado`) e o registo de bem-estar. Ver secções 25 e 26 da spec.
