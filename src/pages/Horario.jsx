// horário semanal: hoje no telemóvel, a semana toda no computador
// toque numa aula abre as ações rápidas; o botão "Editar horário" deixa adicionar, mover e apagar aulas
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/useTheme.js';
import { useAulasSemanais } from '../hooks/useAulasSemanais.js';
import { useEstadosAula } from '../hooks/useEstadosAula.js';
import { gerarOcorrencias, comEstados, paraMinutos } from '../services/ocorrencias.js';
import { chaveData, nomeFeriado } from '../data/feriados.js';
import { temposLetivos, getCadeira } from '../data/dadosLeonor.js';
import { ICONE_ESTADO_AULA as ICONE_ESTADO } from '../data/estadosAula.js';
import AcoesAula from '../components/AcoesAula.jsx';
import FormAulaHorario from '../components/FormAulaHorario.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import './Horario.css';

const DIAS = [
  { n: 1, label: 'Segunda', curto: 'Seg' },
  { n: 2, label: 'Terça', curto: 'Ter' },
  { n: 3, label: 'Quarta', curto: 'Qua' },
  { n: 4, label: 'Quinta', curto: 'Qui' },
  { n: 5, label: 'Sexta', curto: 'Sex' },
];

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function inicioDoDia(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// segunda-feira da semana de `base`, deslocada `offset` semanas
function segundaDaSemana(base, offset) {
  const r = inicioDoDia(base);
  const dia = r.getDay() === 0 ? 7 : r.getDay();
  r.setDate(r.getDate() - (dia - 1) + offset * 7);
  return r;
}

export default function Horario() {
  const { darkMode } = useTheme();
  const { aulas, loading, adicionar, atualizar, apagar, carregarHorarioInicial } = useAulasSemanais();
  const { estados, marcar } = useEstadosAula();

  const [agora, setAgora] = useState(new Date());
  // ao fim de semana mostra logo a semana que vem
  const [offset, setOffset] = useState(() => ([0, 6].includes(new Date().getDay()) ? 1 : 0));
  const [diaSel, setDiaSel] = useState(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d : 1;
  });
  const [selId, setSelId] = useState(null);
  const [editar, setEditar] = useState(false);
  const [form, setForm] = useState(null); // { aula } ou { inicial }
  const [aCarregar, setACarregar] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const segunda = segundaDaSemana(agora, offset);
  const diasDaSemana = DIAS.map((d, i) => {
    const data = new Date(segunda);
    data.setDate(segunda.getDate() + i);
    return { ...d, data, chave: chaveData(data), feriado: nomeFeriado(data) };
  });
  const chaveHoje = chaveData(agora);
  const hojeInicio = inicioDoDia(agora);

  const ocorrencias = useMemo(
    () => comEstados(aulas.flatMap((a) => gerarOcorrencias(a)), estados),
    [aulas, estados]
  );

  function aulasDoDia(chave) {
    return ocorrencias
      .filter((o) => chaveData(o.data) === chave)
      .sort((a, b) => paraMinutos(a.horaInicio) - paraMinutos(b.horaInicio));
  }

  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const emCurso = (o) => chaveData(o.data) === chaveHoje && minutosAgora >= paraMinutos(o.horaInicio) && minutosAgora < paraMinutos(o.horaFim);
  // aula que já passou e ninguém marcou como correu: convida a marcar
  const porMarcar = (o) => o.estadoAula === 'porMarcar'
    && (o.data < hojeInicio || (chaveData(o.data) === chaveHoje && minutosAgora >= paraMinutos(o.horaFim)));

  const selecionada = ocorrencias.find((o) => o.ocorrenciaId === selId) || null;

  function abrirAula(o) {
    if (editar) {
      const aula = aulas.find((a) => a.id === o.aulaId);
      if (aula) setForm({ aula });
    } else {
      setSelId(o.ocorrenciaId);
    }
  }

  async function aoCarregar() {
    setACarregar(true);
    try {
      await carregarHorarioInicial();
    } finally {
      setACarregar(false);
    }
  }

  async function guardarForm(dados) {
    if (form.aula) await atualizar(form.aula.id, dados);
    else await adicionar(dados);
    setForm(null);
  }

  const tituloSemana = `${diasDaSemana[0].data.getDate()} ${MESES_CURTOS[diasDaSemana[0].data.getMonth()]} – ${diasDaSemana[4].data.getDate()} ${MESES_CURTOS[diasDaSemana[4].data.getMonth()]}`;
  const diaAtual = diasDaSemana.find((d) => d.n === diaSel) || diasDaSemana[0];

  return (
    <div className={`horario-pagina ${darkMode ? 'dark' : ''}`}>
      <header className="horario-header">
        <div className="horario-header__linha">
          <div>
            <h1 className="horario-titulo">Horário</h1>
            <span className="horario-subtitulo">1.º semestre · Turma A, subturma 7</span>
          </div>
          <button className={`horario-btn-editar ${editar ? 'ativo' : ''}`} aria-pressed={editar} onClick={() => setEditar(!editar)}>
            {editar ? '✓ Feito' : '✏️ Editar horário'}
          </button>
        </div>

        <div className="horario-semana-nav">
          <button className="horario-nav-btn" onClick={() => setOffset(offset - 1)} aria-label="Semana anterior">‹</button>
          <span className="horario-semana-nav__titulo">{tituloSemana}</span>
          <button className="horario-nav-btn" onClick={() => setOffset(offset + 1)} aria-label="Semana seguinte">›</button>
          {offset !== 0 && <button className="horario-nav-hoje" onClick={() => setOffset(0)}>Hoje</button>}
        </div>
      </header>

      {!loading && aulas.length === 0 && (
        <EstadoVazio
          icone="📅"
          titulo="Ainda não tens o horário carregado"
          texto="Carrego-te o horário oficial da Turma A, subturma 7. Depois podes mudar o que quiseres."
          acao={{ texto: aCarregar ? 'A carregar...' : 'Carregar o meu horário', fn: aoCarregar }}
        />
      )}

      {aulas.length > 0 && (
        <>
          {/* telemóvel: um dia de cada vez, hoje por defeito */}
          <div className="horario-mobile">
            <div className="horario-dias" role="tablist" aria-label="Dias da semana">
              {diasDaSemana.map((d) => {
                const pendentes = aulasDoDia(d.chave).some(porMarcar);
                return (
                  <button
                    key={d.n}
                    role="tab"
                    aria-selected={d.n === diaSel}
                    className={`horario-dia-chip ${d.n === diaSel ? 'ativo' : ''} ${d.chave === chaveHoje ? 'hoje' : ''}`}
                    onClick={() => setDiaSel(d.n)}
                  >
                    <span>{d.curto}</span>
                    <strong>{d.data.getDate()}</strong>
                    {pendentes && <i className="horario-dia-chip__ponto" aria-label="aulas por marcar" />}
                  </button>
                );
              })}
            </div>

            <div className="horario-dia-lista">
              {diaAtual.feriado ? (
                <EstadoVazio icone="🎉" titulo={`Feriado — ${diaAtual.feriado}`} texto="Não há aulas hoje. Aproveita." />
              ) : aulasDoDia(diaAtual.chave).length === 0 ? (
                <EstadoVazio icone="🌤️" titulo="Sem aulas neste dia" texto="Nada no horário para este dia. Se for engano, toca em Editar horário." />
              ) : (
                aulasDoDia(diaAtual.chave).map((o) => (
                  <CartaoAula key={o.ocorrenciaId} o={o} emCurso={emCurso(o)} porMarcar={porMarcar(o)} editar={editar} grande onClick={() => abrirAula(o)} />
                ))
              )}
              {editar && (
                <button className="horario-add" onClick={() => setForm({ inicial: { diaSemana: diaAtual.n } })}>+ Adicionar aula</button>
              )}
            </div>
          </div>

          {/* computador: a semana toda */}
          <div className="horario-desktop">
            <div className="horario-grid">
              <div className="horario-grid__cabecalho">
                <div className="horario-grid__canto" />
                {diasDaSemana.map((d) => (
                  <div key={d.n} className={`horario-grid__dia ${d.chave === chaveHoje ? 'hoje' : ''}`}>
                    {d.label} {d.data.getDate()}
                    {d.feriado && <small className="horario-grid__feriado">{d.feriado}</small>}
                  </div>
                ))}
              </div>

              {temposLetivos.map((tempo) => (
                <div key={tempo.id} className="horario-grid__linha">
                  <div className="horario-grid__tempo">
                    <span className="horario-grid__hora">{tempo.inicio}</span>
                    <span className="horario-grid__hora-fim">{tempo.fim}</span>
                  </div>
                  {diasDaSemana.map((d) => {
                    const o = aulasDoDia(d.chave).find((x) => x.horaInicio === tempo.inicio);
                    return (
                      <div key={d.n} className={`horario-grid__celula ${d.chave === chaveHoje ? 'hoje' : ''}`}>
                        {o ? (
                          <CartaoAula o={o} emCurso={emCurso(o)} porMarcar={porMarcar(o)} editar={editar} onClick={() => abrirAula(o)} />
                        ) : editar && !d.feriado ? (
                          <button className="horario-celula-add" aria-label={`Adicionar aula ${d.label} ${tempo.inicio}`} onClick={() => setForm({ inicial: { diaSemana: d.n, horaInicio: tempo.inicio } })}>+</button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <p className="horario-nota">
        A semana está cheia — as únicas janelas de estudo são de manhã e depois das 18h.
      </p>

      {selecionada && <AcoesAula ocorrencia={selecionada} onMarcar={marcar} onFechar={() => setSelId(null)} />}
      {form && (
        <FormAulaHorario
          aula={form.aula}
          inicial={form.inicial}
          aulas={aulas}
          onGuardar={guardarForm}
          onApagar={async () => { await apagar(form.aula.id); setForm(null); }}
          onFechar={() => setForm(null)}
        />
      )}
    </div>
  );
}

function CartaoAula({ o, emCurso, porMarcar, editar, grande = false, onClick }) {
  const cadeira = getCadeira(o.cadeira);
  const tipo = o.tipoAula === 'pratica' ? 'Prática' : 'Teórica';

  return (
    <button
      className={`horario-aula horario-aula--${o.tipoAula} ${emCurso ? 'em-curso' : ''} ${grande ? 'horario-aula--grande' : ''} ${o.estadoAula === 'cancelada' || o.estadoAula === 'stotFaltou' ? 'horario-aula--sem-aula' : ''}`}
      style={{ '--cor': cadeira?.cor }}
      onClick={onClick}
      aria-label={`${cadeira?.abrev || o.titulo}, ${tipo}, ${o.horaInicio}. Toca para abrir.`}
    >
      {grande && <span className="horario-aula__horas">{o.horaInicio}<br />{o.horaFim}</span>}
      <span className="horario-aula__texto">
        <span className="horario-aula__abrev">{cadeira?.abrev || o.titulo}</span>
        <span className="horario-aula__tipo">{tipo}</span>
        <span className="horario-aula__sala">{o.sala}{o.docente ? ` · ${o.docente}` : ''}</span>
      </span>
      <span className="horario-aula__estado">
        {editar ? '✏️' : ICONE_ESTADO[o.estadoAula] || (porMarcar ? <i className="horario-aula__pendente" aria-label="por marcar" /> : '')}
      </span>
    </button>
  );
}
