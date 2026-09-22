// editor de um mapa mental: caixas que se arrastam, ligadas por setas — tudo em SVG simples
import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useMapaMental } from '../hooks/useMapasMentais.js';
import { adicionarNo, moverNo, editarTextoNo, removerNo, ligarNos, removerLigacao } from '../services/mapaMental.js';
import { cadeirasS1 } from '../data/dadosLeonor.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import Carregando from '../components/animacoes/Carregando.jsx';
import './MapaMental.css';

function idNovo() {
  return `n${Date.now()}_${Math.round(Math.random() * 100000)}`;
}

export default function MapaMental() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { mapa, loading, novo, criar, guardar, apagar } = useMapaMental(id);

  if (!novo && loading) return <div className="mm-pagina"><Carregando texto="A carregar..." tipo="templo" /></div>;

  return (
    <div className={`mm-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/mapas-mentais" texto="‹ Mapas Mentais" />
      {novo ? (
        <FormularioNovo criar={criar} onCriado={(novoId) => navigate(`/mapas-mentais/${novoId}`, { replace: true })} />
      ) : (
        <Editor mapa={mapa} guardar={guardar} apagar={apagar} onApagado={() => navigate('/mapas-mentais')} />
      )}
    </div>
  );
}

function FormularioNovo({ criar, onCriado }) {
  const [titulo, setTitulo] = useState('');
  const [cadeiraId, setCadeiraId] = useState(cadeirasS1[0].id);
  const [aCriar, setACriar] = useState(false);

  async function handleCriar() {
    if (!titulo.trim()) return;
    setACriar(true);
    const novoId = await criar({ titulo: titulo.trim(), cadeiraId });
    setACriar(false);
    if (novoId) onCriado(novoId);
  }

  return (
    <>
      <h1 className="mm-titulo">Novo mapa mental</h1>
      <input className="mm-input" placeholder="Título (ex: Responsabilidade civil)" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      <div className="mm-cadeiras">
        {cadeirasS1.map((c) => (
          <button key={c.id} className={`mm-cadeira-btn ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>
            {c.abrev}
          </button>
        ))}
      </div>
      <button className="mm-btn-guardar" onClick={handleCriar} disabled={aCriar || !titulo.trim()}>
        {aCriar ? 'A criar...' : 'Criar mapa'}
      </button>
    </>
  );
}

function Editor({ mapa, guardar, apagar, onApagado }) {
  const canvasRef = useRef(null);
  const [nos, setNos] = useState(mapa.nos || []);
  const [ligacoes, setLigacoes] = useState(mapa.ligacoes || []);
  const [aArrastar, setAArrastar] = useState(null); // id do nó a ser arrastado
  const [modoLigar, setModoLigar] = useState(false);
  const [ligandoDe, setLigandoDe] = useState(null);
  const [confirmarApagar, setConfirmarApagar] = useState(false);

  function posicaoRelativa(clientX, clientY) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(94, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(92, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  }

  function handleAdicionarNo() {
    const x = 10 + Math.random() * 70;
    const y = 10 + Math.random() * 70;
    const novos = adicionarNo(nos, idNovo(), x, y);
    setNos(novos);
    guardar({ nos: novos });
  }

  function iniciarArrasto(id) {
    if (modoLigar) return;
    setAArrastar(id);
  }

  function moverDurante(e) {
    if (!aArrastar) return;
    const { x, y } = posicaoRelativa(e.clientX, e.clientY);
    setNos((prev) => moverNo(prev, aArrastar, x, y));
  }

  function terminarArrasto() {
    if (!aArrastar) return;
    setAArrastar(null);
    guardar({ nos });
  }

  function clicarNo(id) {
    if (!modoLigar) return;
    if (!ligandoDe) {
      setLigandoDe(id);
      return;
    }
    const novas = ligarNos(ligacoes, ligandoDe, id);
    setLigacoes(novas);
    guardar({ ligacoes: novas });
    setLigandoDe(null);
  }

  function editarTexto(id, texto) {
    setNos((prev) => editarTextoNo(prev, id, texto));
  }

  function guardarTexto() {
    guardar({ nos });
  }

  function apagarNo(id) {
    const r = removerNo(nos, ligacoes, id);
    setNos(r.nos);
    setLigacoes(r.ligacoes);
    guardar({ nos: r.nos, ligacoes: r.ligacoes });
  }

  function apagarLigacaoAoClicar(de, para) {
    const novas = removerLigacao(ligacoes, de, para);
    setLigacoes(novas);
    guardar({ ligacoes: novas });
  }

  const noPorId = Object.fromEntries(nos.map((n) => [n.id, n]));

  return (
    <>
      <h1 className="mm-titulo">{mapa.titulo}</h1>

      <div className="mm-barra">
        <button className="mm-btn-pequeno" onClick={handleAdicionarNo}>+ Nó</button>
        <button className={`mm-btn-pequeno ${modoLigar ? 'ativo' : ''}`} onClick={() => { setModoLigar((m) => !m); setLigandoDe(null); }}>
          {modoLigar ? '✓ A ligar...' : '🔗 Ligar'}
        </button>
      </div>
      {modoLigar && <p className="mm-nota">{ligandoDe ? 'Toca no segundo nó para ligar.' : 'Toca no primeiro nó.'} Toca numa seta para a apagar.</p>}

      <div
        ref={canvasRef}
        className="mm-canvas"
        onPointerMove={moverDurante}
        onPointerUp={terminarArrasto}
        onPointerLeave={terminarArrasto}
      >
        <svg className="mm-setas" viewBox="0 0 100 100" preserveAspectRatio="none">
          {ligacoes.map((l, i) => {
            const de = noPorId[l.de];
            const para = noPorId[l.para];
            if (!de || !para) return null;
            return (
              <line
                key={i}
                x1={de.x + 3} y1={de.y + 2} x2={para.x + 3} y2={para.y + 2}
                className="mm-linha"
                onPointerDown={(e) => { e.stopPropagation(); apagarLigacaoAoClicar(l.de, l.para); }}
              />
            );
          })}
        </svg>

        {nos.map((n) => (
          <div
            key={n.id}
            className={`mm-no ${ligandoDe === n.id ? 'a-ligar' : ''}`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            onPointerDown={(e) => { e.stopPropagation(); iniciarArrasto(n.id); }}
            onClick={() => clicarNo(n.id)}
          >
            <input
              className="mm-no__texto"
              value={n.texto}
              onChange={(e) => editarTexto(n.id, e.target.value)}
              onBlur={guardarTexto}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <button className="mm-no__apagar" onPointerDown={(e) => e.stopPropagation()} onClick={() => apagarNo(n.id)}>×</button>
          </div>
        ))}

        {nos.length === 0 && <p className="mm-canvas-vazio">Toca em "+ Nó" para começares.</p>}
      </div>

      <div className="mm-acoes">
        {confirmarApagar ? (
          <div className="mm-confirmar">
            <span>Apagar este mapa?</span>
            <button onClick={async () => { await apagar(); onApagado(); }}>Sim</button>
            <button onClick={() => setConfirmarApagar(false)}>Não</button>
          </div>
        ) : (
          <button className="mm-btn-apagar" onClick={() => setConfirmarApagar(true)}>Apagar mapa</button>
        )}
      </div>
    </>
  );
}
