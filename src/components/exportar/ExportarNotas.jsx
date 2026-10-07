// folha de exportação: escolhe o que sair (esta página, a secção ou o caderno), mostra uma
// pré-visualização e exporta num toque — partilhar (menu do telemóvel), pdf ou word
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/useTheme.js';
import { useBarney } from '../../hooks/useBarney.jsx';
import ImpressaoNotas from './ImpressaoNotas.jsx';
import { nomeFicheiro, paginasParaMarkdown, resumoExportacao } from '../../services/exportarNotas.js';
import { docParaTexto } from '../../services/notaRica.js';
import { previewTexto } from '../../services/cadernos.js';
import { partilharTexto, entregarFicheiro, lerCoresDoTema, MIME_DOCX } from '../../services/partilha.js';
import { renderizarDesenhoPng, lerCoresDoPapel } from '../editor/desenharTracos.js';
import './ExportarNotas.css';

const ICONES = {
  partilhar: <path d="M12 16V4M7 9l5-5 5 5M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />,
  pdf: <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4" />,
  word: <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M8.5 12l1.5 5 2-5 2 5 1.5-5" />,
};

const FORMATOS = [
  { id: 'partilhar', nome: 'Partilhar', ajuda: 'OneNote, Drive, WhatsApp…' },
  { id: 'pdf', nome: 'PDF', ajuda: 'Para imprimir ou enviar' },
  { id: 'word', nome: 'Word', ajuda: 'Abre no Word e no OneNote' },
];

function Icone({ nome }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONES[nome]}
    </svg>
  );
}

const MENSAGENS = {
  partilhado: 'Enviado para o menu de partilha.',
  partilhadoTexto: 'Enviado para o menu de partilha. Os desenhos não vão no texto: usa o PDF ou o Word para os levar.',
  copiado: 'Este aparelho não tem menu de partilha, por isso o texto ficou copiado. Cola onde quiseres.',
  impressao: 'Na janela que abriu, escolhe "Guardar como PDF". No iPhone: Partilhar e depois Guardar em Ficheiros.',
};

// `opcoes`: [{ id, rotulo, titulo, nomeBase, paginas }] — uma por âmbito de exportação
export default function ExportarNotas({ opcoes, aoFechar }) {
  const { darkMode } = useTheme();
  const { elemento: barney, disparar: dispararBarney } = useBarney();
  const [escopoId, setEscopoId] = useState(opcoes[0].id);
  const [estado, setEstado] = useState(null);
  const [aImprimir, setAImprimir] = useState(false);

  const opcao = opcoes.find((o) => o.id === escopoId) ?? opcoes[0];
  const { total, palavras, desenhos } = resumoExportacao(opcao.paginas);
  const primeira = opcao.paginas[0];
  const ocupado = estado?.fase === 'a-preparar';

  // a biblioteca do word é grande: começa a carregá-la já, para estar pronta quando ela tocar
  useEffect(() => { import('../../services/docxNotas.js'); }, []);

  useEffect(() => {
    const aoPremir = (e) => { if (e.key === 'Escape') aoFechar(); };
    window.addEventListener('keydown', aoPremir);
    return () => window.removeEventListener('keydown', aoPremir);
  }, [aoFechar]);

  // imprime quando as páginas já estão no ecrã (escondidas) e esconde a app só durante a impressão
  useEffect(() => {
    if (!aImprimir) return undefined;
    document.body.classList.add('imprimindo-notas');
    const terminar = () => setAImprimir(false);
    window.addEventListener('afterprint', terminar);
    const espera = setTimeout(() => window.print(), 200);
    return () => {
      clearTimeout(espera);
      window.removeEventListener('afterprint', terminar);
      document.body.classList.remove('imprimindo-notas');
    };
  }, [aImprimir]);

  function concluir(formato, resultado, ficheiro) {
    if (resultado === 'cancelado') { setEstado(null); return; }
    if (resultado === 'falhou') {
      setEstado({ fase: 'erro', mensagem: 'Não consegui partilhar nem copiar o texto. Experimenta o Word ou o PDF.' });
      return;
    }
    const chave = formato === 'partilhar' && resultado === 'partilhado' && desenhos > 0 ? 'partilhadoTexto' : resultado;
    const mensagem = resultado === 'descarregado' ? `O ficheiro ${ficheiro} foi descarregado.` : MENSAGENS[chave];
    setEstado({ fase: 'pronto', formato, ficheiro, mensagem });
    dispararBarney('exportacao');
  }

  async function exportar(formato) {
    if (ocupado || total === 0) return;
    setEstado({ fase: 'a-preparar', formato });
    try {
      if (formato === 'partilhar') {
        const texto = paginasParaMarkdown(opcao.paginas, opcao.titulo);
        concluir(formato, await partilharTexto({ titulo: opcao.titulo, texto }), null);
      } else if (formato === 'word') {
        const { gerarDocxBlob } = await import('../../services/docxNotas.js');
        // o desenho entra no word como imagem, desenhada com as cores do papel (tema claro)
        const coresDoPapel = desenhos > 0 ? lerCoresDoPapel() : null;
        const imagens = await Promise.all(opcao.paginas.map((p) => (p.tracos?.length > 0 ? renderizarDesenhoPng(p.tracos, coresDoPapel) : null)));
        const blob = await gerarDocxBlob(opcao.paginas, opcao.titulo, lerCoresDoTema(), imagens);
        const nome = nomeFicheiro(opcao.nomeBase, 'docx');
        concluir(formato, await entregarFicheiro({ blob, nome, mime: MIME_DOCX }), nome);
      } else {
        setAImprimir(true);
        concluir(formato, 'impressao', nomeFicheiro(opcao.nomeBase, 'pdf'));
      }
    } catch {
      setEstado({ fase: 'erro', mensagem: 'Não consegui exportar. Tenta outra vez.' });
    }
  }

  return (
    <>
      <div className={`exportar-fundo no-print ${darkMode ? 'dark' : ''}`} onClick={aoFechar}>
        <div className="exportar-folha" role="dialog" aria-modal="true" aria-label="Exportar" onClick={(e) => e.stopPropagation()}>
          <div className="exportar-grip" />
          <div className="exportar-topo">
            <strong>Exportar</strong>
            <button className="exportar-fechar" aria-label="Fechar" onClick={aoFechar}>×</button>
          </div>

          {opcoes.length > 1 && (
            <div className="exportar-escopos" role="group" aria-label="O que exportar">
              {opcoes.map((o) => (
                <button
                  key={o.id}
                  className="exportar-chip"
                  aria-pressed={o.id === opcao.id}
                  onClick={() => { setEscopoId(o.id); setEstado(null); }}
                >
                  {o.rotulo}
                </button>
              ))}
            </div>
          )}

          <div className="exportar-mini" key={opcao.id}>
            {total === 0 ? (
              <p className="exportar-mini__vazio">Não há páginas para exportar aqui.</p>
            ) : (
              <>
                <span className="exportar-mini__meta">{total} {total === 1 ? 'página' : 'páginas'} · {palavras} {palavras === 1 ? 'palavra' : 'palavras'}{desenhos > 0 ? ` · ${desenhos} com desenho` : ''}</span>
                <strong className="exportar-mini__titulo">{total === 1 ? primeira.titulo : opcao.titulo}</strong>
                <p className="exportar-mini__texto">{previewTexto({ conteudo: docParaTexto(primeira.doc) }, 150) || 'Página ainda vazia.'}</p>
              </>
            )}
          </div>

          <div className="exportar-acoes">
            {FORMATOS.map((f) => (
              <button key={f.id} className="exportar-acao" disabled={ocupado || total === 0} onClick={() => exportar(f.id)}>
                <Icone nome={f.id} />
                <b>{f.nome}</b>
                <small>{f.ajuda}</small>
              </button>
            ))}
          </div>

          <div className="exportar-resultado" aria-live="polite">
            {ocupado && <div className="exportar-prog"><i /></div>}
            {estado?.fase === 'erro' && <p className="exportar-erro" role="alert">{estado.mensagem}</p>}
            {estado?.fase === 'pronto' && (
              <div className="exportar-cert">
                <span className="exportar-cert__etq">Certidão passada</span>
                {estado.ficheiro && <strong>{estado.ficheiro}</strong>}
                <span className="exportar-cert__texto">{estado.mensagem}</span>
                <span className="exportar-selo">Exportado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* fora do fundo, senão tocar no barney (ou na impressão) fechava a folha */}
      {aImprimir && createPortal(<ImpressaoNotas paginas={opcao.paginas} tituloColecao={opcao.titulo} />, document.body)}
      {barney}
    </>
  );
}
