// calculadora de prazos: dias úteis ou seguidos, com feriados nacionais
import { useState } from 'react';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import { calcularPrazo, explicarPrazo, TIPOS_PRAZO, PRAZOS_PREDEFINIDOS } from '../services/prazos.js';
import { chaveData } from '../data/feriados.js';
import { dataDeChave, dataNatural } from '../services/datas.js';
import './Ferramentas.css';

export default function Prazos() {
  const [inicio, setInicio] = useState(() => chaveData(new Date()));
  const [dias, setDias] = useState(2);
  const [tipo, setTipo] = useState('uteis');
  const [passaParaUtil, setPassaParaUtil] = useState(false);
  const [fonte, setFonte] = useState('');

  const valido = inicio && Number(dias) >= 0 && Number(dias) <= 3650;
  const resultado = valido ? calcularPrazo(dataDeChave(inicio), dias, { tipo, passaParaUtil }) : null;

  function aplicar(p) {
    setDias(p.dias);
    setTipo(p.tipo);
    setFonte(p.fonte);
  }

  return (
    <div className="fx-pagina">
      <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />
      <h1 className="fx-titulo">Calculadora de prazos</h1>
      <p className="fx-sub">Diz quando começa e quantos dias tens.</p>

      <div className="fx-chips" role="group" aria-label="Prazos do regulamento">
        {PRAZOS_PREDEFINIDOS.map((p) => (
          <button key={p.id} type="button" className="fx-chip" onClick={() => aplicar(p)}>{p.nome}</button>
        ))}
      </div>
      {fonte && <p className="fx-aviso">{fonte}</p>}

      <div className="fx-campo">
        <label htmlFor="pz-inicio">Começa em</label>
        <input id="pz-inicio" type="date" value={inicio} onChange={(e) => { setInicio(e.target.value); setFonte(''); }} />
      </div>
      <div className="fx-campo">
        <label htmlFor="pz-dias">Número de dias</label>
        <input id="pz-dias" type="number" inputMode="numeric" min="0" max="3650" value={dias} onChange={(e) => { setDias(e.target.value); setFonte(''); }} />
      </div>
      <div className="fx-segmentos" role="radiogroup" aria-label="Tipo de dias">
        {TIPOS_PRAZO.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={tipo === t.id} className={`fx-segmento ${tipo === t.id ? 'ativo' : ''}`} onClick={() => { setTipo(t.id); setFonte(''); }}>{t.nome}</button>
        ))}
      </div>
      <label className="fx-opcao">
        <input type="checkbox" checked={passaParaUtil} onChange={(e) => setPassaParaUtil(e.target.checked)} />
        <span>Se acabar num dia sem expediente, passa para o dia útil seguinte</span>
      </label>

      {resultado ? (
        <section className="fx-resultado" aria-live="polite">
          <p className="fx-resultado__frase">O prazo acaba <b>{dataNatural(resultado.fim)}</b>.</p>
          <p className="fx-resultado__data">{resultado.fim.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <ul className="fx-resultado__notas">
            {explicarPrazo(resultado).map((f) => <li key={f}>{f}</li>)}
          </ul>
        </section>
      ) : (
        <p className="fx-vazio">Escolhe uma data e um número de dias válido.</p>
      )}

      <p className="fx-aviso">Conta os feriados nacionais. Não inclui férias judiciais, tolerâncias nem outros dias sem expediente: confirma sempre o prazo na notificação ou no diploma aplicável.</p>
    </div>
  );
}
