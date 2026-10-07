// o que a exportação precisa do telemóvel/browser: menu de partilha, copiar e descarregar.
// as funções recebem o "ambiente" (navigator, document, URL) para se poderem testar sem browser

const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export { MIME_DOCX };

function foiCancelado(erro) {
  return erro?.name === 'AbortError';
}

// manda o texto para o menu de partilha do telemóvel (OneNote, Drive, WhatsApp, email...).
// sem menu de partilha (computador), copia o texto
// devolve 'partilhado' | 'copiado' | 'cancelado' | 'falhou'
export async function partilharTexto({ titulo, texto }, ambiente = { navigator: globalThis.navigator }) {
  const nav = ambiente.navigator;
  if (nav?.share) {
    try {
      await nav.share({ title: titulo, text: texto });
      return 'partilhado';
    } catch (erro) {
      if (foiCancelado(erro)) return 'cancelado';
      // qualquer outro erro do menu: tenta copiar em vez de desistir
    }
  }
  try {
    await nav.clipboard.writeText(texto);
    return 'copiado';
  } catch {
    return 'falhou';
  }
}

function descarregar(blob, nome, ambiente) {
  const url = ambiente.URL.createObjectURL(blob);
  const ligacao = ambiente.document.createElement('a');
  ligacao.href = url;
  ligacao.download = nome;
  ambiente.document.body.appendChild(ligacao);
  ligacao.click();
  ambiente.document.body.removeChild(ligacao);
  // dá tempo ao browser de começar o descarregamento antes de largar o ficheiro
  setTimeout(() => ambiente.URL.revokeObjectURL(url), 10000);
}

// entrega um ficheiro: no telemóvel abre o menu de partilha com o ficheiro (guardar em Ficheiros,
// Drive, OneNote...); no computador, ou se o menu recusar, descarrega-o
// devolve 'partilhado' | 'descarregado' | 'cancelado'
export async function entregarFicheiro({ blob, nome, mime }, ambiente = { navigator: globalThis.navigator, document: globalThis.document, URL: globalThis.URL }) {
  const nav = ambiente.navigator;
  try {
    const ficheiro = new File([blob], nome, { type: mime });
    if (nav?.canShare?.({ files: [ficheiro] })) {
      await nav.share({ files: [ficheiro], title: nome });
      return 'partilhado';
    }
  } catch (erro) {
    if (foiCancelado(erro)) return 'cancelado';
    // o menu recusou o ficheiro (por exemplo, perdeu o toque do utilizador): descarrega
  }
  descarregar(blob, nome, ambiente);
  return 'descarregado';
}

// lê do index.css as cores que o word precisa, num elemento de tema claro (papel branco)
// devolve { 'cor-vinho': '6B0F1A', 'marca-amarelo': 'F3D77A', selo: 'E0554F', ... } sem o #
export function lerCoresDoTema(doc = globalThis.document) {
  const nomes = ['cor-vinho', 'cor-azul', 'cor-verde', 'cor-ouro', 'cor-roxo', 'cor-laranja', 'marca-amarelo', 'marca-rosa', 'marca-verde', 'marca-azul'];
  const sonda = doc.createElement('div');
  sonda.className = 'tema-papel';
  sonda.style.display = 'none';
  doc.body.appendChild(sonda);
  const estilo = doc.defaultView.getComputedStyle(sonda);
  const ler = (variavel) => estilo.getPropertyValue(variavel).trim().replace(/^#/, '').toUpperCase();
  const cores = Object.fromEntries(nomes.map((n) => [n, ler(`--nota-${n}`)]));
  cores.selo = ler('--selo');
  cores['fundo-bloco'] = ler('--nota-fundo-bloco');
  doc.body.removeChild(sonda);
  return cores;
}
