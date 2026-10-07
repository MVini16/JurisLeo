// liga os pares: toca num da esquerda e no que lhe corresponde na direita. até 3 rondas de 6 pares, cada ronda completa dá mais
// tempo, e os pares seguidos sem errar multiplicam os pontos
import { useEffect, useMemo, useRef, useState } from 'react';
import { JOGOS } from '../../data/jogos.js';
import { PENALIZACAO_PAR, RONDAS_PARES, TEMPO_INICIAL_PARES, TEMPO_POR_RONDA_PARES, multiplicadorPares, pontosDoPar, prepararTabuleiro, eParCerto, totalDoCaso } from '../../services/jogos.js';
import { terminarJogada } from '../../services/jogosLocal.js';
import { tocarSom } from '../../services/som.js';
import { FimDeJogo, Moldura } from './Moldura.jsx';
import { vibrar } from './utilJogos.js';

const JOGO = JOGOS.find((j) => j.id === 'pares');
const POR_RONDA = 6;

export default function JogoPares({ ronda, skin, aoSair, aoOutraVez, sugerirPausa }) {
  const rondas = Math.min(RONDAS_PARES, Math.max(1, Math.ceil(ronda.length / POR_RONDA)));
  const [numero, setNumero] = useState(0);
  const pares = useMemo(() => ronda.slice(numero * POR_RONDA, numero * POR_RONDA + POR_RONDA), [ronda, numero]);
  const tabuleiro = useMemo(() => prepararTabuleiro(pares), [pares]);
  const [ligados, setLigados] = useState([]);
  const [esquerda, setEsquerda] = useState(null);
  const [direita, setDireita] = useState(null);
  const [erro, setErro] = useState(null);
  const [seguidos, setSeguidos] = useState(0);
  const [movimentos, setMovimentos] = useState([]);
  const [erros, setErros] = useState(0);
  const [certosTotal, setCertosTotal] = useState(0);
  const [restante, setRestante] = useState(TEMPO_INICIAL_PARES);
  const [bonusRonda, setBonusRonda] = useState(false);
  const [fim, setFim] = useState(null);
  const [ganho, setGanho] = useState(null); // { chave, valor } do "+40" que sobe
  const tempo = useRef(TEMPO_INICIAL_PARES);
  const dados = useRef({});
  useEffect(() => { dados.current = { movimentos, erros, certosTotal }; }, [movimentos, erros, certosTotal]);

  function terminar(movs, errosFinais, certos, completou) {
    const pontos = totalDoCaso(movs);
    setFim({ pontos, certos, erros: errosFinais, meta: terminarJogada('pares', { pontos, perfeita: completou && errosFinais === 0 }) });
  }

  useEffect(() => {
    if (fim) return undefined;
    const id = setInterval(() => {
      tempo.current = Math.max(0, +(tempo.current - 0.25).toFixed(2));
      setRestante(tempo.current);
      if (tempo.current <= 0) { clearInterval(id); terminar(dados.current.movimentos, dados.current.erros, dados.current.certosTotal, false); }
    }, 250);
    return () => clearInterval(id);
    // terminar só usa setState e valores guardados em refs
  }, [fim]);

  function tentar(e, d) {
    if (eParCerto(e, d)) {
      const novosSeguidos = seguidos + 1;
      const valor = pontosDoPar(novosSeguidos);
      vibrar(12);
      tocarSom(multiplicadorPares(novosSeguidos) > multiplicadorPares(seguidos) ? 'combo' : 'certo');
      const movs = [...movimentos, valor];
      const novosLigados = [...ligados, e];
      setMovimentos(movs); setSeguidos(novosSeguidos); setCertosTotal((c) => c + 1);
      setGanho({ chave: movs.length, valor });
      setLigados(novosLigados);
      setEsquerda(null); setDireita(null);
      if (novosLigados.length === pares.length) {
        // ronda completa: mais tempo e a seguinte (ou fim, se foi a última)
        tocarSom('nivel');
        if (numero + 1 >= rondas) { setTimeout(() => terminar(movs, erros, certosTotal + 1, true), 600); return; }
        tempo.current = Math.min(120, tempo.current + TEMPO_POR_RONDA_PARES);
        setRestante(tempo.current);
        setBonusRonda(true);
        setTimeout(() => { setNumero((n) => n + 1); setLigados([]); setBonusRonda(false); }, 900);
      }
    } else {
      vibrar([8, 40, 8]);
      tocarSom('errado');
      setErros((n) => n + 1);
      setSeguidos(0);
      setMovimentos((m) => [...m, -PENALIZACAO_PAR]);
      setErro({ e, d });
      setTimeout(() => { setErro(null); setEsquerda(null); setDireita(null); }, 450);
    }
  }

  function tocar(lado, id) {
    if (erro || ligados.includes(id) || fim || bonusRonda) return;
    tocarSom('tic');
    if (lado === 'e') { setEsquerda(id); if (direita) tentar(id, direita); } else { setDireita(id); if (esquerda) tentar(esquerda, id); }
  }

  if (fim) {
    const naoLigados = pares.filter((p) => !ligados.includes(p.id)).map((p) => ({ titulo: p.a, certa: p.b, fonte: p.fonte }));
    return (
      <FimDeJogo
        jogo={JOGO} skin={skin} titulo={JOGO.nome} meta={fim.meta} sugerirPausa={sugerirPausa}
        destaque={`${fim.certos} pares ligados`}
        resumo={`${fim.erros} ${fim.erros === 1 ? 'erro' : 'erros'}. ${numero + 1 >= rondas && ligados.length === pares.length ? 'Completaste todas as rondas.' : `Chegaste à ronda ${numero + 1} de ${rondas}.`}`}
        revisao={naoLigados} aoOutraVez={aoOutraVez} aoSair={aoSair}
      />
    );
  }

  const m = multiplicadorPares(seguidos + 1);
  const classe = (lado, id) => {
    const sel = lado === 'e' ? esquerda === id : direita === id;
    const mal = erro && (lado === 'e' ? erro.e === id : erro.d === id);
    return `jg-par${ligados.includes(id) ? ' ligado' : ''}${sel ? ' sel' : ''}${mal ? ' mal' : ''}`;
  };

  return (
    <Moldura jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={totalDoCaso(movimentos)} subtitulo={`Ronda ${numero + 1} de ${rondas} · ${Math.ceil(restante)}s`} aoSair={aoSair}>
      <div className="jg-relogio" aria-hidden="true">
        <i style={{ width: `${Math.min(100, (restante / 90) * 100)}%` }} className={restante <= 15 ? 'urgente' : ''} />
      </div>
      <div className="jg-multi" aria-live="polite">
        <span className="jg-multi__serie">{seguidos > 0 ? `${seguidos} seguidos` : 'Liga sem errar para multiplicar'}</span>
        <span key={m} className="jg-multi__x">x{m}</span>
      </div>
      {bonusRonda && <p className="jg-sobe" role="status">Ronda completa! +{TEMPO_POR_RONDA_PARES}s</p>}
      {ganho && <span key={ganho.chave} className="jg-mais" aria-hidden="true">+{ganho.valor}</span>}
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
