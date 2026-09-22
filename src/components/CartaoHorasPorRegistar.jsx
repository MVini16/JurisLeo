// cartão no início: ao fim do dia, se não há nenhuma sessão de estudo registada, pergunta uma vez —
// nunca obriga, e cala-se depois de dispensado ou registado, até ao dia seguinte
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSessoesEstudo } from '../hooks/useSessoesEstudo.js';
import { deveSugerirRegisto } from '../services/horasPorRegistar.js';
import { chaveData } from '../data/feriados.js';

const CHAVE_DISPENSADO = 'jurisleo-horas-dispensado';

function lerDispensadoHoje() {
  try { return localStorage.getItem(CHAVE_DISPENSADO) === chaveData(new Date()); } catch { return false; }
}

export default function CartaoHorasPorRegistar() {
  const { sessoes, loading } = useSessoesEstudo();
  const [dispensado, setDispensado] = useState(lerDispensadoHoje);

  if (loading || dispensado || !deveSugerirRegisto(sessoes)) return null;

  function dispensar() {
    try { localStorage.setItem(CHAVE_DISPENSADO, chaveData(new Date())); } catch { /* sem localStorage, só não guarda */ }
    setDispensado(true);
  }

  return (
    <div className="card anim-entrada">
      <div className="card-header">
        <span className="card-icon">⏱️</span>
        <span className="card-titulo">Ainda não registaste nada hoje</span>
      </div>
      <p className="card-vazio">Foi só teoria, ou queres registar uns minutos de estudo?</p>
      <div className="dash-ferr">
        <Link to="/estudo" className="dash-ferr__chip">Registar agora</Link>
        <button className="dash-ferr__chip dash-ferr__chip--todas" onClick={dispensar}>Foi só teoria</button>
      </div>
    </div>
  );
}
