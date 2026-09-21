// dashboard principal da jurisleo
import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'
import { useTheme } from '../context/useTheme.js'
import { useDashboard } from '../hooks/useDashboard.js'
import { useTarefas } from '../hooks/useTarefas.js'
import { coresCadeiras, nomeCurtoCadeira } from '../data/dadosLeonor.js'
import Tutorial from '../components/Tutorial.jsx'
import CartaoAulaAgora from '../components/CartaoAulaAgora.jsx'
import PerguntaFimDoDia from '../components/PerguntaFimDoDia.jsx'
import { useFraseDoDia } from '../hooks/useFraseDoDia.js'
import { useModulos } from '../hooks/useModulos.js'
import { MODULOS } from '../data/modulos.js'
import Esqueleto from '../components/animacoes/Esqueleto.jsx'

// cores por cadeira — usadas nos dots das aulas
const CORES_CADEIRA = coresCadeiras;

// de madrugada o tom muda — o resto do dia usa o banco geral
function getContextoFrase() {
  const hora = new Date().getHours();
  return (hora >= 23 || hora < 6) ? 'madrugada' : 'geral';
}

function getSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 19) return 'Boa tarde';
  return 'Boa noite';
}

// devolve o primeiro nome apenas — ex: "Leonor Maria" → "Leonor"
function getPrimeiroNome(nomeCompleto) {
  return nomeCompleto?.split(' ')[0] || 'Leonor';
}

function Dashboard() {
  const { darkMode, toggleTheme } = useTheme();

  // dados reais do firestore
  const {
    nome,
    aulasHoje,
    proximaFrequencia,
    diasParaFrequencia,
    dataFrequenciaFormatada,
    loading,
    tutorialFeito,
    definirTutorialFeito,
    marcarAula,
  } = useDashboard();

  const frase = useFraseDoDia(getContextoFrase());

  // o que ela escolheu ver, e por que ordem
  const { ativos, ordem, carregado: carregadoModulos } = useModulos();

  const { tarefas } = useTarefas();
  const tarefasPendentes = tarefas
    .filter((t) => !t.concluida)
    .sort((a, b) => {
      if (!a.prazo) return 1;
      if (!b.prazo) return -1;
      return a.prazo.localeCompare(b.prazo);
    });

  // controla as animações de entrada
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisivel(true), 50);
    return () => clearTimeout(t);
  }, []);

  // calcula o anel de countdown
  // usa os dias reais se houver frequência, senão mostra anel vazio
  const diasParaMostrar = diasParaFrequencia ?? 0;
  const percentagem = Math.min((diasParaMostrar / 30) * 100, 100);
  const circunferencia = 2 * Math.PI * 45;
  const offset = circunferencia - (percentagem / 100) * circunferencia;

  // cada cartão do ecrã de início; a ordem e o que aparece vêm das escolhas dela
  const ferramentasLigadas = MODULOS.filter((m) => m.categoria === 'ferramentas' && ativos[m.id]);
  const cartoes = {
    ferramentas: (
      <div className="card anim-entrada" style={{ '--delay': '0.5s' }}>
        <div className="card-header">
          <span className="card-icon">🧰</span>
          <span className="card-titulo">As tuas ferramentas</span>
        </div>
        {ferramentasLigadas.length === 0 ? (
          <p className="card-vazio">Não tens ferramentas ligadas. Liga as que quiseres em Definições.</p>
        ) : (
          <div className="dash-ferr">
            {ferramentasLigadas.slice(0, 6).map((m) => <Link key={m.id} to={m.rota} className="dash-ferr__chip">{m.nome}</Link>)}
            <Link to="/ferramentas" className="dash-ferr__chip dash-ferr__chip--todas">Ver todas</Link>
          </div>
        )}
      </div>
    ),
    aulaAgora: (
      <>
              {/* aula a decorrer e a seguir — o que ela mais consulta entre as 14h e as 18h */}
              <CartaoAulaAgora aulasHoje={aulasHoje} />

              {/* ao fim da tarde, pergunta se as aulas correram todas */}
              <PerguntaFimDoDia aulasHoje={aulasHoje} onMarcar={marcarAula} />
      </>
    ),
    proximaFrequencia: (
      <>
              {/* card countdown — próxima frequência */}
              <div className="card card-countdown anim-entrada" style={{ '--delay': '0.2s' }}>
                <div className="card-header">
                  <span className="card-icon">⚖️</span>
                  <span className="card-titulo">Próxima Frequência</span>
                </div>

                {/* se não houver frequência no calendário mostra mensagem */}
                {!proximaFrequencia ? (
                  <div className="countdown-vazio">
                    <p>Nenhuma frequência marcada no calendário.</p>
                    <span>Adiciona uma no 📅 Calendário</span>
                  </div>
                ) : (
                  <div className="countdown-conteudo">
                    {/* anel svg animado */}
                    <div className="countdown-anel">
                      <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" className="anel-fundo" />
                        <circle
                          cx="50" cy="50" r="45"
                          className="anel-progresso"
                          strokeDasharray={circunferencia}
                          strokeDashoffset={offset}
                        />
                      </svg>
                      <div className="countdown-centro">
                        <span className="countdown-numero">{diasParaMostrar}</span>
                        <span className="countdown-unidade">dias</span>
                      </div>
                    </div>
                    <div className="countdown-info">
                      {/* nome da cadeira da frequência */}
                      <p className="countdown-cadeira">
                        {proximaFrequencia.cadeira ? nomeCurtoCadeira(proximaFrequencia.cadeira) : proximaFrequencia.titulo}
                      </p>
                      <p className="countdown-data">{dataFrequenciaFormatada}</p>
                      <div className="countdown-barra-container">
                        <div className="countdown-barra" style={{ width: `${percentagem}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
      </>
    ),
    aulasHoje: (
      <>
              {/* card aulas de hoje */}
              <div className="card card-aulas anim-entrada" style={{ '--delay': '0.3s' }}>
                <div className="card-header">
                  <span className="card-icon">📚</span>
                  <span className="card-titulo">Aulas de Hoje</span>
                  {aulasHoje.length > 0 && (
                    <span className="card-badge">{aulasHoje.length}</span>
                  )}
                </div>

                {/* sem aulas hoje */}
                {aulasHoje.length === 0 ? (
                  <p className="card-vazio">
                    {loading ? <Esqueleto linhas={2} /> : 'Sem aulas hoje 🎉'}
                  </p>
                ) : (
                  <ul className="lista-aulas">
                    {aulasHoje.map((aula, i) => (
                      <li key={i} className="aula-item">
                        <span
                          className="aula-dot"
                          style={{ background: CORES_CADEIRA[aula.cadeira] || '#b8963e' }}
                        />
                        <span className="aula-hora">{aula.horaInicio}</span>
                        <span className="aula-cadeira">{aula.titulo || nomeCurtoCadeira(aula.cadeira)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
      </>
    ),
    tarefasPendentes: (
      <>
              {/* card tarefas — pendentes reais, mais próximas do prazo primeiro */}
              <div className="card card-tarefas anim-entrada" style={{ '--delay': '0.4s' }}>
                <div className="card-header">
                  <span className="card-icon">✅</span>
                  <span className="card-titulo">Tarefas Pendentes</span>
                  {tarefasPendentes.length > 0 && (
                    <span className="card-badge">{tarefasPendentes.length}</span>
                  )}
                </div>

                {tarefasPendentes.length === 0 ? (
                  <p className="card-vazio">Nada pendente. Boa! 🎉</p>
                ) : (
                  <ul className="lista-tarefas">
                    {tarefasPendentes.slice(0, 4).map((t) => (
                      <li key={t.id} className="tarefa-item">
                        <span className="tarefa-checkbox" />
                        <div className="tarefa-info">
                          <span className="tarefa-texto">{t.titulo}</span>
                          {t.cadeira && (
                            <span className="tarefa-cadeira" style={{ color: CORES_CADEIRA[t.cadeira] || '#b8963e' }}>
                              {nomeCurtoCadeira(t.cadeira)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
      </>
    ),
  };

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''} ${visivel ? 'visivel' : ''}`}>

      {/* fundo decorativo */}
      <div className="dashboard-bg" />

      {/* barra do topo */}
      <header className="dashboard-header anim-entrada" style={{ '--delay': '0s' }}>
        <div className="header-esquerda">
          <span className="dashboard-logo">JurisLeo</span>
          <span className="dashboard-subtitulo">Faculdade de Direito · UL</span>
        </div>

        {/* toggle de tema */}
        <button
          className="theme-toggle"
          role="switch"
          aria-checked={darkMode}
          aria-label={darkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          onClick={toggleTheme}
        >
          <div className="theme-toggle__container">
            <div className="theme-toggle__clouds" />
            <div className="theme-toggle__stars">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor" />
              </svg>
            </div>
            <div className="theme-toggle__sun">
              <div className="theme-toggle__moon-mask">
                <div className="theme-toggle__crater" />
                <div className="theme-toggle__crater" />
                <div className="theme-toggle__crater" />
              </div>
            </div>
          </div>
        </button>
      </header>

      {/* conteúdo principal */}
      <main className="dashboard-main">

        {/* saudação */}
        <section className="dashboard-greeting anim-entrada" style={{ '--delay': '0.1s' }}>
          <p className="saudacao-label">{getSaudacao()}</p>
          <h1 className="saudacao-nome">
            {/* mostra o primeiro nome enquanto carrega, atualiza quando o firestore responde */}
            {getPrimeiroNome(nome)} <span className="saudacao-emoji">👋</span>
          </h1>
          {ativos.fraseDoDia && frase && (
            <p className="frase-do-dia">
              "{frase.texto}"
              {frase.pt && <span className="frase-do-dia__pt">{frase.pt}</span>}
              {frase.legenda && <span className="frase-do-dia__fonte">— {frase.legenda}</span>}
            </p>
          )}
        </section>

        {/* grelha de cards */}
        <div className="dashboard-grid">
          {/* só depois de ler as escolhas dela, para os cartões não piscarem */}
          {carregadoModulos && ordem.filter((id) => ativos[id]).map((id) => <Fragment key={id}>{cartoes[id]}</Fragment>)}
        </div>
      </main>

      {tutorialFeito === false && (
        <Tutorial onTerminar={() => definirTutorialFeito(true)} />
      )}
    </div>
  );
}

export default Dashboard;