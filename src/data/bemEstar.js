// registo diário de bem-estar (spec 25). o enquadramento é: ela conta ao Vini como está.
// na comida, tudo qualitativo: nunca calorias, peso, quantidades nem metas.

// os três campos obrigatórios, sempre presentes, com cinco níveis cada (1 a 5)
export const CAMPOS_PRINCIPAIS = [
  {
    id: 'humor',
    pergunta: 'Como estás?',
    niveis: [
      { valor: 1, icone: '😞', texto: 'Mal' },
      { valor: 2, icone: '😕', texto: 'Em baixo' },
      { valor: 3, icone: '😐', texto: 'Assim-assim' },
      { valor: 4, icone: '🙂', texto: 'Bem' },
      { valor: 5, icone: '😄', texto: 'Ótimo' },
    ],
  },
  {
    id: 'energia',
    pergunta: 'E a energia?',
    niveis: [
      { valor: 1, icone: '😴', texto: 'Nenhuma' },
      { valor: 2, icone: '🥱', texto: 'Cansada' },
      { valor: 3, icone: '😐', texto: 'Normal' },
      { valor: 4, icone: '😊', texto: 'Com energia' },
      { valor: 5, icone: '⚡', texto: 'Cheia' },
    ],
  },
  {
    id: 'motivacao',
    pergunta: 'E a motivação?',
    niveis: [
      { valor: 1, icone: '🧊', texto: 'Nenhuma' },
      { valor: 2, icone: '😶', texto: 'Pouca' },
      { valor: 3, icone: '😐', texto: 'Assim-assim' },
      { valor: 4, icone: '💪', texto: 'Boa' },
      { valor: 5, icone: '🔥', texto: 'Muita' },
    ],
  },
];

export const IDS_PRINCIPAIS = CAMPOS_PRINCIPAIS.map((c) => c.id);

// horas de sono, na versão da manhã
export const OPCOES_SONO = [4, 5, 6, 7, 8, 9];

export const ROTULO_TEXTO_LIVRE = 'conta ao Vini o que te chateou hoje';
export const MAX_TEXTO = 1000;

export const ESCALA5 = ['Nada', 'Pouco', 'Assim-assim', 'Bastante', 'Muito'];

// campos opcionais da versão da noite: ela liga os que quiser em Definições
// tipos: escala5 (cinco níveis) · tres (três respostas) · simnao
export const GRUPOS_OPCIONAIS = ['Corpo', 'Cabeça', 'Faculdade', 'Vida'];

export const CAMPOS_OPCIONAIS = [
  { id: 'sonoQualidade', grupo: 'Corpo', pergunta: 'Como dormiste?', tipo: 'escala5' },
  { id: 'comeu', grupo: 'Corpo', pergunta: 'Comeste hoje?', tipo: 'tres', opcoes: ['Sim', 'Mal', 'Não'] },
  { id: 'agua', grupo: 'Corpo', pergunta: 'Bebeste água?', tipo: 'tres', opcoes: ['Pouca', 'Assim-assim', 'Bastante'] },
  { id: 'doresCabeca', grupo: 'Corpo', pergunta: 'Dores de cabeça?', tipo: 'simnao' },
  { id: 'doresCostas', grupo: 'Corpo', pergunta: 'Dores de costas?', tipo: 'simnao' },
  { id: 'cansacoFisico', grupo: 'Corpo', pergunta: 'Cansaço físico?', tipo: 'escala5' },

  { id: 'ansiedade', grupo: 'Cabeça', pergunta: 'Ansiedade?', tipo: 'escala5' },
  { id: 'stress', grupo: 'Cabeça', pergunta: 'Stress?', tipo: 'escala5' },
  { id: 'foco', grupo: 'Cabeça', pergunta: 'Conseguiste concentrar-te?', tipo: 'escala5' },
  { id: 'irritabilidade', grupo: 'Cabeça', pergunta: 'Irritação?', tipo: 'escala5' },
  { id: 'vontadePessoas', grupo: 'Cabeça', pergunta: 'Vontade de estar com pessoas?', tipo: 'escala5' },

  { id: 'aulasFui', grupo: 'Faculdade', pergunta: 'Foste às aulas?', tipo: 'tres', opcoes: ['Todas', 'Algumas', 'Nenhuma'] },
  { id: 'percebeu', grupo: 'Faculdade', pergunta: 'Percebeste a matéria?', tipo: 'escala5' },
  { id: 'medoFrequencia', grupo: 'Faculdade', pergunta: 'Medo da próxima frequência?', tipo: 'escala5' },
  { id: 'atrasada', grupo: 'Faculdade', pergunta: 'Sensação de estar atrasada?', tipo: 'escala5' },
  { id: 'confiancaDificil', grupo: 'Faculdade', pergunta: 'Confiança na cadeira mais difícil?', tipo: 'escala5' },

  { id: 'tempoAmigos', grupo: 'Vida', pergunta: 'Tempo com amigos?', tipo: 'tres', opcoes: ['Pouco', 'Algum', 'Bastante'] },
  { id: 'tempoLivre', grupo: 'Vida', pergunta: 'Tempo livre para ti?', tipo: 'tres', opcoes: ['Pouco', 'Algum', 'Bastante'] },
  { id: 'casa', grupo: 'Vida', pergunta: 'Casa e quarto arrumados?', tipo: 'escala5' },
  { id: 'dinheiro', grupo: 'Vida', pergunta: 'Preocupação com dinheiro?', tipo: 'escala5' },
  { id: 'trajeto', grupo: 'Vida', pergunta: 'Tempo de trajeto?', tipo: 'tres', opcoes: ['Curto', 'Normal', 'Longo'] },
];

export function campoOpcional(id) {
  return CAMPOS_OPCIONAIS.find((c) => c.id === id) || null;
}
