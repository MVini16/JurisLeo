// definições — ela decide o que vê e como a app se comporta
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { limparCadeirasAntigas, repararCadeiras } from '../services/initFirestore.js';
import { exportarDadosComoFicheiro } from '../services/exportar.js';
import { useTheme } from '../context/useTheme.js';
import { useModulos } from '../hooks/useModulos.js';
import { MODULOS, CATEGORIAS_MODULOS, GRUPOS_FERRAMENTAS } from '../data/modulos.js';
import { WIDGETS } from '../data/widgets.js';
import { useEcra } from '../hooks/useEcra.js';

// os cartões antigos que passaram a widgets já não se ligam aqui
const MODULOS_QUE_SAO_WIDGETS = new Set(WIDGETS.map((w) => w.deModulo).filter(Boolean));
import { lerPreferencias, guardarPreferencia, aplicarPreferencias, OPCOES_ABERTURA, OPCOES_FRASES } from '../services/preferencias.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import { useBemEstar } from '../hooks/useBemEstar.js';
import { CAMPOS_OPCIONAIS, GRUPOS_OPCIONAIS } from '../data/bemEstar.js';
import './Definicoes.css';

function Interruptor({ ligado, onMudar, rotulo }) {
  return (
    <button type="button" role="switch" aria-checked={ligado} aria-label={rotulo} className={`def-switch ${ligado ? 'ligado' : ''}`} onClick={onMudar} />
  );
}

export default function Definicoes() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const { ativos, alternar, repor } = useModulos();
  const { repor: reporEcraInicio } = useEcra();
  const [widgetsRepostos, setWidgetsRepostos] = useState(false);

  function reporWidgets() {
    reporEcraInicio();
    setWidgetsRepostos(true);
    setTimeout(() => setWidgetsRepostos(false), 2500);
  }
  const { camposAtivos, alternarCampo } = useBemEstar();
  const [prefs, setPrefs] = useState(() => lerPreferencias());
  const [aExportar, setAExportar] = useState(false);
  const [aRepor, setARepor] = useState(false);
  const [reposto, setReposto] = useState(false);
  const [erroRepor, setErroRepor] = useState(false);
  const [ecraReposto, setEcraReposto] = useState(false);

  function escolher(chave, valor) {
    const novas = guardarPreferencia(chave, valor);
    setPrefs(novas);
    aplicarPreferencias(novas);
  }

  async function reporEcra() {
    await repor();
    setEcraReposto(true);
    setTimeout(() => setEcraReposto(false), 2500);
  }

  async function exportarDados() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    setAExportar(true);
    try {
      await exportarDadosComoFicheiro(userId);
    } finally {
      setAExportar(false);
    }
  }

  // volta a mostrar o tutorial do dashboard na próxima vez que lá entrar
  async function reverTutorial() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await setDoc(doc(db, 'users', userId, 'perfil', 'dados'), { tutorialFeito: false }, { merge: true });
    navigate('/dashboard');
  }

  // repara contas criadas antes da correção do seed para o 2.º ano — nunca apaga notas nem faltas
  async function reporCadeiras() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    setARepor(true);
    setErroRepor(false);
    try {
      await limparCadeirasAntigas(userId);
      await repararCadeiras(userId);
      setReposto(true);
    } catch {
      setErroRepor(true);
    } finally {
      setARepor(false);
    }
  }

  return (
    <div className="def-pagina">
      <BotaoVoltar destino="/perfil" texto="‹ Perfil" />
      <header className="def-header">
        <h1 className="def-titulo">Definições</h1>
        <p className="def-sub">Tu decides o que vês e como a app se comporta.</p>
      </header>

      {/* o teu ecrã: os widgets arrumam-se no próprio ecrã de início; aqui ficam só as opções que não são widgets */}
      <section className="def-seccao">
        <h2 className="def-seccao__titulo">{CATEGORIAS_MODULOS[0].nome}</h2>
        <p className="def-seccao__ajuda">Os widgets escolhem-se e arrumam-se no próprio ecrã: carrega sem largar num widget, ou toca em “Editar ecrã” no fim da página.</p>
        <div className="def-linha-botoes">
          <button type="button" className="def-btn" onClick={() => navigate('/dashboard')}>Editar o ecrã de início</button>
          <button type="button" className="def-btn" onClick={reporWidgets}>{widgetsRepostos ? '✓ Ecrã inicial reposto' : 'Repor o ecrã inicial'}</button>
        </div>
        {MODULOS.filter((m) => m.categoria === 'inicio' && !MODULOS_QUE_SAO_WIDGETS.has(m.id)).map((m) => (
          <div key={m.id} className="def-linha">
            <div className="def-texto"><b>{m.nome}</b><span>{m.descricao}</span></div>
            {m.fixo ? <span className="def-fixo">sempre visível</span> : <Interruptor ligado={ativos[m.id]} rotulo={m.nome} onMudar={() => alternar(m.id)} />}
          </div>
        ))}
      </section>

      <section className="def-seccao">
        <h2 className="def-seccao__titulo">{CATEGORIAS_MODULOS[1].nome}</h2>
        <p className="def-seccao__ajuda">Liga só o que vais usar. O que desligares deixa de aparecer no ecrã de início e nas ferramentas.</p>
        {GRUPOS_FERRAMENTAS.map((grupo) => (
          <div key={grupo} className="def-subgrupo">
            <b className="def-subgrupo__titulo">{grupo}</b>
            {MODULOS.filter((m) => m.categoria === 'ferramentas' && m.grupo === grupo).map((m) => (
              <div key={m.id} className="def-linha">
                <div className="def-texto"><b>{m.nome}</b><span>{m.descricao}</span></div>
                <Interruptor ligado={ativos[m.id]} rotulo={m.nome} onMudar={() => alternar(m.id)} />
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="def-seccao">
        <h2 className="def-seccao__titulo">{CATEGORIAS_MODULOS[2].nome}</h2>
        <p className="def-seccao__ajuda">Os atalhos que abrem quando tocas no +.</p>
        {MODULOS.filter((m) => m.categoria === 'atalhos').map((m) => (
          <div key={m.id} className="def-linha">
            <div className="def-texto"><b>{m.nome}</b></div>
            <Interruptor ligado={ativos[m.id]} rotulo={m.nome} onMudar={() => alternar(m.id)} />
          </div>
        ))}
        <button type="button" className="def-btn" onClick={reporEcra}>{ecraReposto ? '✓ Tudo como estava' : 'Repor o ecrã como estava'}</button>
      </section>

      {/* registo diário: só depois de ela ligar o cartão */}
      {ativos.bemEstar && (
      <section className="def-seccao">
        <h2 className="def-seccao__titulo">Registo diário</h2>
        <p className="def-seccao__ajuda">À noite podes contar mais do que o essencial. Liga só o que te apetecer: o Vini vê o que responderes.</p>
        {GRUPOS_OPCIONAIS.map((grupo) => (
          <div key={grupo} className="def-subgrupo">
            <b className="def-subgrupo__titulo">{grupo}</b>
            {CAMPOS_OPCIONAIS.filter((c) => c.grupo === grupo).map((c) => (
              <div key={c.id} className="def-linha">
                <div className="def-texto"><b>{c.pergunta}</b></div>
                <Interruptor ligado={camposAtivos.includes(c.id)} rotulo={c.pergunta} onMudar={() => alternarCampo(c.id)} />
              </div>
            ))}
          </div>
        ))}
      </section>
      )}

      {/* aparência */}
      <section className="def-seccao">
        <h2 className="def-seccao__titulo">Aparência</h2>
        <div className="def-linha">
          <div className="def-texto"><b>Tema escuro</b><span>Fundo escuro, mais confortável à noite.</span></div>
          <Interruptor ligado={darkMode} rotulo="Tema escuro" onMudar={toggleTheme} />
        </div>
        <div className="def-linha">
          <div className="def-texto"><b>Animações</b><span>Desliga se preferires a app mais parada.</span></div>
          <Interruptor ligado={prefs.animacoes === 'on'} rotulo="Animações" onMudar={() => escolher('animacoes', prefs.animacoes === 'on' ? 'off' : 'on')} />
        </div>
        <div className="def-grupo" role="radiogroup" aria-label="Abertura da app">
          <b className="def-grupo__titulo">Abertura da app</b>
          {OPCOES_ABERTURA.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={prefs.abertura === o.id}
              className={`def-opcao ${prefs.abertura === o.id ? 'ativa' : ''}`}
              onClick={() => escolher('abertura', o.id)}
            >
              <span className="def-opcao__marca" />
              <span className="def-texto"><b>{o.nome}</b><span>{o.descricao}</span></span>
            </button>
          ))}
        </div>
        <div className="def-grupo" role="radiogroup" aria-label="Frases no ecrã de início">
          <b className="def-grupo__titulo">Frases no ecrã de início</b>
          {OPCOES_FRASES.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={prefs.frases === o.id} className={`def-opcao ${prefs.frases === o.id ? 'ativa' : ''}`} onClick={() => escolher('frases', o.id)}>
              <span className="def-opcao__marca" />
              <span className="def-texto"><b>{o.nome}</b><span>{o.descricao}</span></span>
            </button>
          ))}
        </div>
        <div className="def-linha">
          <div className="def-texto"><b>Falas de séries e filmes</b><span>Suits, Legally Blonde... só falas curtas, com o autor por baixo. Os filósofos ficam sempre.</span></div>
          <Interruptor ligado={prefs.series === 'on'} rotulo="Falas de séries e filmes" onMudar={() => escolher('series', prefs.series === 'on' ? 'off' : 'on')} />
        </div>
        <p className="def-nota">Estas escolhas valem só neste aparelho.</p>
      </section>

      {/* ajuda */}
      <section className="def-seccao">
        <h2 className="def-seccao__titulo">Ajuda</h2>
        <button type="button" className="def-btn" onClick={reverTutorial}>Rever o tutorial</button>
        <button type="button" className="def-btn" onClick={() => navigate('/ajuda')}>Central de ajuda</button>
      </section>

      {/* dados */}
      <section className="def-seccao">
        <h2 className="def-seccao__titulo">Os teus dados</h2>
        <p className="def-seccao__ajuda">Descarrega uma cópia de segurança de tudo (cadeiras, notas, faltas, anotações, casos e mais) num ficheiro.</p>
        <button type="button" className="def-btn" onClick={exportarDados} disabled={aExportar}>{aExportar ? 'A preparar...' : '⬇ Exportar os meus dados'}</button>
      </section>

      <section className="def-seccao">
        <h2 className="def-seccao__titulo">Manutenção</h2>
        <p className="def-seccao__ajuda">Se esta conta ainda tem as cadeiras antigas do 1.º ano, repõe as 5 cadeiras reais do 2.º ano. As tuas notas e faltas ficam como estão.</p>
        <button type="button" className="def-btn" onClick={reporCadeiras} disabled={aRepor}>{aRepor ? 'A repor...' : reposto ? '✓ Cadeiras repostas' : 'Repor cadeiras do 2.º ano'}</button>
        {erroRepor && <p className="def-seccao__ajuda" role="alert">Não deu para repor agora. Confirma que tens internet e tenta outra vez.</p>}
      </section>
    </div>
  );
}
