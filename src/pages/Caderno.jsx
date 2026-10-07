// um caderno de notas — a árvore de secções e páginas, com pré-visualização da página escolhida
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import ExportarNotas from '../components/exportar/ExportarNotas.jsx';
import { paginasParaExportar } from '../services/exportarNotas.js';
import { agruparPorSeccao, normalizarNomeSeccao, previewTexto, dataCurta, CADERNO_LIVRE } from '../services/cadernos.js';
import { cadeirasS1, idsCadeiras, nomesCadernos } from '../data/dadosLeonor.js';
import './Caderno.css';

export default function Caderno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { anotacoes, loading } = useAnotacoes();
  const [selecionadaId, setSelecionadaId] = useState(null);
  // por omissão estão abertas as secções com páginas; isto guarda só o que ela inverteu
  const [invertidas, setInvertidas] = useState(() => new Set());
  const [criandoSeccao, setCriandoSeccao] = useState(false);
  const [nomeNovaSeccao, setNomeNovaSeccao] = useState('');
  const [exportacao, setExportacao] = useState(null);

  const livre = id === CADERNO_LIVRE;
  const cadeira = cadeirasS1.find((c) => c.id === id);

  if (!livre && !cadeira) {
    return (
      <div className={`caderno-pagina ${darkMode ? 'dark' : ''}`}>
        <BotaoVoltar destino="/anotacoes" texto="‹ Notas" />
        <p className="caderno-vazio">Este caderno não existe.</p>
      </div>
    );
  }

  const nome = livre ? 'Caderno Livre' : cadeira.nome;
  const cor = livre ? 'var(--gold)' : cadeira.cor;
  const grupos = agruparPorSeccao(anotacoes, id, idsCadeiras);
  const totalPaginas = grupos.reduce((soma, g) => soma + g.notas.length, 0);
  const selecionada = grupos.flatMap((g) => g.notas).find((n) => n.id === selecionadaId) ?? null;
  const seccaoDaSelecionada = selecionada ? grupos.find((g) => g.notas.some((n) => n.id === selecionada.id))?.nome : '';

  // o caderno inteiro e, à parte, cada secção que já tem páginas
  function abrirExportacao() {
    const base = { cadernoId: id, idsConhecidos: idsCadeiras, nomesCadernos };
    setExportacao([
      { id: 'caderno', rotulo: 'Caderno inteiro', titulo: nome, nomeBase: nome, paginas: paginasParaExportar(anotacoes, { ...base, escopo: 'caderno' }) },
      ...grupos.filter((g) => g.notas.length > 0).map((g) => ({
        id: `seccao-${g.nome}`,
        rotulo: g.nome,
        titulo: `${nome} · ${g.nome}`,
        nomeBase: `${nome} - ${g.nome}`,
        paginas: paginasParaExportar(anotacoes, { ...base, escopo: 'seccao', seccao: g.nome }),
      })),
    ]);
  }

  function novaPagina(seccao) {
    navigate('/anotacoes/nova', { state: { cadeiraId: id, seccao } });
  }

  function alternar(nomeSeccao) {
    setInvertidas((anterior) => {
      const novo = new Set(anterior);
      if (novo.has(nomeSeccao)) novo.delete(nomeSeccao); else novo.add(nomeSeccao);
      return novo;
    });
  }

  function criarSeccao(evento) {
    evento.preventDefault();
    const nomeSeccao = normalizarNomeSeccao(nomeNovaSeccao);
    if (nomeSeccao) novaPagina(nomeSeccao);
  }

  return (
    <div className={`caderno-pagina ${darkMode ? 'dark' : ''}`} style={{ '--cor': cor }}>
      <BotaoVoltar destino="/anotacoes" texto="‹ Notas" />

      <header className="caderno-header">
        <h1 className="caderno-titulo">{nome}</h1>
        <span className="caderno-contagem">
          {totalPaginas} {totalPaginas === 1 ? 'página' : 'páginas'} · {grupos.length} secções
        </span>
        <button className="caderno-exportar" disabled={totalPaginas === 0} onClick={abrirExportacao}>Exportar</button>
      </header>
      {exportacao && <ExportarNotas opcoes={exportacao} aoFechar={() => setExportacao(null)} />}

      {loading && <p className="caderno-vazio">A carregar...</p>}

      {!loading && totalPaginas === 0 && (
        <p className="caderno-vazio caderno-vazio--grande">
          Ainda não há páginas neste caderno. Toca no + de uma secção para escreveres a primeira.
        </p>
      )}

      <div className="caderno-arvore">
        {grupos.map((g, i) => {
          const abertaPorOmissao = g.notas.length > 0;
          const aberta = invertidas.has(g.nome) ? !abertaPorOmissao : abertaPorOmissao;
          return (
            <section key={g.nome} className="caderno-seccao" style={{ '--i': i }}>
              <div className="caderno-seccao__topo">
                <button className="caderno-seccao__titulo" aria-expanded={aberta} onClick={() => alternar(g.nome)}>
                  <span className={`caderno-seta ${aberta ? 'aberta' : ''}`} aria-hidden="true" />
                  <span className="caderno-seccao__nome">{g.nome}</span>
                  <span className="caderno-seccao__contador">{g.notas.length}</span>
                </button>
                <button className="caderno-seccao__nova" aria-label={`Nova página em ${g.nome}`} onClick={() => novaPagina(g.nome)}>+</button>
              </div>

              <div className={`caderno-seccao__corpo ${aberta ? 'aberto' : ''}`}>
                <div className="caderno-seccao__int">
                  {g.notas.length === 0 && <p className="caderno-seccao__vazia">Sem páginas ainda.</p>}
                  {g.notas.map((n) => (
                    <button
                      key={n.id}
                      className={`caderno-pagina-item ${selecionadaId === n.id ? 'ativa' : ''}`}
                      onClick={() => setSelecionadaId(n.id === selecionadaId ? null : n.id)}
                    >
                      <span className="caderno-pagina-item__titulo">{n.titulo || 'Sem título'}</span>
                      {n.favorita && <span className="caderno-pagina-item__estrela" aria-label="Favorita">★</span>}
                      {n.rascunho && <span className="caderno-pagina-item__rascunho">rascunho</span>}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {criandoSeccao ? (
        <form className="caderno-nova-seccao" onSubmit={criarSeccao}>
          <input
            autoFocus
            maxLength={40}
            placeholder="Nome da nova secção"
            aria-label="Nome da nova secção"
            value={nomeNovaSeccao}
            onChange={(e) => setNomeNovaSeccao(e.target.value)}
          />
          <button type="submit">Criar página</button>
        </form>
      ) : (
        <button className="caderno-btn-seccao" onClick={() => setCriandoSeccao(true)}>+ Nova secção</button>
      )}

      {selecionada && (
        <aside className="caderno-previa" aria-label="Pré-visualização da página">
          <div className="caderno-previa__topo">
            <strong>{selecionada.titulo || 'Sem título'}</strong>
            <button aria-label="Fechar pré-visualização" onClick={() => setSelecionadaId(null)}>×</button>
          </div>
          <span className="caderno-previa__meta">{seccaoDaSelecionada} · {dataCurta(selecionada.atualizadoEm)}</span>
          <p className="caderno-previa__texto">{previewTexto(selecionada, 220) || 'Página ainda vazia.'}</p>
          {(selecionada.tags || []).length > 0 && (
            <div className="caderno-previa__tags">
              {selecionada.tags.map((t) => <span key={t}>{t}</span>)}
            </div>
          )}
          <button className="caderno-previa__abrir" onClick={() => navigate(`/anotacoes/${selecionada.id}`)}>Abrir página</button>
        </aside>
      )}
    </div>
  );
}
