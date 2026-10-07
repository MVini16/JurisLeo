// o que a leonor pode registar sobre cada aula no calendário
// 'conta' diz como cada estado entra no motor de faltas (src/services/faltas.js):
// - lecionada: a aula foi mesmo dada (entra nas "aulas práticas já dadas")
// - falta: 'injustificada' | 'justificada' | null

export const ESTADOS_AULA = [
  { id: 'presente', rotulo: 'Fui', ajuda: 'Estive na aula.', lecionada: true, falta: null },
  { id: 'faltei', rotulo: 'Faltei', ajuda: 'Faltei e não tenho justificação.', lecionada: true, falta: 'injustificada' },
  { id: 'faltei-justificada', rotulo: 'Faltei, com justificação', ajuda: 'Faltei por um motivo que a faculdade aceita.', lecionada: true, falta: 'justificada' },
  { id: 'prof-faltou', rotulo: 'O professor faltou', ajuda: 'A aula não se deu: não conta como aula dada nem como falta.', lecionada: false, falta: null },
  { id: 'sem-aula', rotulo: 'Não houve aula', ajuda: 'Feriado, greve, aula desmarcada ou outra razão: não conta como aula dada nem como falta.', lecionada: false, falta: null },
];

export const ESTADOS_POR_ID = Object.fromEntries(ESTADOS_AULA.map((e) => [e.id, e]));

// etiqueta curta para os chips do calendário
export const ROTULO_CURTO = {
  presente: 'Fui',
  faltei: 'Faltei',
  'faltei-justificada': 'Falta justificada',
  'prof-faltou': 'Prof. faltou',
  'sem-aula': 'Sem aula',
};

// o motivo de doença da lista oficial (src/data/motivosFalta.js) — atalho "estive doente"
export const MOTIVO_DOENCA = 'Internamento hospitalar ou doença comprovada';
