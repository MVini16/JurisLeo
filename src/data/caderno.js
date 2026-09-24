// opções fixas do caderno digital: letra, tamanho, papel e cores
// cores sempre por variáveis do index.css — ficam guardadas assim no documento e mudam sozinhas com o tema
// a letra manuscrita (Caveat, google fonts) só existe dentro do caderno; a app continua em georgia

export const LETRAS = [
  { id: 'georgia', nome: 'Georgia', css: "Georgia, 'Times New Roman', serif" },
  { id: 'manuscrita', nome: 'Manuscrita', css: "'Caveat', 'Segoe Print', cursive" },
  { id: 'moderna', nome: 'Moderna', css: "'Lato', system-ui, sans-serif" },
];

export const PAPEIS = [
  { id: 'liso', nome: 'Liso' },
  { id: 'linhas', nome: 'Linhas' },
  { id: 'quadriculado', nome: 'Quadriculado' },
];

// a manuscrita lê-se melhor maior; 16 é o mínimo para o iphone não fazer zoom
export const TAMANHO_MIN = 16;
export const TAMANHO_MAX = 28;
export const ESTILO_PADRAO = { letra: 'georgia', tamanho: 17, papel: 'linhas' };
export const TAMANHO_PADRAO_MANUSCRITA = 23;

export const CORES_TEXTO = [
  { id: 'normal', nome: 'Normal', valor: null },
  { id: 'bordo', nome: 'Bordô', valor: 'var(--burgundy)' },
  { id: 'azul', nome: 'Azul', valor: 'var(--info)' },
  { id: 'verde', nome: 'Verde', valor: 'var(--sucesso)' },
  { id: 'dourado', nome: 'Dourado', valor: 'var(--gold-escuro)' },
];

export const CORES_DESTAQUE = [
  { id: 'amarelo', nome: 'Amarelo', valor: 'var(--destaque-amarelo)' },
  { id: 'verde', nome: 'Verde', valor: 'var(--destaque-verde)' },
  { id: 'azul', nome: 'Azul', valor: 'var(--destaque-azul)' },
  { id: 'rosa', nome: 'Rosa', valor: 'var(--destaque-rosa)' },
];
