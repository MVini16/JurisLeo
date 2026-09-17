// progresso de leitura dos manuais, por cadeira
import { useState } from 'react';
import { useTheme } from '../context/useTheme.js';
import { useLeituras } from '../hooks/useLeituras.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import { cadeirasS1, coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import './Leituras.css';

export default function Leituras() {
  const { darkMode } = useTheme();
  const { leituras, loading, adicionar, atualizar, apagar } = useLeituras();
  const [formAberto, setFormAberto] = useState(false);

  return (
    <div className={`leituras-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/cadeiras" />
      <header className="leituras-header">
        <h1 className="leituras-titulo">Leituras</h1>
        <button className="leituras-btn-novo" onClick={() => setFormAberto((f) => !f)}>{formAberto ? 'Fechar' : '+ Novo manual'}</button>
      </header>

      {formAberto && <FormNovaLeitura onGuardar={async (d) => { await adicionar(d); setFormAberto(false); }} />}

      {loading && <p className="leituras-vazio">A carregar...</p>}
      {!loading && leituras.length === 0 && <p className="leituras-vazio">Ainda não tens manuais registados.</p>}

      <div className="leituras-lista">
        {leituras.map((l) => (
          <LeituraCard key={l.id} leitura={l} onAtualizar={(d) => atualizar(l.id, d)} onApagar={() => apagar(l.id)} />
        ))}
      </div>
    </div>
  );
}

function FormNovaLeitura({ onGuardar }) {
  const [cadeiraId, setCadeiraId] = useState(cadeirasS1[0].id);
  const [manual, setManual] = useState('');
  const [autor, setAutor] = useState('');
  const [totalPaginas, setTotalPaginas] = useState('');
  const [aGuardar, setAGuardar] = useState(false);

  async function guardar() {
    if (!manual.trim()) return;
    setAGuardar(true);
    await onGuardar({ cadeiraId, manual: manual.trim(), autor: autor.trim(), totalPaginas: Number(totalPaginas) || 0 });
    setAGuardar(false);
  }

  return (
    <div className="leituras-form-novo">
      <div className="leituras-form-novo__cadeiras">
        {cadeirasS1.map((c) => (
          <button key={c.id} className={`leituras-chip-cadeira ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>{c.abrev}</button>
        ))}
      </div>
      <input className="leituras-form-novo__input" placeholder="Nome do manual" value={manual} onChange={(e) => setManual(e.target.value)} autoFocus />
      <div className="leituras-form-novo__linha">
        <input className="leituras-form-novo__input" placeholder="Autor" value={autor} onChange={(e) => setAutor(e.target.value)} />
        <input className="leituras-form-novo__input leituras-form-novo__paginas" type="number" placeholder="Total de páginas" value={totalPaginas} onChange={(e) => setTotalPaginas(e.target.value)} />
      </div>
      <button className="leituras-form-novo__guardar" onClick={guardar} disabled={aGuardar || !manual.trim()}>
        {aGuardar ? 'A guardar...' : 'Guardar'}
      </button>
    </div>
  );
}

function LeituraCard({ leitura, onAtualizar, onApagar }) {
  const [novoCapitulo, setNovoCapitulo] = useState('');
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const cor = coresCadeiras[leitura.cadeiraId] || '#b8963e';
  const percentagem = leitura.totalPaginas ? Math.min(100, Math.round((leitura.paginaAtual / leitura.totalPaginas) * 100)) : 0;

  function atualizarPagina(valor) {
    const n = Math.max(0, Math.min(leitura.totalPaginas || 0, Number(valor) || 0));
    onAtualizar({ paginaAtual: n });
  }

  function adicionarCapitulo() {
    if (!novoCapitulo.trim()) return;
    onAtualizar({ capitulos: [...(leitura.capitulos || []), { titulo: novoCapitulo.trim(), lido: false }] });
    setNovoCapitulo('');
  }

  function toggleCapitulo(i) {
    const capitulos = [...(leitura.capitulos || [])];
    capitulos[i] = { ...capitulos[i], lido: !capitulos[i].lido };
    onAtualizar({ capitulos });
  }

  function removerCapitulo(i) {
    onAtualizar({ capitulos: (leitura.capitulos || []).filter((_, idx) => idx !== i) });
  }

  return (
    <div className="leitura-card" style={{ '--cor': cor }}>
      <div className="leitura-card__topo">
        <span className="leitura-card__cadeira">{abrevCadeiras[leitura.cadeiraId]}</span>
        <span className="leitura-card__percentagem">{percentagem}%</span>
      </div>
      <h3 className="leitura-card__manual">{leitura.manual}</h3>
      {leitura.autor && <p className="leitura-card__autor">{leitura.autor}</p>}

      <div className="leitura-card__barra-container">
        <div className="leitura-card__barra" style={{ width: `${percentagem}%` }} />
      </div>

      <div className="leitura-card__paginas">
        <input
          className="leitura-card__pagina-input"
          type="number"
          value={leitura.paginaAtual || 0}
          onChange={(e) => atualizarPagina(e.target.value)}
        />
        <span>de {leitura.totalPaginas || '?'} páginas</span>
      </div>

      {leitura.capitulos?.length > 0 && (
        <div className="leitura-card__capitulos">
          {leitura.capitulos.map((cap, i) => (
            <div key={i} className={`leitura-capitulo ${cap.lido ? 'lido' : ''}`}>
              <button className="leitura-capitulo__check" onClick={() => toggleCapitulo(i)}>{cap.lido ? '✓' : ''}</button>
              <span className="leitura-capitulo__titulo">{cap.titulo}</span>
              <button className="leitura-capitulo__remover" onClick={() => removerCapitulo(i)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="leitura-card__add-capitulo">
        <input
          className="leitura-card__add-input"
          placeholder="+ Capítulo"
          value={novoCapitulo}
          onChange={(e) => setNovoCapitulo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarCapitulo(); } }}
        />
      </div>

      <div className="leitura-card__rodape">
        {!confirmarApagar ? (
          <button className="leitura-card__link leitura-card__link--apagar" onClick={() => setConfirmarApagar(true)}>Apagar manual</button>
        ) : (
          <span className="leitura-card__confirmar">Apagar? <button className="leitura-card__link" onClick={onApagar}>Sim</button> / <button className="leitura-card__link" onClick={() => setConfirmarApagar(false)}>Não</button></span>
        )}
      </div>
    </div>
  );
}
