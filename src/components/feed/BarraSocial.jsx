// a barra de baixo do modo social: Início, Estudar, o botão do Feed ao centro, Calendário e Mais (todas as páginas da app)
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icone from '../icones/Icone.jsx';
import AlternarModo from './AlternarModo.jsx';
import './BarraSocial.css';

const SEPARADORES = [
  { caminho: '/dashboard', nome: 'inicio', rotulo: 'Início' },
  { caminho: '/flashcards', nome: 'cartas', rotulo: 'Estudar' },
  { caminho: '/feed', nome: 'feed', rotulo: 'Feed', centro: true },
  { caminho: '/calendario', nome: 'calendario', rotulo: 'Calendário' },
];

const GRUPOS = [
  { titulo: 'Hoje', itens: [['/horario', 'relogio', 'Horário'], ['/tarefas', 'sabia', 'Tarefas'], ['/faltas', 'escudo', 'Faltas']] },
  { titulo: 'Estudar', itens: [['/anotacoes', 'pena', 'Cadernos'], ['/sumarios', 'livro', 'Sumários'], ['/casos', 'balanca', 'Casos'], ['/glossario', 'livro', 'Glossário'], ['/jogos', 'dado', 'Jogos'], ['/estudo', 'chama', 'Estudo'], ['/pesquisa', 'alvo', 'Pesquisa']] },
  { titulo: 'Faculdade', itens: [['/cadeiras', 'livro', 'Cadeiras'], ['/artigos', 'pena', 'Artigos'], ['/leituras', 'livro', 'Leituras']] },
  { titulo: 'Eu', itens: [['/perfil', 'modo', 'Definições'], ['/ajuda', 'alvo', 'Ajuda']] },
];

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
            {GRUPOS.map((g) => (
              <div key={g.titulo} className="bs-grupo">
                <h3>{g.titulo}</h3>
                <div className="bs-grelha">
                  {g.itens.map(([caminho, icone, rotulo]) => (
                    <button key={caminho} type="button" className="bs-item" onClick={() => ir(caminho)}>
                      <Icone nome={icone} tamanho={26} /><span>{rotulo}</span>
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
