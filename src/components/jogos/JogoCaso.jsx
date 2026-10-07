// caso prático: lê os factos, escolhe a convicção (aposta) e depois a solução. a fonte pode ser espreitada, mas custa pontos
import { useState } from 'react';
import { JOGOS } from '../../data/jogos.js';
import { APOSTAS, CUSTO_DICA_CASO, pontosDoCaso, totalDoCaso } from '../../services/jogos.js';
import { terminarJogada } from '../../services/jogosLocal.js';
import { tocarSom } from '../../services/som.js';
import { FimDeJogo, Moldura } from './Moldura.jsx';
import { LETRAS, vibrar } from './utilJogos.js';

const JOGO = JOGOS.find((j) => j.id === 'caso');

const VEREDICTOS_CERTOS = ['Procedente.', 'O tribunal dá-te razão.', 'Decisão unânime.', 'Sentença favorável.'];
const VEREDICTOS_ERRADOS = ['Improcedente.', 'O tribunal pensa diferente.', 'Recurso indeferido.', 'Volta aos autos.'];

export default function JogoCaso({ ronda, skin, aoSair, aoOutraVez, sugerirPausa }) {
  const [indice, setIndice] = useState(0);
  const [aposta, setAposta] = useState(1);
  const [dica, setDica] = useState(false);
  const [escolhida, setEscolhida] = useState(null);
  const [movimentos, setMovimentos] = useState([]);
  const [certas, setCertas] = useState([]);
  const [fim, setFim] = useState(null);

  const caso = ronda[indice];
  const total = totalDoCaso(movimentos);

  function escolher(i) {
    if (escolhida !== null) return;
    setEscolhida(i);
    const acertou = i === caso.certa;
    vibrar(acertou ? 12 : [8, 40, 8]);
    tocarSom(acertou ? 'certo' : 'errado');
    if (acertou && aposta === 3) setTimeout(() => tocarSom('combo'), 180);
    setMovimentos((m) => [...m, pontosDoCaso(aposta, acertou) - (dica ? CUSTO_DICA_CASO : 0)]);
    setCertas((c) => [...c, acertou]);
  }

  function seguinte() {
    if (indice + 1 >= ronda.length) {
      const pontos = totalDoCaso(movimentos);
      setFim({ pontos, meta: terminarJogada('caso', { pontos, perfeita: certas.every(Boolean) }) });
      return;
    }
    setIndice((i) => i + 1);
    setEscolhida(null);
    setDica(false);
  }

  if (fim) {
    const revisao = ronda.map((c, i) => ({ c, certa: certas[i] })).filter((x) => x.certa === false)
      .map(({ c }) => ({ titulo: `${c.titulo}: ${c.pergunta}`, certa: `${c.opcoes[c.certa]}. ${c.explicacao}`, fonte: c.fonte }));
    const n = certas.filter(Boolean).length;
    return (
      <FimDeJogo
        jogo={JOGO} skin={skin} titulo={JOGO.nome} meta={fim.meta} sugerirPausa={sugerirPausa}
        destaque={`${n} de ${ronda.length} casos resolvidos`}
        resumo={n === ronda.length ? 'Raciocínio impecável, Doutora.' : 'Relê os casos abaixo e tenta outra vez.'}
        revisao={revisao} aoOutraVez={aoOutraVez} aoSair={aoSair}
      />
    );
  }
  if (!caso) return null;

  const resolvido = escolhida !== null;
  const acertou = resolvido && escolhida === caso.certa;
  const veredicto = (acertou ? VEREDICTOS_CERTOS : VEREDICTOS_ERRADOS)[indice % 4];
  const variacao = resolvido ? movimentos[movimentos.length - 1] : 0;

  return (
    <Moldura jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={total} subtitulo={`Processo ${indice + 1} de ${ronda.length}`} aoSair={aoSair}>
      <article key={caso.id} className="jg-processo jg-entra">
        <span className="jg-etiqueta">{caso.titulo}</span>
        <h3>Factos</h3>
        <p className="jg-texto jg-texto--factos">{caso.factos}</p>
        <h3>Questão</h3>
        <p className="jg-texto jg-texto--pergunta">{caso.pergunta}</p>
        {dica && <p className="jg-dica-fonte">Vê em: {caso.fonte}</p>}
      </article>

      {!resolvido && (
        <>
          <div className="jg-apostas" role="radiogroup" aria-label="Convicção">
            {APOSTAS.map((a) => (
              <button key={a.id} type="button" role="radio" aria-checked={aposta === a.id} className={`jg-aposta${aposta === a.id ? ' ativa' : ''}`} onClick={() => { setAposta(a.id); tocarSom('tic'); }}>
                <b>{a.rotulo}</b><small>{a.descricao}</small>
              </button>
            ))}
          </div>
          <button type="button" className="jg-ajuda" disabled={dica} onClick={() => setDica(true)}>{dica ? 'Fonte à vista' : `Espreitar a fonte (-${CUSTO_DICA_CASO} pts)`}</button>
        </>
      )}

      <div className="jg-opcoes" role="group" aria-label="Soluções">
        {caso.opcoes.map((op, i) => {
          const estado = !resolvido ? '' : i === caso.certa ? ' certa' : i === escolhida ? ' errada' : '';
          return (
            <button key={i} type="button" className={`jg-opcao${estado}`} disabled={resolvido} onClick={() => escolher(i)}>
              <b>{LETRAS[i]}</b><span>{op}</span>
            </button>
          );
        })}
      </div>

      {resolvido && (
        <div className={`jg-feedback ${acertou ? 'certa' : 'errada'}`} role="status">
          <b>{veredicto} {variacao >= 0 ? `+${variacao}` : variacao} pontos</b>
          <p>{caso.explicacao}</p>
          <small>{caso.fonte}</small>
          <button type="button" className="jg-botao jg-botao--forte" onClick={seguinte}>{indice + 1 >= ronda.length ? 'Ver resultado' : 'Próximo processo'}</button>
        </div>
      )}
    </Moldura>
  );
}
