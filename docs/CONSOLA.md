# Consola do Vini — passo 1 (só leitura)

**Como se entra:** escreve `/admin` a seguir ao endereço da app (por exemplo `jurisleo-67124.web.app/admin`). Também funciona `/consola`. Não há link em lado nenhum. A página tem a sua própria entrada, sem passar pelo login da app.

Só a conta do Vini entra (`m4rcusv1nni@gmail.com`); qualquer outra conta volta em silêncio para o início.

## O que mostra
"Como ela está" (ainda um aviso: o registo de bem-estar não existe), "O que precisa de ti" (faltas no limite, exclusões, tarefas atrasadas, prova nos próximos 7 dias), e, fechados, cadeiras, média, próxima prova, estudo, produção (só números, nunca o texto das anotações) e sistema. A mesma lista está no Perfil dela, em "O que o Vini vê".

Lê os dados ao abrir e quando se toca em Atualizar (não em tempo real, para poupar leituras do Firestore).

## Como entrar (duas maneiras)

**A. Com Google (a mais simples).** Ativa-se uma vez, no Firebase Console: Authentication, Sign-in method, Google, Ativar, Guardar (30 segundos). Depois é só tocar em "Entrar com Google" com a conta `m4rcusv1nni@gmail.com`. O Google já vem com o email verificado.

**B. Com email e palavra-passe.** A conta `m4rcusv1nni@gmail.com` já existe no projeto. Foi enviado um email do Firebase para definires a palavra-passe: abre-o e segue o link. Se o email não chegar, escreve-o outra vez na página de login da app em "Esqueci-me da palavra-passe", ou pede-me para reenviar.

Nas duas, na primeira vez a consola pede para **definires um PIN de 6 dígitos**, que fica só neste aparelho.

## O que já ficou feito por ti (21-09-2026)
- O uid da Leonor está no `.env` (`VITE_UID_LEONOR`), que não vai para o git.
- Regras de admin em `firestore.rules`.

## Segurança, sem ilusões
- O que protege os dados dela são as **regras do Firestore**: só ela escreve, e só a conta com o teu email verificado lê. O PIN só protege o caso de o telemóvel ou o PC ficarem abertos na tua conta.
- Três PIN errados bloqueiam uma hora. Ao fim de 15 minutos sem mexer a consola bloqueia sozinha.
- A regra nova só **acrescenta** leitura ao admin. Ela continua com o mesmo acesso que tinha.
- Quem tentar `/admin` com outra conta cria só uma conta vazia no projeto, sem acesso a dados de ninguém.

## Se algo falhar
- **"Sem permissão para ler os dados dela":** as regras ainda não foram publicadas, ou o email da conta não está verificado.
- **"O login com Google ainda não está ativo":** falta o passo A acima. Usa o email enquanto isso.
- **Não pede PIN / dados vazios:** confirma que o build foi feito com o `.env` que tem `VITE_UID_LEONOR`.

## O que ainda não existe
Presença em tempo real, alertas guardados, mensagens para ela, sessão de ajuda, o resumo agregado (`resumo/estado`) e o registo de bem-estar. Ver secções 25 e 26 da spec.
