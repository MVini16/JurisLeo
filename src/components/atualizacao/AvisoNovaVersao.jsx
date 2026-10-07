// aviso de versão nova: diz o que há de novo e ensina, passo a passo, a ir buscá-la à internet e a pô-la outra vez no ecrã
// principal. depois de atualizar, mostra as novidades uma vez. não aparece enquanto ela escreve, estuda ou joga
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useVersaoNova } from '../../hooks/useVersaoNova.js';
import { rotaOcupada, rotaSemBoneco } from '../../services/boneco.js';
import { AVISO_DE_REINSTALAR, PLATAFORMAS_TUTORIAL, detetarPlataforma, passosDoTutorial } from '../../services/atualizacao.js';
import './AvisoNovaVersao.css';

function Passos({ passos }) {
  return (
    <ol className="anv-passos">
      {passos.map((p, i) => (
        <li key={p.titulo} style={{ '--i': i }}>
          <span className="anv-passos__n" aria-hidden="true">{i + 1}</span>
          <span><b>{p.titulo}</b><small>{p.texto}</small></span>
        </li>
      ))}
    </ol>
  );
}

export default function AvisoNovaVersao() {
  const { pathname } = useLocation();
  const { aviso, novidades, adiar, dispensarNovidades } = useVersaoNova();
  const [aberto, setAberto] = useState('rapido'); // 'rapido' | 'completo' | null
  const [copiado, setCopiado] = useState('');
  const [escolhida, setEscolhida] = useState(() => detetarPlataforma(navigator.userAgent, navigator.maxTouchPoints));

  const ocupada = rotaOcupada(pathname) || rotaSemBoneco(pathname) || pathname.startsWith('/jogos');
  if (ocupada || (!aviso && !novidades)) return null;

  const endereco = window.location.origin;
  const tutorial = passosDoTutorial(escolhida, endereco);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(endereco);
      setCopiado('Endereço copiado.');
    } catch {
      setCopiado(`Não consegui copiar. O endereço é ${endereco}`);
    }
  }

  // depois de atualizar: só as novidades
  if (!aviso) {
    return (
      <div className="anv-fundo" onClick={dispensarNovidades}>
        <section className="anv-folha" role="dialog" aria-modal="true" aria-label="Novidades" onClick={(e) => e.stopPropagation()}>
          <span className="anv-etiqueta">Já tens a versão nova</span>
          <h2>{novidades.titulo}</h2>
          <ul className="anv-itens">{novidades.itens.map((i) => <li key={i}>{i}</li>)}</ul>
          <button type="button" className="anv-botao anv-botao--forte" onClick={dispensarNovidades}>Vamos a isso</button>
        </section>
      </div>
    );
  }

  return (
    <div className="anv-fundo">
      <section className="anv-folha" role="dialog" aria-modal="true" aria-label="Há uma versão nova do JurisLeo">
        <span className="anv-etiqueta">Há uma versão nova</span>
        <h2>{aviso.titulo || 'O JurisLeo tem novidades'}</h2>
        {aviso.itens.length > 0 && <ul className="anv-itens">{aviso.itens.map((i) => <li key={i}>{i}</li>)}</ul>}
        <p className="anv-nota">Para a veres, a app tem de ir buscar a versão nova à internet. É rápido, segue estes passos.</p>

        <div className="anv-plataformas" role="radiogroup" aria-label="Em que aparelho estás?">
          {PLATAFORMAS_TUTORIAL.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={escolhida === p.id} className="anv-plataforma" onClick={() => setEscolhida(p.id)}>{p.nome}</button>
          ))}
        </div>

        <div className="anv-bloco">
          <button type="button" className="anv-cab" aria-expanded={aberto === 'rapido'} onClick={() => setAberto(aberto === 'rapido' ? null : 'rapido')}>
            <b>Caminho rápido</b><small>Começa por aqui</small>
          </button>
          {aberto === 'rapido' && <Passos passos={tutorial.rapido} />}
        </div>

        <div className="anv-bloco">
          <button type="button" className="anv-cab" aria-expanded={aberto === 'completo'} onClick={() => setAberto(aberto === 'completo' ? null : 'completo')}>
            <b>Se continuar igual: instalar de novo</b><small>Põe a app outra vez no ecrã principal</small>
          </button>
          {aberto === 'completo' && (
            <>
              <p className="anv-aviso">{AVISO_DE_REINSTALAR}</p>
              <Passos passos={tutorial.completo} />
              <button type="button" className="anv-botao" onClick={copiar}>Copiar o endereço da app</button>
              {copiado && <p className="anv-nota" role="status">{copiado}</p>}
            </>
          )}
        </div>

        <div className="anv-botoes">
          <button type="button" className="anv-botao" onClick={adiar}>Lembrar-me mais tarde</button>
        </div>
      </section>
    </div>
  );
}
