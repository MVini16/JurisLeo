// caso prático: lê os factos, aplica a lei e escolhe a solução. no fim de cada caso vê o raciocínio e a fonte
import { useState } from 'react';
import { JOGOS } from '../../data/jogos.js';
import { guardarJogada } from '../../services/jogosLocal.js';
import { FimDeJogo, Moldura } from './Moldura.jsx';
import { LETRAS, vibrar } from './utilJogos.js';

const JOGO = JOGOS.find((j) => j.id === 'caso');
const PONTOS_POR_CASO = 20;

export default function JogoCaso({ ronda, skin, aoSair, aoOutraVez }) {
  const [indice, setIndice] = useState(0);
  const [escolhida, setEscolhida] = useState(null);
  const [certas, setCertas] = useState([]);
  const [fim, setFim] = useState(null);

  const caso = ronda[indice];
  const pontos = certas.filter(Boolean).length * PONTOS_POR_CASO;

  function escolher(i) {
    if (escolhida !== null) return;
    setEscolhida(i);
    const acertou = i === caso.certa;
    vibrar(acertou ? 12 : [8, 40, 8]);
    setCertas((c) => [...c, acertou]);
  }

  function seguinte() {
    if (indice + 1 >= ronda.length) {
      const total = certas.filter(Boolean).length * PONTOS_POR_CASO;
      const { novoRecorde, melhor } = guardarJogada('caso', total);
      setFim({ total, novoRecorde, melhor });
      return;
    }
    setIndice((i) => i + 1);
    setEscolhida(null);
  }

  if (fim) {
    const revisao = ronda.map((c, i) => ({ c, certa: certas[i] })).filter((x) => x.certa === false)
      .map(({ c }) => ({ titulo: `${c.titulo}: ${c.pergunta}`, certa: `${c.opcoes[c.certa]}. ${c.explicacao}`, fonte: c.fonte }));
    const n = certas.filter(Boolean).length;
    return (
      <FimDeJogo
        jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={fim.total} novoRecorde={fim.novoRecorde} melhor={fim.melhor}
        destaque={`${n} de ${ronda.length} casos resolvidos`}
        resumo={n === ronda.length ? 'Raciocínio impecável, Doutora.' : 'Relê os casos abaixo e tenta outra vez.'}
        revisao={revisao} aoOutraVez={aoOutraVez} aoSair={aoSair}
      />
    );
  }
  if (!caso) return null;

  return (
    <Moldura jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={pontos} subtitulo={`Caso ${indice + 1} de ${ronda.length}`} aoSair={aoSair}>
      <article key={caso.id} className="jg-processo jg-entra">
        <span className="jg-etiqueta">{caso.titulo}</span>
        <h3>Factos</h3>
        <p className="jg-texto jg-texto--factos">{caso.factos}</p>
        <h3>Questão</h3>
        <p className="jg-texto jg-texto--pergunta">{caso.pergunta}</p>
      </article>

      <div className="jg-opcoes" role="group" aria-label="Soluções">
        {caso.opcoes.map((op, i) => {
          const estado = escolhida === null ? '' : i === caso.certa ? ' certa' : i === escolhida ? ' errada' : '';
          return (
            <button key={i} type="button" className={`jg-opcao${estado}`} disabled={escolhida !== null} onClick={() => escolher(i)}>
              <b>{LETRAS[i]}</b><span>{op}</span>
            </button>
          );
        })}
      </div>

      {escolhida !== null && (
        <div className={`jg-feedback ${escolhida === caso.certa ? 'certa' : 'errada'}`} role="status">
          <b>{escolhida === caso.certa ? `Certo! +${PONTOS_POR_CASO}` : 'Não foi desta'}</b>
          <p>{caso.explicacao}</p>
          <small>{caso.fonte}</small>
          <button type="button" className="jg-botao jg-botao--forte" onClick={seguinte}>{indice + 1 >= ronda.length ? 'Ver resultado' : 'Próximo caso'}</button>
        </div>
      )}
    </Moldura>
  );
}
