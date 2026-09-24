// estante dos cadernos — um caderno por cadeira, como lombadas numa prateleira (preview aprovado: estante a)
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import { cadeirasS1, abrevCadeiras } from '../data/dadosLeonor.js';
import { contarPaginas, ultimaEditada, divisoriaDaAnotacao } from '../services/cadernos.js';
import { dataNatural } from '../services/datas.js';
import './Cadernos.css';

// as lombadas vão ficando mais baixas, como livros diferentes numa prateleira
const ALTURAS = [230, 214, 222, 200, 208, 218];

function quando(ts) {
  const d = ts?.toDate?.();
  if (!d) return '';
  return `${dataNatural(d)} às ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Cadernos() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { anotacoes } = useAnotacoes();
  const paginas = contarPaginas(anotacoes);
  const ultima = ultimaEditada(anotacoes);
  const nomeDivisoria = { teoricas: 'Teóricas', praticas: 'Práticas' };

  return (
    <div className={`cadernos-pagina ${darkMode ? 'dark' : ''}`}>
      <h1 className="cadernos-titulo">Cadernos</h1>
      <p className="cadernos-sub">Um caderno por cadeira. Toca numa lombada para abrir.</p>

      <div className="cadernos-prateleira">
        {cadeirasS1.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className="cadernos-lombada"
            style={{ '--cor': c.cor, '--altura': `${ALTURAS[i % ALTURAS.length]}px` }}
            onClick={() => navigate(`/anotacoes/caderno/${c.id}`)}
            aria-label={`${c.nome}, ${paginas[c.id] ?? 0} páginas`}
          >
            <span className="cadernos-lombada__nome">{c.abrev}</span>
            <span className="cadernos-lombada__paginas">{paginas[c.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {ultima && (
        <button type="button" className="cadernos-continuar" onClick={() => navigate(`/anotacoes/${ultima.id}`)}>
          <span className="cadernos-continuar__rotulo">Continuar onde ficaste</span>
          <strong className="cadernos-continuar__titulo">{ultima.titulo || 'Sem título'}</strong>
          <span className="cadernos-continuar__detalhe">
            {abrevCadeiras[ultima.cadeiraId] || '—'} · {nomeDivisoria[divisoriaDaAnotacao(ultima)] ?? 'Divisória própria'}
            {ultima.atualizadoEm ? ` · ${quando(ultima.atualizadoEm)}` : ''}
          </span>
        </button>
      )}

      <div className="cadernos-links">
        <button type="button" className="cadernos-link" onClick={() => navigate('/anotacoes/nova')}>+ Nova página</button>
        <button type="button" className="cadernos-link" onClick={() => navigate('/pesquisa')}>Procurar em todos os cadernos</button>
        <button type="button" className="cadernos-link" onClick={() => navigate('/anotacoes/todas')}>Ver todas numa lista</button>
      </div>
    </div>
  );
}
