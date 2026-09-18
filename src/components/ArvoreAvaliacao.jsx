// diagrama do regulamento: mostra onde a cadeira está na árvore de avaliação
// o passo atual fica destacado, os que já passaram ficam marcados e os outros esbatidos
import './ArvoreAvaliacao.css';

const PASSOS_A = [
  { id: 'ac', titulo: 'Avaliação contínua', regra: '12 ou mais: aprovada. 10 ou 11: vais a exame escrito. 9 ou menos: passas a Método B.' },
  { id: 'escrito', titulo: 'Exame escrito', regra: '7 ou menos: excluída. 10 ou mais no escrito: aprovada. Média de 12 ou mais: aprovada. Nos outros casos, vais a oral.' },
  { id: 'oral', titulo: 'Prova oral', regra: 'A oral vale se for positiva e melhor do que a nota de entrada. Senão conta a média, e com 10 ou mais aprovas.' },
  { id: 'recurso', titulo: 'Exame de recurso', regra: 'Só para quem ficou excluída. Com 10 ou mais, aprovas.' },
  { id: 'melhoria', titulo: 'Melhoria de nota', regra: 'Uma por cadeira, sempre oral. Só conta se for superior à nota que já tens.' },
];

const PASSOS_B = [
  { id: 'escrito', titulo: 'Exame escrito', regra: '12 ou mais: aprovada. De 8 a 11: vais a oral. 7 ou menos: excluída.' },
  { id: 'oral', titulo: 'Prova oral', regra: 'A oral vale se for positiva e melhor do que a nota de entrada. Senão conta a média, e com 10 ou mais aprovas.' },
  { id: 'recurso', titulo: 'Exame de recurso', regra: 'Só para quem ficou excluída. Com 10 ou mais, aprovas.' },
  { id: 'melhoria', titulo: 'Melhoria de nota', regra: 'Uma por cadeira, sempre oral. Só conta se for superior à nota que já tens.' },
];

// descobre o passo em que a cadeira está e quais já foram feitos
function localizar({ metodo, resultado, notaAC, dados }) {
  const d = dados || {};
  const feito = {
    ac: notaAC != null,
    escrito: d.exameEscrito != null,
    oral: d.exameOral != null,
    recurso: d.exameRecurso != null,
    melhoria: d.melhoriaOral != null,
  };

  let atual;
  if (resultado.estado === 'semDados') atual = metodo === 'A' ? 'ac' : 'escrito';
  else if (resultado.estado === 'admitidaEscrito') atual = 'escrito';
  else if (resultado.estado === 'admitidaOral') atual = 'oral';
  else if (resultado.estado === 'passaMetodoB') atual = 'ac';
  else if (feito.melhoria) atual = 'melhoria';
  else if (feito.recurso) atual = 'recurso';
  else if (feito.oral) atual = 'oral';
  else if (feito.escrito) atual = 'escrito';
  else atual = metodo === 'A' ? 'ac' : 'escrito';

  return { atual, feito };
}

export default function ArvoreAvaliacao({ metodo, resultado, notaAC, dados }) {
  const passos = metodo === 'A' ? PASSOS_A : PASSOS_B;
  const { atual, feito } = localizar({ metodo, resultado, notaAC, dados });
  const terminou = resultado.estado === 'aprovada' || resultado.estado === 'excluida';

  return (
    <ol className="arvore" aria-label="Onde estás no regulamento de avaliação">
      {passos.map((passo) => {
        const estado = passo.id === atual ? 'atual' : feito[passo.id] ? 'feito' : 'esbatido';
        return (
          <li key={passo.id} className={`arvore__passo arvore__passo--${estado}`} aria-current={estado === 'atual' ? 'step' : undefined}>
            <span className="arvore__marca" aria-hidden="true">{estado === 'feito' ? '✓' : ''}</span>
            <div className="arvore__corpo">
              <span className="arvore__titulo">{passo.titulo}</span>
              <span className="arvore__regra">{passo.regra}</span>
            </div>
          </li>
        );
      })}
      {resultado.estado === 'passaMetodoB' && (
        <li className="arvore__passo arvore__passo--atual">
          <span className="arvore__marca" aria-hidden="true" />
          <div className="arvore__corpo">
            <span className="arvore__titulo">Método B</span>
            <span className="arvore__regra">Passas a ser avaliada só por exame.</span>
          </div>
        </li>
      )}
      {terminou && (
        <li className={`arvore__fim arvore__fim--${resultado.estado}`}>
          {resultado.estado === 'aprovada' ? `Aprovada com ${resultado.notaFinal}` : 'Excluída'}
        </li>
      )}
    </ol>
  );
}
