// cartão no início: a manhã (curta) e a noite (completa). uma vez por janela, insiste uma vez e cala-se.
// só responde com uma frase quando ela está em baixo; se está bem, agradece numa linha e sai da frente.
import { useState } from 'react';
import { useBemEstar } from '../hooks/useBemEstar.js';
import FormBemEstar from './FormBemEstar.jsx';
import MensagemCarinhosa from './MensagemCarinhosa.jsx';
import { janelaParaMostrar, aposDispensar, estaEmBaixo, alertaPersistencia } from '../services/bemEstar.js';
import { chaveData } from '../data/feriados.js';
import './BemEstar.css';

const CHAVE_AVISO = 'jurisleo-bemestar-aviso';

function lerAviso() {
  try { return JSON.parse(localStorage.getItem(CHAVE_AVISO) || 'null'); } catch { return null; }
}

function guardarAviso(aviso) {
  try { localStorage.setItem(CHAVE_AVISO, JSON.stringify(aviso)); } catch { /* sem localStorage, sem problema */ }
}

const CUMPRIMENTO = { manha: 'Bom dia. Queres contar como estás?', noite: 'Boa noite. Queres contar como correu o dia?' };

export default function CartaoBemEstar() {
  const { registos, camposAtivos, loading, guardar } = useBemEstar();
  const [agora] = useState(() => new Date());
  const hojeChave = chaveData(agora);
  const [aviso, setAviso] = useState(lerAviso);
  const [aPreencher, setAPreencher] = useState(false);
  const [resposta, setResposta] = useState(null); // { emBaixo, alerta }

  const janela = loading ? null : janelaParaMostrar({ hora: agora.getHours(), registoHoje: registos[hojeChave], aviso, hojeChave });

  async function aoGuardar(dados) {
    await guardar(hojeChave, janela, dados);
    const alerta = alertaPersistencia({ ...registos, [hojeChave]: { [janela]: dados } }, agora);
    setResposta({ emBaixo: estaEmBaixo(dados), alerta });
    setAPreencher(false);
    if (!estaEmBaixo(dados)) setTimeout(() => setResposta(null), 6000);
  }

  function agoraNao() {
    const novo = aposDispensar(aviso, janela, hojeChave);
    guardarAviso(novo);
    setAviso(novo);
    setAPreencher(false);
  }

  if (resposta) {
    return (
      <section className="card bem-cartao" aria-live="polite">
        {resposta.emBaixo ? (
          <>
            <MensagemCarinhosa contexto="diaDificil" />
            {resposta.alerta && <p className="bem-nota">O Vini foi avisado que a semana está a ser dura.</p>}
            <button type="button" className="bem-botao" onClick={() => setResposta(null)}>Ok</button>
          </>
        ) : (
          <p className="bem-agradecimento">Obrigada por contares.</p>
        )}
      </section>
    );
  }

  if (!janela) return null;

  return (
    <section className="card bem-cartao">
      {!aPreencher ? (
        <>
          <p className="bem-cumprimento">{CUMPRIMENTO[janela]}</p>
          <div className="bem-acoes">
            <button type="button" className="bem-botao bem-botao--principal" onClick={() => setAPreencher(true)}>Contar</button>
            <button type="button" className="bem-botao" onClick={agoraNao}>Agora não</button>
          </div>
        </>
      ) : (
        <FormBemEstar janela={janela} camposAtivos={camposAtivos} onGuardar={aoGuardar} onCancelar={agoraNao} />
      )}
    </section>
  );
}
