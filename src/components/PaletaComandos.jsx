// paleta de comandos do computador: Ctrl+K (ou Cmd+K) abre uma caixa para ir a qualquer página da app com o teclado
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filtrarDestinos } from '../data/destinos.js';
import Icone from './icones/Icone.jsx';
import './PaletaComandos.css';

export default function PaletaComandos() {
  const navigate = useNavigate();
  const [aberta, setAberta] = useState(false);
  const [texto, setTexto] = useState('');
  const [marcado, setMarcado] = useState(0);
  const campo = useRef(null);
  const resultados = filtrarDestinos(texto);

  useEffect(() => {
    function aoTeclar(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAberta((v) => !v);
        setTexto('');
        setMarcado(0);
      } else if (e.key === 'Escape') {
        setAberta(false);
      }
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  useEffect(() => { if (aberta) campo.current?.focus(); }, [aberta]);

  function ir(rota) {
    setAberta(false);
    navigate(rota);
  }

  function aoTeclarNoCampo(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setMarcado((m) => Math.min(m + 1, resultados.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setMarcado((m) => Math.max(m - 1, 0)); }
    else if (e.key === 'Enter' && resultados[marcado]) ir(resultados[marcado].rota);
  }

  if (!aberta) return null;
  return (
    <div className="paleta-fundo no-print" onClick={() => setAberta(false)}>
      <div className="paleta" role="dialog" aria-label="Ir para uma página" onClick={(e) => e.stopPropagation()}>
        <input ref={campo} className="paleta__campo" value={texto} placeholder="Ir para... (Cadernos, Faltas, Sumários)" aria-label="Procurar página"
          onChange={(e) => { setTexto(e.target.value); setMarcado(0); }} onKeyDown={aoTeclarNoCampo} />
        <ul className="paleta__lista" role="listbox">
          {resultados.length === 0 && <li className="paleta__vazio">Nenhuma página com esse nome.</li>}
          {resultados.map((d, i) => (
            <li key={d.rota} role="option" aria-selected={i === marcado}>
              <button type="button" className={`paleta__item ${i === marcado ? 'marcado' : ''}`} onMouseEnter={() => setMarcado(i)} onClick={() => ir(d.rota)}>
                <Icone nome={d.icone} tamanho={20} /><span>{d.rotulo}</span><small>{d.grupo}</small>
              </button>
            </li>
          ))}
        </ul>
        <p className="paleta__dica">Setas para escolher, Enter para ir, Esc para fechar</p>
      </div>
    </div>
  );
}
