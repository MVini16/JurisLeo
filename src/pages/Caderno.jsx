// dentro de um caderno: divisórias em separadores no topo e as páginas de cada uma (preview aprovado: interior b)
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import { useDivisorias } from '../hooks/useDivisorias.js';
import { getCadeira } from '../data/dadosLeonor.js';
import { paginasDaDivisoria, moverPagina, DIVISORIAS_BASE, MAX_NOME_DIVISORIA } from '../services/cadernos.js';
import { dataNatural } from '../services/datas.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import './Cadernos.css';

// até uma semana: "hoje", "ontem"...; depois disso só dia/mês, para não roubar espaço ao título
function dataPagina(ts) {
  const d = ts?.toDate?.();
  if (!d) return '';
  const natural = dataNatural(d);
  return natural.includes(',') ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}` : natural;
}

export default function Caderno() {
  const { cadeiraId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { anotacoes } = useAnotacoes();
  const { daCadeira, adicionar, apagar, gravarOrdem } = useDivisorias();
  const [ativaId, setAtivaId] = useState('teoricas');
  const [aCriar, setACriar] = useState(false);
  const [nomeNova, setNomeNova] = useState('');
  const [confirmarApagar, setConfirmarApagar] = useState(false);

  const cadeira = getCadeira(cadeiraId);
  if (!cadeira) return <div className="cadernos-pagina"><p>Este caderno não existe.</p></div>;

  const divisorias = daCadeira(cadeiraId);
  // se a divisória ativa foi apagada, volta às teóricas
  const ativa = divisorias.find((d) => d.id === ativaId) ?? divisorias[0];
  const paginas = paginasDaDivisoria(anotacoes, cadeiraId, ativa.id, divisorias);
  const eDeBase = DIVISORIAS_BASE.some((b) => b.id === ativa.id);

  function criar(e) {
    e.preventDefault();
    const nova = adicionar(cadeiraId, nomeNova);
    if (nova) setAtivaId(nova.id);
    setNomeNova('');
    setACriar(false);
  }

  function mover(id, direcao) {
    const ordens = moverPagina(paginas, id, direcao);
    if (ordens) gravarOrdem(ordens);
  }

  return (
    <div className={`cadernos-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/anotacoes" texto="‹ Cadernos" />

      <div className="caderno-capa" style={{ '--cor': cadeira.cor }}>
        <strong>{cadeira.nome}</strong>
      </div>

      <div className="caderno-separadores" role="tablist" aria-label="Divisórias">
        {divisorias.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === ativa.id}
            className={`caderno-separador ${d.id === ativa.id ? 'ativo' : ''}`}
            style={{ '--cor': d.cor ?? 'var(--burgundy)' }}
            onClick={() => { setAtivaId(d.id); setConfirmarApagar(false); }}
          >
            {d.nome}
          </button>
        ))}
        <button type="button" className="caderno-separador caderno-separador--novo" aria-label="Nova divisória" onClick={() => setACriar(true)}>+</button>
      </div>

      <div className="caderno-folha" style={{ '--cor': ativa.cor ?? 'var(--burgundy)' }}>
        {aCriar && (
          <form className="caderno-nova-divisoria" onSubmit={criar}>
            <input
              value={nomeNova}
              onChange={(e) => setNomeNova(e.target.value)}
              maxLength={MAX_NOME_DIVISORIA}
              placeholder="Nome da divisória (ex. Cap. 1 · Fontes)"
              aria-label="Nome da divisória nova"
              autoFocus
            />
            <button type="submit" className="caderno-botao caderno-botao--cheio" disabled={!nomeNova.trim()}>Criar</button>
            <button type="button" className="caderno-botao" onClick={() => setACriar(false)}>Cancelar</button>
          </form>
        )}

        {paginas.length === 0 && <p className="caderno-vazio">Ainda não há páginas nesta divisória.</p>}

        <ol className="caderno-paginas">
          {paginas.map((p, i) => (
            <li key={p.id} className="caderno-pagina-item">
              <button type="button" className="caderno-pagina-item__abrir" onClick={() => navigate(`/anotacoes/${p.id}`)}>
                <span className="caderno-pagina-item__numero">{i + 1}.</span>
                <span className="caderno-pagina-item__titulo">{p.titulo || 'Sem título'}</span>
                <span className="caderno-pagina-item__data">{dataPagina(p.atualizadoEm)}</span>
              </button>
              <div className="caderno-pagina-item__mover">
                <button type="button" aria-label={`Subir ${p.titulo || 'página'}`} disabled={i === 0} onClick={() => mover(p.id, -1)}>↑</button>
                <button type="button" aria-label={`Descer ${p.titulo || 'página'}`} disabled={i === paginas.length - 1} onClick={() => mover(p.id, 1)}>↓</button>
              </div>
            </li>
          ))}
        </ol>

        <button
          type="button"
          className="caderno-nova-pagina"
          onClick={() => navigate('/anotacoes/nova', { state: { cadeiraId, divisoria: ativa.id } })}
        >
          + Nova página
        </button>

        {!eDeBase && (
          confirmarApagar ? (
            <div className="caderno-apagar">
              <span>Apagar a divisória “{ativa.nome}”? As páginas passam para as Teóricas, nada se perde.</span>
              <button type="button" className="caderno-botao caderno-botao--cheio" onClick={() => { apagar(cadeiraId, ativa.id); setAtivaId('teoricas'); setConfirmarApagar(false); }}>Apagar</button>
              <button type="button" className="caderno-botao" onClick={() => setConfirmarApagar(false)}>Não</button>
            </div>
          ) : (
            <button type="button" className="caderno-botao caderno-botao--texto" onClick={() => setConfirmarApagar(true)}>Apagar esta divisória</button>
          )
        )}
      </div>
    </div>
  );
}
