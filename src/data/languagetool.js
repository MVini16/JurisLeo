// dados fixos da api pública do languagetool (correção de texto) — https://languagetool.org
// regras deles: link visível para languagetool.org e nunca pedidos automáticos (só quando ela carrega no botão)
// limites da api gratuita: 20 pedidos por minuto, 20 000 caracteres por pedido, 75 000 por minuto

export const URL_LANGUAGETOOL = 'https://api.languagetool.org/v2/check';
export const LINK_LANGUAGETOOL = 'https://languagetool.org';
export const LINGUA = 'pt-PT';

export const PEDIDOS_POR_MINUTO = 20;
// abaixo dos 20 000 por pedido, com folga
export const CARACTERES_POR_BLOCO = 15000;
// acima disto já passava os 75 000 por minuto de uma vez só
export const CARACTERES_POR_REVISAO = 60000;
// o languagetool pode sugerir dezenas de trocas; no telemóvel chegam as primeiras
export const MAX_SUGESTOES = 3;

// guardado em localStorage depois de ela aceitar, para o aviso só aparecer uma vez
export const CHAVE_AVISO_PRIVACIDADE = 'jurisleo-aviso-languagetool';

export const AVISO_PRIVACIDADE = {
  titulo: 'Antes de rever o teu texto',
  texto:
    'Para encontrar erros, o texto é enviado para o LanguageTool, um serviço de correção que não faz parte da app. Não pede conta nem nome, mas o texto sai do teu telemóvel. Evita usar isto em textos muito pessoais.',
  aceitar: 'Percebi, rever',
  recusar: 'Agora não',
};

// tipo de cada erro, a partir do rule.issueType do languagetool — etiquetas para o painel
export const ROTULOS_TIPO = {
  ortografia: 'Ortografia',
  gramatica: 'Gramática',
  pontuacao: 'Pontuação e espaços',
  estilo: 'Estilo',
  outro: 'Outro',
};

// guardadas em configuracoes/dados.palavrasConhecidas: valem em qualquer aparelho em que ela entre
export const CAMPO_PALAVRAS_CONHECIDAS = 'palavrasConhecidas';
