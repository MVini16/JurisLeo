// escolha de um modelo de página: cartões com um esboço do que o modelo traz.
// aparece logo numa nota nova e pode abrir-se a qualquer altura para acrescentar um modelo ao fim
import { MODELOS_PAGINA } from '../../data/modelosPagina.js';
import './SeletorModelos.css';

const LEGENDA_ESBOCO = { t: 'titulo', l: 'linha', c: 'curta', b: 'bloco', k: 'checks', g: 'tabela' };

export default function SeletorModelos({ aoEscolher, aoFechar, notaVazia }) {
  return (
    <section className="modelos" aria-label="Modelos de página">
      <header className="modelos__topo">
        <div>
          <strong>Modelos de página</strong>
          <span>{notaVazia ? 'Começa com uma estrutura pronta, ou fecha e escreve à vontade.' : 'O modelo é acrescentado no fim da nota, sem apagar nada.'}</span>
        </div>
        <button className="modelos__fechar" onClick={aoFechar} aria-label="Fechar modelos">×</button>
      </header>

      <div className="modelos__grelha">
        {MODELOS_PAGINA.map((m, i) => (
          <button key={m.id} className="modelo" style={{ '--i': i }} onClick={() => aoEscolher(m)}>
            <span className="modelo__esboco" aria-hidden="true">
              {m.esboco.map((tipo, k) => <i key={k} className={`modelo__peca modelo__peca--${LEGENDA_ESBOCO[tipo]}`} />)}
            </span>
            <strong className="modelo__nome">{m.nome}</strong>
            <span className="modelo__descricao">{m.descricao}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
