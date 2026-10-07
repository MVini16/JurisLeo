// as páginas escolhidas, prontas a imprimir ou a guardar em pdf, sempre em tema claro.
// desenha o documento do editor com elementos react (sem innerHTML), e só aceita
// as cores e os tamanhos da própria app (ver corSegura e tamanhoSeguro)
import { corSegura, tamanhoSeguro } from '../../services/exportarNotas.js';
import '../editor/EditorRico.css';
import './ImpressaoNotas.css';

function Texto({ no }) {
  let conteudo = no.text || '';
  for (const marca of no.marks || []) {
    if (marca.type === 'bold') conteudo = <strong>{conteudo}</strong>;
    else if (marca.type === 'italic') conteudo = <em>{conteudo}</em>;
    else if (marca.type === 'underline') conteudo = <u>{conteudo}</u>;
    else if (marca.type === 'strike') conteudo = <s>{conteudo}</s>;
    else if (marca.type === 'artigo') conteudo = <span className="nota-artigo">{conteudo}</span>;
    else if (marca.type === 'highlight') conteudo = <mark style={{ background: corSegura(marca.attrs?.color) ?? undefined }}>{conteudo}</mark>;
    else if (marca.type === 'textStyle') {
      const px = tamanhoSeguro(marca.attrs?.fontSize);
      conteudo = <span style={{ color: corSegura(marca.attrs?.color) ?? undefined, fontSize: px ? `${px}px` : undefined }}>{conteudo}</span>;
    }
  }
  return conteudo;
}

function Filhos({ no, deslocamento }) {
  return (no.content || []).map((f, i) => <No key={i} no={f} deslocamento={deslocamento} />);
}

function No({ no, deslocamento }) {
  const alinhamento = no.attrs?.textAlign;
  switch (no.type) {
    case 'text': return <Texto no={no} />;
    case 'hardBreak': return <br />;
    case 'paragraph': return <p style={{ textAlign: alinhamento }}><Filhos no={no} deslocamento={deslocamento} /></p>;
    case 'heading': {
      const Titulo = `h${Math.min(6, (no.attrs?.level ?? 1) + deslocamento)}`;
      return <Titulo style={{ textAlign: alinhamento }}><Filhos no={no} deslocamento={deslocamento} /></Titulo>;
    }
    case 'bulletList': return <ul><Filhos no={no} deslocamento={deslocamento} /></ul>;
    case 'orderedList': return <ol start={no.attrs?.start ?? 1}><Filhos no={no} deslocamento={deslocamento} /></ol>;
    case 'taskList': return <ul className="impressao-tarefas"><Filhos no={no} deslocamento={deslocamento} /></ul>;
    case 'listItem': return <li><Filhos no={no} deslocamento={deslocamento} /></li>;
    case 'taskItem': return <li><span className="impressao-caixa" aria-hidden="true">{no.attrs?.checked ? '☑' : '☐'}</span><div><Filhos no={no} deslocamento={deslocamento} /></div></li>;
    case 'blockquote': return <blockquote><Filhos no={no} deslocamento={deslocamento} /></blockquote>;
    case 'blocoEstudo': return <div data-bloco={no.attrs?.tipo}><Filhos no={no} deslocamento={deslocamento} /></div>;
    case 'codeBlock': return <pre><code>{(no.content || []).map((t) => t.text || '').join('')}</code></pre>;
    case 'horizontalRule': return <hr />;
    case 'table': return <table><tbody><Filhos no={no} deslocamento={deslocamento} /></tbody></table>;
    case 'tableRow': return <tr><Filhos no={no} deslocamento={deslocamento} /></tr>;
    case 'tableHeader': return <th><Filhos no={no} deslocamento={deslocamento} /></th>;
    case 'tableCell': return <td><Filhos no={no} deslocamento={deslocamento} /></td>;
    default: return <Filhos no={no} deslocamento={deslocamento} />;
  }
}

export default function ImpressaoNotas({ paginas, tituloColecao }) {
  const varias = paginas.length > 1;
  return (
    <div className="impressao-notas tema-papel">
      {varias && tituloColecao && <h1 className="impressao-colecao">{tituloColecao}</h1>}
      {paginas.map((p, i) => (
        <article key={i} className="impressao-pagina">
          <h1 className="impressao-titulo">{p.titulo}</h1>
          <p className="impressao-meta">{[p.caderno, p.seccao].filter(Boolean).join(' · ')}</p>
          <div className="er-texto">
            <Filhos no={p.doc} deslocamento={1} />
          </div>
          {p.tags?.length > 0 && <p className="impressao-tags">{p.tags.map((t) => `#${t.replace(/\s+/g, '-')}`).join('  ')}</p>}
        </article>
      ))}
    </div>
  );
}
