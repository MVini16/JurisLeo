// ecrã de início da jurisleo — widgets que ela escolhe, arruma e muda de tamanho, como no iphone
// o que aparece e por que ordem vive em configuracoes/dados.ecra (hooks/useEcra.js)
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { useTheme } from '../context/useTheme.js';
import { useDashboard } from '../hooks/useDashboard.js';
import { useEcra } from '../hooks/useEcra.js';
import { useModulos } from '../hooks/useModulos.js';
import { useFraseDoDia } from '../hooks/useFraseDoDia.js';
import { useBemEstar } from '../hooks/useBemEstar.js';
import { estaEmBaixo, valoresDoDia } from '../services/bemEstar.js';
import { juntarWidget, mudarEstrutura } from '../services/ecra.js';
import { dataCurta } from '../services/datas.js';
import { chaveData } from '../data/feriados.js';
import { ESTRUTURAS } from '../data/widgets.js';
import GrelhaEcra from '../components/ecra/GrelhaEcra.jsx';
import GaleriaWidgets from '../components/ecra/GaleriaWidgets.jsx';
import Tutorial from '../components/Tutorial.jsx';
import Esqueleto from '../components/animacoes/Esqueleto.jsx';

// de madrugada o tom das frases muda
function contextoFrase(hora) {
  return hora >= 23 || hora < 6 ? 'madrugada' : 'geral';
}

function saudacao(hora) {
  if (hora < 12) return 'Bom dia';
  if (hora < 19) return 'Boa tarde';
  return 'Boa noite';
}

function Dashboard() {
  const { darkMode, toggleTheme } = useTheme();
  const { nome, eventos, aulasHoje, loading, tutorialFeito, definirTutorialFeito, marcarAula } = useDashboard();
  const { ecra, carregado, gravar, repor } = useEcra();
  const { ativos } = useModulos();
  const { registos } = useBemEstar();

  // o relógio do ecrã: a aula de agora e os minutos que faltam mudam sozinhos
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 30000);
    const aoVoltar = () => { if (document.visibilityState === 'visible') setAgora(new Date()); };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', aoVoltar); };
  }, []);

  const frase = useFraseDoDia(contextoFrase(agora.getHours()));
  // num dia em baixo a lista de tarefas aligeira (só as duas mais urgentes)
  const emBaixo = estaEmBaixo(valoresDoDia(registos[chaveData(agora)]));

  const [emEdicao, setEmEdicao] = useState(false);
  const [galeriaAberta, setGaleriaAberta] = useState(false);
  const [guardadoVisivel, setGuardadoVisivel] = useState(false);
  const comFlip = useRef(null);

  function terminarEdicao() {
    setEmEdicao(false);
    setGaleriaAberta(false);
    setGuardadoVisivel(true);
  }
  useEffect(() => {
    if (!guardadoVisivel) return;
    const t = setTimeout(() => setGuardadoVisivel(false), 1800);
    return () => clearTimeout(t);
  }, [guardadoVisivel]);

  // mudanças feitas fora da grelha (juntar, estrutura) também animam com flip
  const mudar = (novo) => (comFlip.current ? comFlip.current(novo) : gravar(novo));

  const primeiroNome = nome?.split(' ')[0] || 'Leonor';
  const contexto = { aulasHoje, eventos, agora, marcarAula, emBaixo };

  return (
    <div className={`dashboard ecra ${darkMode ? 'dark' : ''}`}>
      <div className="ecra-aurora" aria-hidden="true" />

      <header className="ecra-cabecalho">
        <div className="ecra-cabecalho__texto">
          <span className="ecra-data">{dataCurta(agora)}</span>
          <h1 className="ecra-saudacao">{saudacao(agora.getHours())}, <em>{primeiroNome}</em></h1>
          <span className="ecra-guardado" aria-live="polite">{guardadoVisivel ? '✓ Guardado' : ''}</span>
        </div>
        {!emEdicao && (
          <div className="ecra-cabecalho__botoes">
            <button type="button" className="ecra-redondo" onClick={toggleTheme} aria-label={darkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <Link to="/perfil" className="ecra-redondo ecra-avatar" aria-label="Perfil">{primeiroNome[0]}</Link>
          </div>
        )}
      </header>

      {emEdicao && (
        <div className="ecra-barra-edicao">
          <button type="button" className="ecra-pilula" onClick={() => setGaleriaAberta(true)} aria-label="Adicionar widget">＋</button>
          <div className="ecra-estruturas" role="radiogroup" aria-label="Estrutura da página">
            {ESTRUTURAS.map((e) => (
              <button key={e.id} type="button" role="radio" aria-checked={ecra.estrutura === e.id} className={ecra.estrutura === e.id ? 'on' : ''} onClick={() => mudar(mudarEstrutura(ecra, e.id))}>
                {e.nome}
              </button>
            ))}
          </div>
          <button type="button" className="ecra-pilula ecra-pilula--ok" onClick={terminarEdicao}>OK</button>
        </div>
      )}

      <main className="ecra-principal">
        {!carregado || loading ? (
          <div className="ecra-esqueleto"><Esqueleto linhas={6} /></div>
        ) : (
          <GrelhaEcra
            ecra={ecra}
            onMudar={gravar}
            contexto={contexto}
            emEdicao={emEdicao}
            onEntrarEdicao={() => setEmEdicao(true)}
            comFlipRef={comFlip}
          />
        )}

        {carregado && ecra.widgets.length === 0 && !emEdicao && (
          <p className="ecra-vazio">O teu ecrã está vazio. Toca em “Editar ecrã” para pores widgets.</p>
        )}

        <div className="ecra-rodape">
          {emEdicao ? (
            <p className="ecra-dica">Arrasta para mudar a ordem · − tira · o botão dourado muda o tamanho</p>
          ) : (
            <>
              <p className="ecra-dica">Carrega sem largar num widget para editar o ecrã</p>
              <button type="button" className="ecra-pilula" onClick={() => setEmEdicao(true)}>Editar ecrã</button>
            </>
          )}
          {ativos.fraseDoDia && frase && !emEdicao && (
            <p className="ecra-frase">
              “{frase.texto}”
              {frase.pt && <span>{frase.pt}</span>}
              {frase.legenda && <span>— {frase.legenda}</span>}
            </p>
          )}
        </div>
      </main>

      {galeriaAberta && (
        <GaleriaWidgets
          ecra={ecra}
          onJuntar={(id) => mudar(juntarWidget(ecra, id))}
          onRepor={repor}
          onFechar={() => setGaleriaAberta(false)}
        />
      )}

      {tutorialFeito === false && <Tutorial onTerminar={() => definirTutorialFeito(true)} />}
    </div>
  );
}

export default Dashboard;
