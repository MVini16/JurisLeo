// página principal do calendário
import { useState, useRef, useEffect, useMemo } from 'react';
import { db } from '../services/firebase.js';
import { getAuth } from 'firebase/auth';
import { useCalendario } from '../hooks/useCalendario.js';
import ModalCriarEvento from '../components/ModalCriarEvento.jsx';
import BotoesEstadoAula from '../components/BotoesEstadoAula.jsx';
import { ICONE_ESTADO_AULA } from '../data/estadosAula.js';
import { nomeCurtoCadeira } from '../data/dadosLeonor.js';
import { FAMILIAS, corDoEvento, familiaDoEvento } from '../data/familias.js';
import { nomeFeriado } from '../data/feriados.js';
import { epocasDoDia } from '../data/calendarioEscolar.js';
import './Calendario.css';
import './CalendarioExtra.css';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_SEMANA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// selo do estado da aula (fui, faltei...) ao lado do título
function selo(ev) {
  const icone = ICONE_ESTADO_AULA[ev.estadoAula];
  return icone ? ` ${icone}` : '';
}

const ICONES_TIPO = {
  aula:       '📚',
  frequencia: '⚡',
  oral:       '🎤',
  entrega:    '📝',
  outro:      '📌',
};

export default function Calendario() {
  const { eventos: todosOsEventos, loading, marcar } = useCalendario();
  // filtro por família: todas ligadas por defeito
  const [familiasAtivas, setFamiliasAtivas] = useState(FAMILIAS.map((f) => f.id));
  const eventos = useMemo(
    () => todosOsEventos.filter((ev) => familiasAtivas.includes(familiaDoEvento(ev))),
    [todosOsEventos, familiasAtivas]
  );

  function alternarFamilia(id) {
    setFamiliasAtivas((atuais) => (atuais.includes(id) ? atuais.filter((f) => f !== id) : [...atuais, id]));
  }
  const hoje = new Date();
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [vista, setVista] = useState('diaria');
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [painelDia, setPainelDia] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [detalheBase, setEventoDetalhe] = useState(null);
  // mantém o detalhe sempre com o estado mais recente (ex.: acabei de marcar "fui")
  const eventoDetalhe = detalheBase ? (eventos.find((e) => e.chave === detalheBase.chave) || detalheBase) : null;
  const [eventoEditar, setEventoEditar] = useState(null);

  function eventosDoDia(data) {
    return eventos.filter((ev) => {
      const dataEv = ev.data instanceof Date ? ev.data : ev.data?.toDate?.();
      if (!dataEv) return false;
      return (
        dataEv.getDate() === data.getDate() &&
        dataEv.getMonth() === data.getMonth() &&
        dataEv.getFullYear() === data.getFullYear()
      );
    }).sort((a, b) => a.horaInicio?.localeCompare(b.horaInicio));
  }

  function mesmoDia(a, b) {
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  }

  function navegar(direcao) {
    if (vista === 'diaria') {
      const nova = new Date(dataSelecionada);
      nova.setDate(nova.getDate() + direcao);
      setDataSelecionada(nova);
    } else if (vista === 'semanal') {
      const nova = new Date(dataSelecionada);
      nova.setDate(nova.getDate() + direcao * 7);
      setDataSelecionada(nova);
    } else if (vista === 'mensal' || vista === 'lista') {
      let novoMes = mesAtual + direcao;
      let novoAno = anoAtual;
      if (novoMes > 11) { novoMes = 0; novoAno++; }
      if (novoMes < 0)  { novoMes = 11; novoAno--; }
      setMesAtual(novoMes);
      setAnoAtual(novoAno);
    }
  }

  function irParaHoje() {
    const h = new Date();
    setDataSelecionada(h);
    setMesAtual(h.getMonth());
    setAnoAtual(h.getFullYear());
  }

  function tituloHeader() {
    if (vista === 'diaria') return `${DIAS_SEMANA[dataSelecionada.getDay()]}, ${dataSelecionada.getDate()} de ${MESES[dataSelecionada.getMonth()]}`;
    if (vista === 'mensal' || vista === 'lista') return `${MESES[mesAtual]} ${anoAtual}`;
    if (vista === 'semanal') return `Semana de ${dataSelecionada.getDate()} de ${MESES[dataSelecionada.getMonth()]}`;
  }

  function clicarDiaMensal(data) {
    setDataSelecionada(data);
    setPainelDia(data);
  }

  function irParaVistaDiaria(data) {
    setDataSelecionada(data);
    setVista('diaria');
    setPainelDia(null);
  }

  if (loading) return <div className="cal-loading">A carregar calendário...</div>;

  return (
    <div className="cal-wrapper">

      {/* header desktop */}
      <div className="cal-header">
        <div className="cal-header__nav">
          <button className="cal-btn-nav" onClick={() => navegar(-1)}>‹</button>
          <h2 className="cal-header__titulo">{tituloHeader()}</h2>
          <button className="cal-btn-nav" onClick={() => navegar(1)}>›</button>
        </div>
        <div className="cal-header__controlos">
          <button className="cal-btn-hoje" onClick={irParaHoje}>Hoje</button>
          <div className="cal-vistas">
            {['diaria', 'semanal', 'mensal', 'lista'].map((v) => (
              <button key={v} className={`cal-vista-btn ${vista === v ? 'ativo' : ''}`} onClick={() => { setVista(v); setPainelDia(null); }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button className="cal-btn-add" onClick={() => setModalAberto(true)}>+ Evento</button>
        </div>
      </div>

      {/* header mobile */}
      <div className="cal-header-mobile">
        <div className="cal-header-mobile__topo">
          <button className="cal-btn-nav-mobile" onClick={() => navegar(-1)}>‹</button>
          <h2 className="cal-header-mobile__titulo">{tituloHeader()}</h2>
          <button className="cal-btn-nav-mobile" onClick={() => navegar(1)}>›</button>
          <button className="cal-btn-hoje-mobile" onClick={irParaHoje}>Hoje</button>
        </div>
        <div className="cal-tabs-mobile">
          {[
            { key: 'diaria',  label: 'Dia',    icon: '☀️' },
            { key: 'semanal', label: 'Semana', icon: '📅' },
            { key: 'mensal',  label: 'Mês',    icon: '🗓️' },
            { key: 'lista',   label: 'Lista',  icon: '📋' },
          ].map((v) => (
            <button key={v.key} className={`cal-tab-mobile ${vista === v.key ? 'ativo' : ''}`} onClick={() => { setVista(v.key); setPainelDia(null); }}>
              <span className="cal-tab-mobile__icon">{v.icon}</span>
              <span className="cal-tab-mobile__label">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* aviso discreto sobre as datas das épocas de exames */}
      <p className="cal-aviso-epocas">As datas das épocas de exames são indicativas — confirma sempre no site da faculdade.</p>

      {/* filtro por família: um só calendário, com cores e filtro */}
      <div className="cal-familias" role="group" aria-label="Filtrar por família de eventos">
        {FAMILIAS.map((f) => (
          <button
            key={f.id}
            className={`cal-familia-chip ${familiasAtivas.includes(f.id) ? 'ativo' : ''}`}
            style={{ '--cor': f.cor }}
            aria-pressed={familiasAtivas.includes(f.id)}
            onClick={() => alternarFamilia(f.id)}
          >
            <span className="cal-familia-chip__ponto" />
            {f.nome}
          </button>
        ))}
      </div>

      {/* conteúdo */}
      <div className="cal-conteudo">

        {vista === 'diaria' && (
          <VistaDiaria data={dataSelecionada} eventos={eventosDoDia(dataSelecionada)} onEventoClick={setEventoDetalhe} ICONES_TIPO={ICONES_TIPO} />
        )}

        {vista === 'semanal' && (
          <VistaSemanal
            data={dataSelecionada}
            eventos={eventos}
            eventosDoDia={eventosDoDia}
            onDiaClick={(d) => { setDataSelecionada(d); setVista('diaria'); }}
            onEventoClick={setEventoDetalhe}
            onDataChange={setDataSelecionada}
            ICONES_TIPO={ICONES_TIPO}
           
            hoje={hoje}
            mesmoDia={mesmoDia}
            DIAS_SEMANA_CURTO={DIAS_SEMANA_CURTO}
          />
        )}

        {vista === 'mensal' && (
          <div className="cal-mensal-wrapper">
            <VistaMensal mes={mesAtual} ano={anoAtual} eventos={eventos} eventosDoDia={eventosDoDia} onDiaClick={clicarDiaMensal} diaSelecionado={painelDia} hoje={hoje} mesmoDia={mesmoDia} ICONES_TIPO={ICONES_TIPO} />
            {painelDia && (
              <PainelDia data={painelDia} eventos={eventosDoDia(painelDia)} onIrParaDia={irParaVistaDiaria} onFechar={() => setPainelDia(null)} onEventoClick={setEventoDetalhe} ICONES_TIPO={ICONES_TIPO} MESES={MESES} DIAS_SEMANA={DIAS_SEMANA} />
            )}
          </div>
        )}

        {vista === 'lista' && (
          <VistaLista eventos={eventos} mes={mesAtual} ano={anoAtual} onEventoClick={setEventoDetalhe} ICONES_TIPO={ICONES_TIPO} MESES={MESES} DIAS_SEMANA={DIAS_SEMANA} />
        )}

      </div>

      {/* bottom sheet mobile — vista mensal */}
      {painelDia && (
        <BottomSheet data={painelDia} eventos={eventosDoDia(painelDia)} onIrParaDia={irParaVistaDiaria} onFechar={() => setPainelDia(null)} onEventoClick={setEventoDetalhe} ICONES_TIPO={ICONES_TIPO} MESES={MESES} DIAS_SEMANA={DIAS_SEMANA} />
      )}

      {/* fab mobile */}
      <button className="cal-fab" onClick={() => setModalAberto(true)}>
        <span className="cal-fab__icone">+</span>
      </button>

      {modalAberto && <ModalCriarEvento onFechar={() => setModalAberto(false)} dataInicial={dataSelecionada} eventos={todosOsEventos} />}
      {eventoDetalhe && <ModalEvento evento={eventoDetalhe} onMarcar={marcar} onFechar={() => setEventoDetalhe(null)} onEditar={(ev) => { setEventoDetalhe(null); setEventoEditar(ev); }} onApagar={() => setEventoDetalhe(null)} ICONES_TIPO={ICONES_TIPO} MESES={MESES} DIAS_SEMANA={DIAS_SEMANA} />}
      {eventoEditar && <ModalCriarEvento onFechar={() => setEventoEditar(null)} dataInicial={dataSelecionada} eventoExistente={eventoEditar} eventos={todosOsEventos} />}

    </div>
  );
}

// ------------------------------------------------------------------
// vista diária
// ------------------------------------------------------------------
function VistaDiaria({ data, eventos, onEventoClick, ICONES_TIPO }) {
  const horas = Array.from({ length: 15 }, (_, i) => i + 8);
  const [modoMobile, setModoMobile] = useState('resumo');

  function eventosNaHora(hora) {
    return eventos.filter((ev) => ev.horaInicio && parseInt(ev.horaInicio.split(':')[0]) === hora);
  }

  return (
    <div className="cal-diaria">
      <div className="cal-diaria__toggle-mobile">
        <button className={`cal-diaria__toggle-btn ${modoMobile === 'resumo' ? 'ativo' : ''}`} onClick={() => setModoMobile('resumo')}>📋 Resumo</button>
        <button className={`cal-diaria__toggle-btn ${modoMobile === 'timeline' ? 'ativo' : ''}`} onClick={() => setModoMobile('timeline')}>⏱️ Timeline</button>
      </div>

      <div className={`cal-diaria__sidebar ${modoMobile === 'timeline' ? 'mobile-oculto' : ''}`}>
        <div className="cal-diaria__sidebar-data">
          <span className="cal-diaria__sidebar-dia">{data.getDate()}</span>
          <span className="cal-diaria__sidebar-mes">{['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][data.getMonth()]}</span>
          {nomeFeriado(data) && <span className="cal-diaria__sidebar-feriado">🎌 {nomeFeriado(data)}</span>}
        </div>
        <div className="cal-diaria__sidebar-eventos">
          <p className="cal-diaria__sidebar-titulo">Hoje tens</p>
          {eventos.length === 0 && <p className="cal-diaria__sidebar-vazio">Dia livre! 🎉</p>}
          {eventos.map((ev) => (
            <div key={ev.id} className="cal-diaria__sidebar-item" style={{ borderLeftColor: corDoEvento(ev) }} onClick={() => onEventoClick(ev)}>
              <span className="cal-diaria__sidebar-item-hora">{ev.horaInicio}</span>
              <span className="cal-diaria__sidebar-item-nome">{ICONES_TIPO[ev.tipo] || '📌'} {ev.titulo}{selo(ev)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`cal-diaria__timeline ${modoMobile === 'resumo' ? 'mobile-oculto' : ''}`}>
        {horas.map((hora) => (
          <div key={hora} className="cal-diaria__hora">
            <span className="cal-diaria__hora-label">{String(hora).padStart(2, '0')}:00</span>
            <div className="cal-diaria__hora-slot">
              {eventosNaHora(hora).map((ev) => (
                <div key={ev.id} className="cal-diaria__evento" style={{ backgroundColor: corDoEvento(ev) }} onClick={() => onEventoClick(ev)}>
                  <span className="cal-diaria__evento-icone">{ICONES_TIPO[ev.tipo] || '📌'}</span>
                  <div className="cal-diaria__evento-info">
                    <span className="cal-diaria__evento-titulo">{ev.titulo}{selo(ev)}</span>
                    <span className="cal-diaria__evento-hora">{ev.horaInicio} – {ev.horaFim}</span>
                  </div>
                  {ev.importancia === 'alta' && <span className="cal-diaria__evento-badge">!</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// vista semanal
// desktop: grelha 7 dias | mobile: scroll snap dia a dia
// ------------------------------------------------------------------
function VistaSemanal({ data, eventosDoDia, onDiaClick, onEventoClick, onDataChange, ICONES_TIPO, hoje, mesmoDia, DIAS_SEMANA_CURTO }) {
  const isMobile = window.innerWidth <= 768;
  const scrollRef = useRef(null);
  const timerRef = useRef(null);
  const horas = Array.from({ length: 15 }, (_, i) => i + 8);

  // calcula os 7 dias da semana (segunda a domingo) a partir de uma data
  function diasDaSemana(dataBase) {
    const dias = [];
    const inicio = new Date(dataBase);
    const diaSemana = inicio.getDay() === 0 ? 6 : inicio.getDay() - 1;
    inicio.setDate(inicio.getDate() - diaSemana);
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      dias.push(d);
    }
    return dias;
  }

  const dias = diasDaSemana(data);

  // quando o scroll para, descobre qual dia está visível e atualiza
  function aoPararScroll() {
    if (!scrollRef.current) return;
    const largura = scrollRef.current.offsetWidth;
    if (largura === 0) return;
    const indice = Math.round(scrollRef.current.scrollLeft / largura);
    if (dias[indice] && !mesmoDia(dias[indice], data)) {
      onDataChange(new Date(dias[indice]));
    }
  }

  function onScroll() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(aoPararScroll, 120);
  }

  // posiciona o scroll no dia selecionado quando monta ou muda a data
  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;
    const indice = dias.findIndex(d => mesmoDia(d, data));
    if (indice >= 0) {
      const largura = scrollRef.current.offsetWidth;
      scrollRef.current.scrollLeft = indice * largura;
    }
  }, [data]);

  // ── desktop: grelha 7 colunas ──
  if (!isMobile) {
    return (
      <div className="cal-semanal">
        <div className="cal-semanal__header">
          <div className="cal-semanal__header-vazio" />
          {dias.map((d, i) => (
            <div key={i} className={`cal-semanal__header-dia ${mesmoDia(d, hoje) ? 'hoje' : ''}`} onClick={() => onDiaClick(d)}>
              <span className="cal-semanal__header-dia-nome">{DIAS_SEMANA_CURTO[d.getDay()]}</span>
              <span className="cal-semanal__header-dia-num">{d.getDate()}</span>
            </div>
          ))}
        </div>
        <div className="cal-semanal__body">
          {horas.map((hora) => (
            <div key={hora} className="cal-semanal__row">
              <span className="cal-semanal__hora-label">{String(hora).padStart(2, '0')}:00</span>
              {dias.map((d, i) => {
                const evs = eventosDoDia(d).filter(ev => ev.horaInicio && parseInt(ev.horaInicio.split(':')[0]) === hora);
                return (
                  <div key={i} className={`cal-semanal__cel ${mesmoDia(d, hoje) ? 'hoje' : ''}`}>
                    {evs.map((ev) => (
                      <div key={ev.id} className="cal-semanal__evento" style={{ backgroundColor: corDoEvento(ev) }} onClick={() => onEventoClick(ev)}>
                        <span>{ICONES_TIPO[ev.tipo] || '📌'} {ev.titulo}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── mobile: scroll snap dia a dia ──
  return (
    <div className="cal-semanal-mobile">

      {/* header com os 7 dias — clicável para saltar para o dia */}
      <div className="cal-semanal-mobile__header">
        {dias.map((d, i) => (
          <button
            key={i}
            className={`cal-semanal-mobile__dia-btn ${mesmoDia(d, hoje) ? 'hoje' : ''} ${mesmoDia(d, data) ? 'ativo' : ''}`}
            onClick={() => {
              onDataChange(new Date(d));
              if (scrollRef.current) {
                scrollRef.current.scrollLeft = i * scrollRef.current.offsetWidth;
              }
            }}
          >
            <span className="cal-semanal-mobile__dia-nome">{DIAS_SEMANA_CURTO[d.getDay()]}</span>
            <span className="cal-semanal-mobile__dia-num">{d.getDate()}</span>
            {/* ponto dourado se tiver eventos */}
            {eventosDoDia(d).length > 0 && <span className="cal-semanal-mobile__dia-ponto" />}
          </button>
        ))}
      </div>

      {/* área de scroll — cada página é um dia */}
      <div className="cal-semanal-mobile__scroll" ref={scrollRef} onScroll={onScroll}>
        {dias.map((d, i) => (
          <div key={i} className="cal-semanal-mobile__pagina">
            <div className="cal-semanal-mobile__timeline">
              {horas.map((hora) => {
                const evs = eventosDoDia(d).filter(ev => ev.horaInicio && parseInt(ev.horaInicio.split(':')[0]) === hora);
                return (
                  <div key={hora} className="cal-semanal-mobile__hora">
                    <span className="cal-semanal-mobile__hora-label">{String(hora).padStart(2, '0')}:00</span>
                    <div className="cal-semanal-mobile__hora-slot">
                      {evs.map((ev) => (
                        <div key={ev.id} className="cal-semanal-mobile__evento" style={{ backgroundColor: corDoEvento(ev) }} onClick={() => onEventoClick(ev)}>
                          <span className="cal-semanal-mobile__evento-icone">{ICONES_TIPO[ev.tipo] || '📌'}</span>
                          <div className="cal-semanal-mobile__evento-info">
                            <span className="cal-semanal-mobile__evento-titulo">{ev.titulo}</span>
                            <span className="cal-semanal-mobile__evento-hora">{ev.horaInicio} – {ev.horaFim}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// ------------------------------------------------------------------
// vista mensal
// ------------------------------------------------------------------
function VistaMensal({ mes, ano, eventosDoDia, onDiaClick, diaSelecionado, hoje, mesmoDia, ICONES_TIPO }) {
  function gerarGrid() {
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    const grid = [];
    const inicioOffset = primeiroDia === 0 ? 6 : primeiroDia - 1;
    for (let i = inicioOffset - 1; i >= 0; i--) grid.push({ data: new Date(ano, mes - 1, diasMesAnterior - i), outroMes: true });
    for (let i = 1; i <= diasNoMes; i++) grid.push({ data: new Date(ano, mes, i), outroMes: false });
    const resto = 42 - grid.length;
    for (let i = 1; i <= resto; i++) grid.push({ data: new Date(ano, mes + 1, i), outroMes: true });
    return grid;
  }

  const grid = gerarGrid();

  return (
    <div className="cal-mensal">
      <div className="cal-mensal__cabecalho">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
          <div key={d} className="cal-mensal__cabecalho-dia">{d}</div>
        ))}
      </div>
      <div className="cal-mensal__grid">
        {grid.map(({ data, outroMes }, i) => {
          const evsDia = eventosDoDia(data);
          const isHoje = mesmoDia(data, hoje);
          const isSelecionado = diaSelecionado && mesmoDia(data, diaSelecionado);
          const barras = evsDia.slice(0, 2);
          const pontosExtra = evsDia.length > 2 ? evsDia.slice(2) : [];
          const feriado = nomeFeriado(data);
          const epocas = epocasDoDia(data);
          return (
            <div
              key={i}
              className={`cal-mensal__dia ${outroMes ? 'outro-mes' : ''} ${isHoje ? 'hoje' : ''} ${isSelecionado ? 'selecionado' : ''} ${epocas.length ? 'cal-mensal__dia--epoca' : ''}`}
              title={epocas.map((e) => e.nome).join(' · ') || undefined}
              onClick={() => onDiaClick(data)}
            >
              <span className="cal-mensal__dia-num">{data.getDate()}</span>
              {feriado && <span className="cal-mensal__dia-feriado" title={feriado}>{feriado}</span>}
              <div className="cal-mensal__dia-eventos">
                {barras.map((ev) => (
                  <div key={ev.id} className="cal-mensal__dia-barra" style={{ backgroundColor: corDoEvento(ev) }} title={ev.titulo}>
                    <span className="cal-mensal__dia-barra-icone">{ICONES_TIPO[ev.tipo] || '📌'}</span>
                    <span className="cal-mensal__dia-barra-nome">{ev.titulo}</span>
                  </div>
                ))}
                {pontosExtra.length > 0 && (
                  <div className="cal-mensal__dia-pontos">
                    {pontosExtra.map((ev) => <span key={ev.id} className="cal-mensal__dia-ponto" style={{ backgroundColor: corDoEvento(ev) }} title={ev.titulo} />)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// painel lateral — desktop only
// ------------------------------------------------------------------
function PainelDia({ data, eventos, onIrParaDia, onFechar, onEventoClick, ICONES_TIPO, MESES, DIAS_SEMANA }) {
  return (
    <div className="cal-painel">
      <div className="cal-painel__header">
        <div>
          <p className="cal-painel__dia-semana">{DIAS_SEMANA[data.getDay()]}</p>
          <p className="cal-painel__data">{data.getDate()} de {MESES[data.getMonth()]}</p>
        </div>
        <div className="cal-painel__acoes">
          <button className="cal-btn-hoje" onClick={() => onIrParaDia(data)}>Ver dia</button>
          <button className="cal-painel__fechar" onClick={onFechar}>✕</button>
        </div>
      </div>
      <div className="cal-painel__eventos">
        {eventos.length === 0 && <p className="cal-diaria__sidebar-vazio">Dia livre! 🎉</p>}
        {eventos.map((ev) => (
          <div key={ev.id} className="cal-painel__evento" style={{ borderLeftColor: corDoEvento(ev) }} onClick={() => onEventoClick(ev)}>
            <div className="cal-painel__evento-topo">
              <span className="cal-painel__evento-icone">{ICONES_TIPO[ev.tipo] || '📌'}</span>
              <span className="cal-painel__evento-titulo">{ev.titulo}{selo(ev)}</span>
              {ev.importancia === 'alta' && <span className="cal-painel__evento-importante">!</span>}
            </div>
            <span className="cal-painel__evento-hora">{ev.horaInicio} – {ev.horaFim}</span>
            {ev.notas && <span className="cal-painel__evento-notas">{ev.notas}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// bottom sheet mobile
// ------------------------------------------------------------------
function BottomSheet({ data, eventos, onIrParaDia, onFechar, onEventoClick, ICONES_TIPO, MESES, DIAS_SEMANA }) {
  const sheetRef = useRef(null);
  const startY = useRef(null);
  const deltaY = useRef(0);

  function onTouchStart(e) {
    startY.current = e.touches[0].clientY;
    deltaY.current = 0;
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
  }

  function onTouchMove(e) {
    const delta = e.touches[0].clientY - startY.current;
    deltaY.current = delta;
    if (delta > 0 && sheetRef.current) sheetRef.current.style.transform = `translateY(${delta}px)`;
  }

  function onTouchEnd() {
    if (!sheetRef.current) return;
    if (deltaY.current > 100) {
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      sheetRef.current.style.transform = 'translateY(100%)';
      setTimeout(onFechar, 300);
    } else {
      sheetRef.current.style.transition = 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)';
      sheetRef.current.style.transform = 'translateY(0)';
    }
    deltaY.current = 0;
  }

  return (
    <div className="cal-bottom-sheet-overlay" onClick={onFechar}>
      <div className="cal-bottom-sheet" ref={sheetRef} onClick={(e) => e.stopPropagation()} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className="cal-bottom-sheet__handle" />
        <div className="cal-bottom-sheet__header">
          <div>
            <p className="cal-bottom-sheet__dia-semana">{DIAS_SEMANA[data.getDay()]}</p>
            <p className="cal-bottom-sheet__data">{data.getDate()} de {MESES[data.getMonth()]}</p>
          </div>
          <button className="cal-btn-hoje" onClick={() => onIrParaDia(data)}>Ver dia</button>
        </div>
        <div className="cal-bottom-sheet__eventos">
          {eventos.length === 0 && <p className="cal-diaria__sidebar-vazio" style={{ textAlign: 'center', padding: '24px 0' }}>Dia livre! 🎉</p>}
          {eventos.map((ev) => (
            <div key={ev.id} className="cal-bottom-sheet__evento" style={{ borderLeftColor: corDoEvento(ev) }} onClick={() => { onEventoClick(ev); onFechar(); }}>
              <div className="cal-bottom-sheet__evento-topo">
                <span>{ICONES_TIPO[ev.tipo] || '📌'}</span>
                <span className="cal-bottom-sheet__evento-titulo">{ev.titulo}{selo(ev)}</span>
                {ev.importancia === 'alta' && <span className="cal-painel__evento-importante">!</span>}
              </div>
              <span className="cal-painel__evento-hora">{ev.horaInicio} – {ev.horaFim}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// vista lista
// ------------------------------------------------------------------
function VistaLista({ eventos, mes, ano, onEventoClick, ICONES_TIPO, MESES, DIAS_SEMANA }) {
  const eventosMes = eventos
    .filter((ev) => { const d = ev.data instanceof Date ? ev.data : ev.data?.toDate?.(); return d && d.getMonth() === mes && d.getFullYear() === ano; })
    .sort((a, b) => { const da = a.data instanceof Date ? a.data : a.data?.toDate?.(); const db_ = b.data instanceof Date ? b.data : b.data?.toDate?.(); return da - db_; });

  const grupos = {};
  eventosMes.forEach((ev) => {
    const d = ev.data instanceof Date ? ev.data : ev.data?.toDate?.();
    const chave = d.toDateString();
    if (!grupos[chave]) grupos[chave] = { data: d, eventos: [] };
    grupos[chave].eventos.push(ev);
  });

  return (
    <div className="cal-lista">
      {Object.keys(grupos).length === 0 && <p className="cal-placeholder">Sem eventos em {MESES[mes]} 📭</p>}
      {Object.values(grupos).map((grupo, i) => (
        <div key={i} className="cal-lista__grupo">
          <div className="cal-lista__grupo-header">
            <span className="cal-lista__grupo-dia">{grupo.data.getDate()}</span>
            <div>
              <p className="cal-lista__grupo-semana">{DIAS_SEMANA[grupo.data.getDay()]}</p>
              <p className="cal-lista__grupo-mes">{MESES[grupo.data.getMonth()]}</p>
            </div>
          </div>
          <div className="cal-lista__grupo-eventos">
            {grupo.eventos.map((ev) => (
              <div key={ev.id} className="cal-lista__evento" style={{ borderLeftColor: corDoEvento(ev) }} onClick={() => onEventoClick(ev)}>
                <span className="cal-lista__evento-icone">{ICONES_TIPO[ev.tipo] || '📌'}</span>
                <div className="cal-lista__evento-info">
                  <span className="cal-lista__evento-titulo">{ev.titulo}{selo(ev)}</span>
                  <span className="cal-lista__evento-hora">{ev.horaInicio} – {ev.horaFim}</span>
                  {ev.notas && <span className="cal-lista__evento-notas">{ev.notas}</span>}
                </div>
                {ev.importancia === 'alta' && <span className="cal-lista__evento-badge">!</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------
// modal de detalhes do evento
// ------------------------------------------------------------------
function ModalEvento({ evento, onMarcar, onFechar, onEditar, onApagar, ICONES_TIPO, MESES, DIAS_SEMANA }) {
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);
  const [apagando, setApagando] = useState(false);
  const data = evento.data instanceof Date ? evento.data : evento.data?.toDate?.();
  const cor = corDoEvento(evento);

  async function apagarEvento() {
    setApagando(true);
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', userId, 'eventos', evento.id));
      onApagar();
    } catch { setApagando(false); }
  }

  return (
    <div className="cal-modal-overlay" onClick={onFechar}>
      <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cal-modal__topo" style={{ backgroundColor: cor }}>
          <span className="cal-modal__icone">{ICONES_TIPO[evento.tipo] || '📌'}</span>
          <button className="cal-modal__fechar" onClick={onFechar}>✕</button>
        </div>
        <div className="cal-modal__corpo">
          <h3 className="cal-modal__titulo">{evento.titulo}</h3>
          {data && <div className="cal-modal__linha"><span className="cal-modal__label">📅 Data</span><span>{DIAS_SEMANA[data.getDay()]}, {data.getDate()} de {MESES[data.getMonth()]}</span></div>}
          {evento.horaInicio && <div className="cal-modal__linha"><span className="cal-modal__label">🕐 Hora</span><span>{evento.horaInicio} – {evento.horaFim}</span></div>}
          {evento.cadeira && <div className="cal-modal__linha"><span className="cal-modal__label">📚 Cadeira</span><span style={{ color: cor, fontWeight: 600 }}>{nomeCurtoCadeira(evento.cadeira)}</span></div>}
          {evento.tipo && <div className="cal-modal__linha"><span className="cal-modal__label">🏷️ Tipo</span><span style={{ textTransform: 'capitalize' }}>{evento.tipo}</span></div>}
          {evento.importancia && <div className="cal-modal__linha"><span className="cal-modal__label">⚡ Importância</span><span className={`cal-modal__importancia ${evento.importancia}`}>{evento.importancia.charAt(0).toUpperCase() + evento.importancia.slice(1)}</span></div>}
          {evento.estado && <div className="cal-modal__linha"><span className="cal-modal__label">✅ Estado</span><span style={{ textTransform: 'capitalize' }}>{evento.estado}</span></div>}
          {evento.notas && <div className="cal-modal__notas"><span className="cal-modal__label">📝 Notas</span><p>{evento.notas}</p></div>}
          {/* aulas do horário: marca como correu (não se editam aqui, mudam-se no Horário) */}
          {evento.repetido && (
            <div className="cal-modal__estado-aula">
              <span className="cal-modal__label">Como correu?</span>
              <BotoesEstadoAula estado={evento.estadoAula} onEscolher={(estado) => onMarcar(evento, estado)} />
              {evento.tipoAula === 'pratica' && <p className="cal-modal__estado-nota">Só as faltas às aulas práticas contam para o limite.</p>}
            </div>
          )}
          {!evento.repetido && (
          <div className="cal-modal__acoes">
            {!confirmandoApagar ? (
              <>
                <button className="cal-modal__btn-editar" onClick={() => onEditar(evento)}>✏️ Editar</button>
                <button className="cal-modal__btn-apagar" onClick={() => setConfirmandoApagar(true)}>🗑️ Apagar</button>
              </>
            ) : (
              <div className="cal-modal__confirmar">
                <p>Tens a certeza que queres apagar este evento?</p>
                <div className="cal-modal__confirmar-btns">
                  <button className="cal-modal__btn-cancelar" onClick={() => setConfirmandoApagar(false)}>Cancelar</button>
                  <button className="cal-modal__btn-confirmar" onClick={apagarEvento} disabled={apagando}>{apagando ? 'A apagar...' : 'Apagar'}</button>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}