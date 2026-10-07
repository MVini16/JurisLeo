// lógica pura das notas ricas — sem react, sem tiptap e sem firebase, para testar com vitest sem mocks.
// a nota guarda dois campos: `rico` (o documento do editor, em json como texto) e `conteudo`
// (o mesmo texto, simples) — o `conteudo` serve a pesquisa, o resumo da lista e as notas antigas

export const DOC_VAZIO = { type: 'doc', content: [{ type: 'paragraph' }] };

// o firestore recusa documentos com mais de 1 mb (1 048 576 bytes)
export const LIMITE_FIRESTORE_BYTES = 1048576;
// a partir de 80% do limite avisamos, para ela ter tempo de dividir a nota
export const FRACAO_AVISO = 0.8;
// margem para os outros campos do documento (título, tags, datas...)
const MARGEM_OUTROS_CAMPOS_BYTES = 4096;

export const FOLHAS = ['pautado', 'quadriculado', 'pontos', 'branco'];
export const FOLHA_INICIAL = 'pautado';

// texto simples -> documento do editor (uma linha = um parágrafo)
export function textoParaDoc(texto) {
  const linhas = String(texto ?? '').split('\n');
  return {
    type: 'doc',
    content: linhas.map((linha) => (linha
      ? { type: 'paragraph', content: [{ type: 'text', text: linha }] }
      : { type: 'paragraph' })),
  };
}

// nós que fecham uma linha no texto simples
const NOS_DE_LINHA = new Set(['paragraph', 'heading', 'codeBlock', 'horizontalRule']);

function textoDoNo(no) {
  if (!no) return '';
  if (no.type === 'text') return no.text || '';
  if (no.type === 'hardBreak') return '\n';
  const filhos = (no.content || []).map(textoDoNo).join('');
  return NOS_DE_LINHA.has(no.type) ? `${filhos}\n` : filhos;
}

// documento do editor -> texto simples (para pesquisa e resumo)
export function docParaTexto(doc) {
  return textoDoNo(doc).replace(/\n{3,}/g, '\n\n').trim();
}

function eDocValido(doc) {
  return !!doc && typeof doc === 'object' && doc.type === 'doc' && Array.isArray(doc.content);
}

// escolhe o documento a abrir: o rico, se existir e estiver são; senão o texto antigo
export function abrirNota(anotacao) {
  if (anotacao?.rico) {
    try {
      const doc = JSON.parse(anotacao.rico);
      if (eDocValido(doc)) return doc;
    } catch { /* json estragado: cai para o texto simples */ }
  }
  return anotacao?.conteudo ? textoParaDoc(anotacao.conteudo) : DOC_VAZIO;
}

// o que se guarda no firestore a partir do documento do editor
export function serializarNota(doc) {
  return { rico: JSON.stringify(doc), conteudo: docParaTexto(doc) };
}

export function tamanhoEmBytes(texto) {
  return new TextEncoder().encode(String(texto ?? '')).length;
}

// 'ok' | 'perto' | 'excedido' — para o aviso no editor e para travar o guardar
// `bytesDoDesenho` é o que o desenho à mão ocupa na mesma nota
export function estadoTamanho(doc, bytesDoDesenho = 0) {
  const { rico, conteudo } = serializarNota(doc);
  const total = tamanhoEmBytes(rico) + tamanhoEmBytes(conteudo) + bytesDoDesenho + MARGEM_OUTROS_CAMPOS_BYTES;
  if (total >= LIMITE_FIRESTORE_BYTES) return { estado: 'excedido', bytes: total };
  if (total >= LIMITE_FIRESTORE_BYTES * FRACAO_AVISO) return { estado: 'perto', bytes: total };
  return { estado: 'ok', bytes: total };
}

export function contarPalavras(texto) {
  const limpo = String(texto ?? '').trim();
  return limpo ? limpo.split(/\s+/).length : 0;
}

export function folhaValida(folha) {
  return FOLHAS.includes(folha) ? folha : FOLHA_INICIAL;
}
