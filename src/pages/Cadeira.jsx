// página de detalhe de uma cadeira — avaliação e faltas
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useCadeira } from '../hooks/useCadeira.js';
import { avaliarCadeira, calcularNotaAC } from '../services/avaliacao.js';
import { estadoFaltas } from '../services/faltas.js';
import { getCadeira } from '../data/dadosLeonor.js';
import './Cadeira.css';

const ROTULO_ESTADO = {
  aprovada: 'Aprovada',
  admitidaEscrito: 'Vai a exame escrito',
  admitidaOral: 'Vai a oral',
  excluida: 'Excluída',
  passaMetodoB: 'Passa a Método B',
  semDados: 'Sem notas ainda',
};

// converte o valor de um input (string, pode estar vazio) para número ou null
function paraNumero(valor) {
  if (valor === '' || valor === null || valor === undefined) return null;
  const n = Number(valor);
  return Number.isNaN(n) ? null : n;
}

export default function Cadeira() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { cadeira, faltasDados, avaliacaoDados, loading, guardarFaltas, guardarAvaliacao } = useCadeira(id);
  const infoBase = getCadeira(id);

  if (loading) return <div className="cadeira-pagina"><p className="cadeira-loading">A carregar...</p></div>;
  if (!cadeira) return <div className="cadeira-pagina"><p className="cadeira-loading">Cadeira não encontrada.</p></div>;

  const cor = cadeira.cor || '#b8963e';

  return (
    <div className={`cadeira-pagina ${darkMode ? 'dark' : ''}`}>
      <button className="cadeira-voltar" onClick={() => navigate('/cadeiras')}>‹ Cadeiras</button>

      <header className="cadeira-header" style={{ '--cor': cor }}>
        <span className="cadeira-header__abrev">{cadeira.abrev}</span>
        <h1 className="cadeira-header__nome">{cadeira.nome}</h1>
        <p className="cadeira-header__regente">{cadeira.regente} · Método {cadeira.metodo}</p>
      </header>

      {avaliacaoDados
        ? <SeccaoAvaliacao cadeira={cadeira} infoBase={infoBase} avaliacaoDados={avaliacaoDados} guardarAvaliacao={guardarAvaliacao} />
        : <p className="cadeira-loading">A carregar avaliação...</p>}

      {faltasDados
        ? <SeccaoFaltas cadeira={cadeira} faltasDados={faltasDados} guardarFaltas={guardarFaltas} />
        : <p className="cadeira-loading">A carregar faltas...</p>}

      <p className="cadeira-aviso-geral">
        Cálculo com base no regulamento geral — confirma sempre a ficha da tua cadeira, porque o regente pode fixar regras próprias.
      </p>
    </div>
  );
}

function SeccaoAvaliacao({ cadeira, infoBase, avaliacaoDados, guardarAvaliacao }) {
  const [form, setForm] = useState(() => ({
    provaEscrita: avaliacaoDados.provaEscrita ?? '',
    outrosElementos: avaliacaoDados.outrosElementos ?? '',
    exameEscrito: avaliacaoDados.exameEscrito ?? '',
    exameOral: avaliacaoDados.exameOral ?? '',
    exameRecurso: avaliacaoDados.exameRecurso ?? '',
    melhoriaOral: avaliacaoDados.melhoriaOral ?? '',
  }));
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const pesos = infoBase?.pesos || { provaEscrita: 0.5, outrosElementos: 0.5 };
  const provaEscritaNum = paraNumero(form.provaEscrita);
  const outrosElementosNum = paraNumero(form.outrosElementos);
  const notaAC = provaEscritaNum != null && outrosElementosNum != null
    ? calcularNotaAC({ provaEscrita: provaEscritaNum, outrosElementos: outrosElementosNum, pesos })
    : null;

  const resultado = avaliarCadeira({
    metodo: cadeira.metodo,
    notaAC,
    exameEscrito: paraNumero(form.exameEscrito),
    exameOral: paraNumero(form.exameOral),
    exameRecurso: paraNumero(form.exameRecurso),
    melhoriaOral: paraNumero(form.melhoriaOral),
  });

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setGuardado(false);
  }

  async function guardar() {
    setGuardando(true);
    await guardarAvaliacao({
      provaEscrita: provaEscritaNum,
      outrosElementos: outrosElementosNum,
      exameEscrito: paraNumero(form.exameEscrito),
      exameOral: paraNumero(form.exameOral),
      exameRecurso: paraNumero(form.exameRecurso),
      melhoriaOral: paraNumero(form.melhoriaOral),
    });
    setGuardando(false);
    setGuardado(true);
  }

  const mostraEscrito = cadeira.metodo === 'B' || (notaAC != null && notaAC >= 10 && notaAC <= 11);
  const mostraOral = resultado.estado === 'admitidaOral' || resultado.notaEntradaOral != null || form.exameOral !== '';
  const mostraRecurso = resultado.estado === 'excluida' || form.exameRecurso !== '';
  const mostraMelhoria = resultado.estado === 'aprovada' || form.melhoriaOral !== '';

  return (
    <section className="cadeira-seccao">
      <h2 className="cadeira-seccao__titulo">📊 Avaliação</h2>

      <div className="cadeira-campos">
        {cadeira.metodo === 'A' && (
          <>
            <CampoNota label="Prova escrita (contínua)" valor={form.provaEscrita} onChange={(v) => atualizar('provaEscrita', v)} />
            <CampoNota label="Outros elementos" valor={form.outrosElementos} onChange={(v) => atualizar('outrosElementos', v)} />
          </>
        )}
        {mostraEscrito && (
          <CampoNota label="Exame escrito" valor={form.exameEscrito} onChange={(v) => atualizar('exameEscrito', v)} />
        )}
        {mostraOral && (
          <CampoNota label="Exame oral" valor={form.exameOral} onChange={(v) => atualizar('exameOral', v)} />
        )}
        {mostraRecurso && (
          <CampoNota label="Exame de recurso" valor={form.exameRecurso} onChange={(v) => atualizar('exameRecurso', v)} />
        )}
        {mostraMelhoria && (
          <CampoNota label="Melhoria (oral)" valor={form.melhoriaOral} onChange={(v) => atualizar('melhoriaOral', v)} />
        )}
      </div>

      {notaAC != null && cadeira.metodo === 'A' && (
        <p className="cadeira-nota-ac">Nota de avaliação contínua: <strong>{notaAC}</strong></p>
      )}

      <div className={`cadeira-resultado cadeira-resultado--${resultado.estado}`}>
        <span className="cadeira-resultado__estado">{ROTULO_ESTADO[resultado.estado] || resultado.estado}</span>
        {resultado.notaFinal != null && <span className="cadeira-resultado__nota">{resultado.notaFinal}</span>}
        <p className="cadeira-resultado__explicacao">{resultado.explicacao}</p>
        {resultado.avisos?.map((aviso, i) => (
          <p key={i} className="cadeira-resultado__aviso">⚠️ {aviso}</p>
        ))}
      </div>

      <button className="cadeira-btn-guardar" onClick={guardar} disabled={guardando}>
        {guardando ? 'A guardar...' : guardado ? '✓ Guardado' : 'Guardar notas'}
      </button>
    </section>
  );
}

function SeccaoFaltas({ cadeira, faltasDados, guardarFaltas }) {
  const [form, setForm] = useState(() => ({
    aulasPraticasLecionadas: faltasDados.aulasPraticasLecionadas ?? 0,
    faltasInjustificadas: faltasDados.faltasInjustificadas ?? 0,
    faltasJustificadas: faltasDados.faltasJustificadas ?? 0,
  }));
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const resultado = cadeira.aulasPraticasPrevistas ? estadoFaltas({
    aulasPraticasPrevistas: cadeira.aulasPraticasPrevistas,
    aulasPraticasLecionadas: paraNumero(form.aulasPraticasLecionadas) || 0,
    faltasInjustificadas: paraNumero(form.faltasInjustificadas) || 0,
    faltasJustificadas: paraNumero(form.faltasJustificadas) || 0,
  }) : null;

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setGuardado(false);
  }

  async function guardar() {
    setGuardando(true);
    await guardarFaltas({
      aulasPraticasLecionadas: paraNumero(form.aulasPraticasLecionadas) || 0,
      faltasInjustificadas: paraNumero(form.faltasInjustificadas) || 0,
      faltasJustificadas: paraNumero(form.faltasJustificadas) || 0,
    });
    setGuardando(false);
    setGuardado(true);
  }

  return (
    <section className="cadeira-seccao">
      <h2 className="cadeira-seccao__titulo">📋 Faltas</h2>

      <div className="cadeira-campos">
        <CampoNota label="Aulas práticas já dadas" valor={form.aulasPraticasLecionadas} max={cadeira.aulasPraticasPrevistas} onChange={(v) => atualizar('aulasPraticasLecionadas', v)} />
        <CampoNota label="Faltas injustificadas" valor={form.faltasInjustificadas} onChange={(v) => atualizar('faltasInjustificadas', v)} />
        <CampoNota label="Faltas justificadas" valor={form.faltasJustificadas} onChange={(v) => atualizar('faltasJustificadas', v)} />
      </div>

      {resultado && (
        <div className={`cadeira-resultado cadeira-resultado--faltas cadeira-resultado--semaforo-${resultado.semaforo}`}>
          <p className="cadeira-resultado__explicacao">{resultado.explicacao}</p>
          {resultado.aviso && <p className="cadeira-resultado__aviso">💡 {resultado.aviso}</p>}
        </div>
      )}

      <button className="cadeira-btn-guardar" onClick={guardar} disabled={guardando}>
        {guardando ? 'A guardar...' : guardado ? '✓ Guardado' : 'Guardar faltas'}
      </button>
    </section>
  );
}

function CampoNota({ label, valor, onChange, max = 20 }) {
  return (
    <label className="campo-nota">
      <span className="campo-nota__label">{label}</span>
      <input
        className="campo-nota__input"
        type="number"
        min="0"
        max={max}
        step="1"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
      />
    </label>
  );
}
