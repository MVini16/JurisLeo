// a barra de baixo do modo social: Início, Estudar, o botão do Feed ao centro, Calendário e Mais (todas as páginas da app)
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icone from '../icones/Icone.jsx';
import AlternarModo from './AlternarModo.jsx';
import { GRUPOS_DESTINOS } from '../../data/destinos.js';
import './BarraSocial.css';

const SEPARADORES = [
  { caminho: '/dashboard', nome: 'inicio', rotulo: 'Início' },
  { caminho: '/flashcards', nome: 'cartas', rotulo: 'Estudar' },
  { caminho: '/feed', nome: 'feed', rotulo: 'Feed', centro: true },
  { caminho: '/calendario', nome: 'calendario', rotulo: 'Calendário' },
];


// o que já está na barra de baixo não se repete no menu Mais
const NA_BARRA = new Set(SEPARADORES.map((s) => s.caminho));
const GRUPOS_NO_MAIS = GRUPOS_DESTINOS
  .map((g) => ({ ...g, itens: g.itens.filter((d) => !NA_BARRA.has(d.rota)) }))
  .filter((g) => g.itens.length > 0);

export default function BarraSocial() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mais, setMais] = useState(false);
  const ativo = (c) => pathname === c || pathname.startsWith(`${c}/`);

  function ir(caminho) {
    setMais(false);
    navigate(caminho);
  }

  return (
    <>
      {mais && (
        <div className="bs-folha-fundo" onClick={() => setMais(false)}>
          <div className="bs-folha" role="dialog" aria-label="Todas as páginas" onClick={(e) => e.stopPropagation()}>
            <div className="bs-folha__pega" aria-hidden="true" />
            {GRUPOS_NO_MAIS.map((g) => (
              <div key={g.titulo} className="bs-grupo">
                <h3>{g.titulo}</h3>
                <div className="bs-grelha">
                  {g.itens.map((d) => (
                    <button key={d.rota} type="button" className="bs-item" onClick={() => ir(d.rota)}>
                      <Icone nome={d.icone} tamanho={26} /><span>{d.rotulo}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <AlternarModo className="bs-voltar" />
          </div>
        </div>
      )}
      <nav className="bs-barra no-print" aria-label="Navegação">
        {SEPARADORES.map((s) => (
          <button key={s.caminho} type="button" className={`bs-sep ${s.centro ? 'centro' : ''} ${ativo(s.caminho) ? 'ativo' : ''}`} onClick={() => ir(s.caminho)} aria-current={ativo(s.caminho) ? 'page' : undefined}>
            <span className="bs-sep__icone"><Icone nome={s.nome} tamanho={s.centro ? 26 : 24} ativo={ativo(s.caminho)} /></span>
            <span className="bs-sep__rotulo">{s.rotulo}</span>
          </button>
        ))}
        <button type="button" className={`bs-sep ${mais ? 'ativo' : ''}`} onClick={() => setMais((v) => !v)} aria-expanded={mais}>
          <span className="bs-sep__icone"><Icone nome="mais" tamanho={24} ativo={mais} /></span>
          <span className="bs-sep__rotulo">Mais</span>
        </button>
      </nav>
    </>
  );
}
