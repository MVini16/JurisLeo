// estante de cadernos: uma lombada por cadeira (e uma para o caderno livre), que sobe ao toque
import './Estante.css';

// alturas diferentes para parecer uma estante a sério (a lombada livre é a mais baixa)
const ALTURAS = [176, 156, 190, 150, 166, 140];

export default function Estante({ cadernos, onAbrir, estilo = 'lombadas' }) {
  if (estilo === 'capas') {
    return (
      <div className="capas" role="list" aria-label="Cadernos">
        {cadernos.map((c, i) => (
          <button
            key={c.id}
            role="listitem"
            className={`capa ${c.livre ? 'capa--livre' : ''}`}
            style={{ '--c': c.cor, '--i': i }}
            aria-label={`${c.nome}, ${c.total} ${c.total === 1 ? 'página' : 'páginas'}`}
            onClick={() => onAbrir(c.id)}
          >
            <span className="capa__nome">{c.nome}</span>
            <span className="capa__total">{c.total} {c.total === 1 ? 'página' : 'páginas'}</span>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="estante-bloco">
      <div className="estante" role="list" aria-label="Cadernos">
        {cadernos.map((c, i) => (
          <button
            key={c.id}
            role="listitem"
            className={`lombada ${c.livre ? 'lombada--livre' : ''}`}
            style={{ '--c': c.cor, '--i': i, height: `${ALTURAS[i % ALTURAS.length]}px` }}
            aria-label={`${c.nome}, ${c.total} ${c.total === 1 ? 'página' : 'páginas'}`}
            onClick={() => onAbrir(c.id)}
          >
            <span className="lombada__nome">{c.ab}</span>
            <span className="lombada__total">{c.total}</span>
          </button>
        ))}
      </div>
      <div className="prateleira" />
    </div>
  );
}
