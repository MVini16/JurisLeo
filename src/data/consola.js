// configuração da consola do Vini
// o email é o da conta do Vini no Firebase Auth; a segurança real está em firestore.rules,
// isto só decide o que se mostra no ecrã
export const EMAIL_ADMIN = 'm4rcusv1nni@gmail.com';

// o uid da conta da Leonor não é segredo, mas é específico desta instalação: vem do .env (ver .env.example)
export const UID_DA_LEONOR = import.meta.env.VITE_UID_LEONOR || '';

// o que a consola mostra, em texto simples: a mesma lista aparece no Perfil dela (spec 26.1)
export const O_QUE_O_VINI_VE = [
  'O estado de cada cadeira (avaliação e faltas), com a mesma explicação que tu vês.',
  'A tua média e a próxima frequência.',
  'As tarefas por fazer e as que estão atrasadas.',
  'Quanto estudaste (minutos por semana e dias seguidos).',
  'Quantas anotações, palavras, casos e cartões tens. Só os números, nunca o texto.',
  'Quando os dados foram lidos pela última vez.',
];
