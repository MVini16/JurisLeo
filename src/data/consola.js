// configuração da consola do Vini
// o email é o da conta do Vini no Firebase Auth; a segurança real está em firestore.rules,
// isto só decide o que se mostra no ecrã
export const EMAIL_ADMIN = 'm4rcusv1nni@gmail.com';

// o uid da conta da Leonor não é segredo, mas é específico desta instalação: vem do .env (ver .env.example)
export const UID_DA_LEONOR = import.meta.env.VITE_UID_LEONOR || '';

// o que a consola mostra, em texto simples: a mesma lista aparece no Perfil dela (spec 26.1)
// só aparece no Perfil dela quando ela liga o registo diário
export const O_QUE_O_VINI_VE_BEM_ESTAR = [
  'Como tens estado: humor, energia e motivação, o que escreveres em "conta ao Vini o que te chateou hoje" e os campos opcionais que ligares. É a primeira coisa que aparece na consola.',
  'Os dias que apagares aparecem como "apagado", sem conteúdo em lado nenhum. Vês o mesmo gráfico que ele vê, no teu Perfil.',
];

// só aparece no Perfil dela quando ela liga a "sequência a dois"
export const O_QUE_O_VINI_VE_SEQUENCIA_A_DOIS = [
  'Se já estudaste hoje ou não — só isso, sem minutos nem detalhe do que fizeste (isso já aparece sempre na secção Estudo).',
];

export const O_QUE_O_VINI_VE = [
  'O estado de cada cadeira (avaliação e faltas), com a mesma explicação que tu vês.',
  'A tua média e a próxima frequência.',
  'As tarefas por fazer e as que estão atrasadas.',
  'Quanto estudaste (minutos por semana e dias seguidos).',
  'Quantas anotações, palavras, casos e cartões tens. Só os números, nunca o texto.',
  'Quando os dados foram lidos pela última vez.',
];
