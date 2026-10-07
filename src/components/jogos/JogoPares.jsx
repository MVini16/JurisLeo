// liga os pares: toca num da esquerda e no que lhe corresponde na direita, contra o relógio
import { useEffect, useMemo, useRef, useState } from 'react';
import { JOGOS } from '../../data/jogos.js';
import { eParCerto, pontosPares, prepararTabuleiro } from '../../services/jogos.js';
import { guardarJogada } from '../../services/jogosLocal.js';
import { FimDeJogo, Moldura } from './Moldura.jsx';
import { vibrar } from './utilJogos.js';

const JOGO = JOGOS.find((j) => j.id === 'pares');
const TEMPO_LIMITE = 90;

export default function JogoPares({ ronda, skin, aoSair, aoOutraVez }) {
  const tabuleiro = useMemo(() => prepararTabuleiro(ronda), [ronda]);
  const [ligados, setLigados] = useState([]); // ids já ligados
  const [esquerda, setEsquerda] = useState(null);
  const [direita, setDireita] = useState(null);
  const [erro, setErro] = useState(null); // { e, d } durante a animação de erro
  const [erros, setErros] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [fim, setFim] = useState(null);

  const dados = useRef({ ligados, erros });
  useEffect(() => { dados.current = { ligados, erros }; }, [ligados, erros]);
  const tempo = useRef(0);

  function terminar(certos, errosFinais, t) {
    const pts = pontosPares({ certos, erros: errosFinais, segundos: t, tempoLimite: TEMPO_LIMITE });
    const { novoRecorde, melhor } = guardarJogada('pares', pts);
    setFim({ pts, novoRecorde, melhor, certos, erros: errosFinais, tempo: t });
  }

  useEffect(() => {
    if (fim) return undefined;
    const id = setInterval(() => {
      tempo.current += 1;
      setSegundos(tempo.current);
      if (tempo.current >= TEMPO_LIMITE) { clearInterval(id); terminar(dados.current.ligados.length, dados.current.erros, tempo.current); }
    }, 1000);
    return () => clearInterval(id);
  }, [fim]);

  function tentar(e, d) {
    if (eParCerto(e, d)) {
      vibrar(12);
      const novos = [...ligados, e];
      setLigados(novos);
      setEsquerda(null); setDireita(null);
      if (novos.length === ronda.length) terminar(novos.length, erros, segundos);
    } else {
      vibrar([8, 40, 8]);
      setErros((n) => n + 1);
      setErro({ e, d });
      setTimeout(() => { setErro(null); setEsquerda(null); setDireita(null); }, 500);
    }
  }

  function tocar(lado, id) {
    if (erro || ligados.includes(id) || fim) return;
    if (lado === 'e') { setEsquerda(id); if (direita) tentar(id, direita); } else { setDireita(id); if (esquerda) tentar(esquerda, id); }
  }

  const pontosAgora = Math.max(0, ligados.length * 20 - erros * 5);

  if (fim) {
    const naoLigados = ronda.filter((p) => !ligados.includes(p.id)).map((p) => ({ titulo: p.a, certa: p.b, fonte: p.fonte }));
    return (
      <FimDeJogo
        jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={fim.pts} novoRecorde={fim.novoRecorde} melhor={fim.melhor}
        destaque={`${fim.certos} de ${ronda.length} pares`}
        resumo={`${fim.erros} ${fim.erros === 1 ? 'erro' : 'erros'} em ${fim.tempo} segundos.`}
        revisao={naoLigados} aoOutraVez={aoOutraVez} aoSair={aoSair}
      />
    );
  }

  const classe = (lado, id) => {
    const sel = lado === 'e' ? esquerda === id : direita === id;
    const mal = erro && (lado === 'e' ? erro.e === id : erro.d === id);
    return `jg-par${ligados.includes(id) ? ' ligado' : ''}${sel ? ' sel' : ''}${mal ? ' mal' : ''}`;
  };

  return (
    <Moldura jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={pontosAgora} subtitulo={`${ligados.length} de ${ronda.length} · ${Math.max(0, TEMPO_LIMITE - segundos)}s`} aoSair={aoSair}>
      <div className="jg-relogio" aria-hidden="true">
        <i style={{ width: `${Math.max(0, 1 - segundos / TEMPO_LIMITE) * 100}%` }} className={segundos > TEMPO_LIMITE * 0.75 ? 'urgente' : ''} />
      </div>
      <p className="jg-dica">Toca num da esquerda e no que lhe corresponde na direita.</p>
      <div className="jg-pares">
        <div className="jg-coluna">
          {tabuleiro.esquerda.map((c) => (
            <button key={c.id} type="button" className={classe('e', c.id)} disabled={ligados.includes(c.id)} onClick={() => tocar('e', c.id)}>{c.texto}</button>
          ))}
        </div>
        <div className="jg-coluna">
          {tabuleiro.direita.map((c) => (
            <button key={c.id} type="button" className={classe('d', c.id)} disabled={ligados.includes(c.id)} onClick={() => tocar('d', c.id)}>{c.texto}</button>
          ))}
        </div>
      </div>
    </Moldura>
  );
}
