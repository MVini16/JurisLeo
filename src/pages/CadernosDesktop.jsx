// as notas no computador: três painéis (cadernos e vistas, páginas do caderno, folha aberta ao lado)
// atalhos: N nova página, / procurar. no telemóvel continua a estante (Anotacoes.jsx)
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import Anotacao from './Anotacao.jsx';
import Icone from '../components/icones/Icone.jsx';
import EcraCarregar from '../components/EcraCarregar.jsx';
import {
  ABAS_NOTAS, CADERNO_LIVRE, agruparPorSeccao, contarPorAba, contarPorCaderno, dataCurta, filtrarNotas, previewTexto,
} from '../services/cadernos.js';
import { cadeirasS1, idsCadeiras } from '../data/dadosLeonor.js';
import './CadernosDesktop.css';

const ROTULOS_ABA = { todas: 'Todas', fav: 'Favoritas', rasc: 'Rascunhos', freq: 'Para a frequência' };

export default function CadernosDesktop() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { anotacoes, loading } = useAnotacoes();
  const [cadernoId, setCadernoId] = useState(cadeirasS1[0].id);
  const [aba, setAba] = useState('todas');
  const [pesquisa, setPesquisa] = useState('');
  const [notaId, setNotaId] = useState(null);
  const campoPesquisa = useRef(null);

  const contagemCadernos = contarPorCaderno(anotacoes, idsCadeiras);
  const contagemAbas = contarPorAba(anotacoes, idsCadeiras);
  const cadernos = [
    ...cadeirasS1.map((c) => ({ id: c.id, nome: c.nome, cor: c.cor })),
    { id: CADERNO_LIVRE, nome: 'Caderno Livre', cor: 'var(--gold)' },
  ];
  const atual = cadernos.find((c) => c.id === cadernoId);

  // em "Todas" sem pesquisa mostra as secções do caderno; nas outras vistas e na pesquisa, uma lista seguida
  const emSeccoes = aba === 'todas' && !pesquisa.trim();
  const grupos = emSeccoes ? agruparPorSeccao(anotacoes, cadernoId, idsCadeiras) : [];
  const lista = emSeccoes ? [] : filtrarNotas(anotacoes, { aba, cadernoId: aba === 'todas' ? cadernoId : null, pesquisa, idsConhecidos: idsCadeiras });

  function novaPagina(seccao) {
    navigate('/anotacoes/nova', { state: { cadeiraId: cadernoId, seccao } });
  }

  useEffect(() => {
    function aoTeclar(e) {
      const alvo = e.target;
      const aEscrever = alvo instanceof HTMLElement && (alvo.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName));
      if (aEscrever || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === '/') { e.preventDefault(); campoPesquisa.current?.focus(); }
      else if (e.key.toLowerCase() === 'n') { e.preventDefault(); navigate('/anotacoes/nova', { state: { cadeiraId: cadernoId } }); }
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [cadernoId, navigate]);

  const itemNota = (n) => (
    <li key={n.id}>
      <button type="button" className={`cd-nota ${notaId === n.id ? 'ativa' : ''}`} onClick={() => setNotaId(n.id)}>
        <span className="cd-nota__titulo">{n.titulo || 'Sem título'}{n.favorita && <i className="cd-nota__estrela" aria-label="Favorita">★</i>}{n.rascunho && <em>rascunho</em>}</span>
        <span className="cd-nota__previa">{previewTexto(n, 90) || 'Página ainda vazia.'}</span>
        <span className="cd-nota__data">{dataCurta(n.atualizadoEm)}</span>
      </button>
    </li>
  );

  return (
    <div className={`cd ${darkMode ? 'dark' : ''}`} style={{ '--cor': atual?.cor }}>
      <nav className="cd-p1" aria-label="Cadernos">
        <h1 className="cd-titulo">Cadernos</h1>
        {cadernos.map((c) => (
          <button key={c.id} type="button" className={`cd-caderno ${cadernoId === c.id && aba === 'todas' ? 'ativo' : ''}`} style={{ '--c': c.cor }}
            onClick={() => { setCadernoId(c.id); setAba('todas'); setNotaId(null); }}>
            <i className="cd-lombada" aria-hidden="true" /><span>{c.nome}</span><em>{contagemCadernos[c.id] || 0}</em>
          </button>
        ))}
        <p className="cd-grupo">Vistas</p>
        {ABAS_NOTAS.filter((a) => a !== 'todas').map((a) => (
          <button key={a} type="button" className={`cd-caderno ${aba === a ? 'ativo' : ''}`} onClick={() => { setAba(a); setNotaId(null); }}>
            <span>{ROTULOS_ABA[a]}</span><em>{contagemAbas[a] || 0}</em>
          </button>
        ))}
        <p className="cd-atalhos">N nova página<br />/ procurar<br />Ctrl+K ir a outra página</p>
      </nav>

      <section className="cd-p2" aria-label="Páginas">
        <header className="cd-p2__topo">
          <h2>{aba === 'todas' ? atual?.nome : ROTULOS_ABA[aba]}</h2>
          <button type="button" className="cd-nova" onClick={() => novaPagina()}><Icone nome="pena" tamanho={18} /> Nova</button>
        </header>
        <input ref={campoPesquisa} className="cd-pesquisa" type="search" placeholder="Procurar nas notas (/)" aria-label="Pesquisar nas notas" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
        {loading && <EcraCarregar compacto />}
        {!loading && emSeccoes && grupos.map((g) => (
          <div key={g.nome} className="cd-seccao">
            <div className="cd-seccao__topo"><span>{g.nome}</span><b>{g.notas.length}</b><button type="button" aria-label={`Nova página em ${g.nome}`} onClick={() => novaPagina(g.nome)}>+</button></div>
            <ul>{g.notas.map(itemNota)}{g.notas.length === 0 && <li className="cd-vazia">Sem páginas ainda.</li>}</ul>
          </div>
        ))}
        {!loading && !emSeccoes && (
          <ul>{lista.map(itemNota)}{lista.length === 0 && <li className="cd-vazia">Nada por aqui.</li>}</ul>
        )}
      </section>

      <section className="cd-p3" aria-label="Folha">
        {notaId ? <Anotacao key={notaId} idProp={notaId} embutida aoSair={() => setNotaId(null)} /> : (
          <div className="cd-vazio">
            <Icone nome="pena" tamanho={56} viva />
            <h2>Escolhe uma página</h2>
            <p>Ela abre aqui ao lado, sem saíres da lista.</p>
            <button type="button" className="cd-nova" onClick={() => novaPagina()}>Nova página em {atual?.nome}</button>
          </div>
        )}
      </section>
    </div>
  );
}
