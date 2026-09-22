// modo frequência: só a prova que vem aí, os dias que faltam e a matéria por rever. nada mais.
// a checklist tem dois modos, à escolha dela: os teus temas (escritos à mão) ou os sumários
// das aulas (automática, só para frequências de uma cadeira — guarda-se neste aparelho)
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFrequencia } from '../hooks/useFrequencia.js';
import { useFrase } from '../hooks/useFrase.js';
import { useSumariosCadeira } from '../hooks/useSumariosCadeira.js';
import { useRevisaoFrequencia } from '../hooks/useRevisaoFrequencia.js';
import { acrescentarTopico, alternarTopico, removerTopico, progressoChecklist, textoDosDias } from '../services/provas.js';
import { dataLimiteMateria, materiaAteData } from '../services/frequencia.js';
import { dataNatural } from '../services/datas.js';
import { getCadeira } from '../data/dadosLeonor.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import Carregando from '../components/animacoes/Carregando.jsx';
import NumeroAnimado from '../components/animacoes/NumeroAnimado.jsx';
import './Frequencia.css';

const CIRCUNFERENCIA = 2 * Math.PI * 45;
const DIAS_DO_ANEL = 30;
const CHAVE_MODO = 'jurisleo-frequencia-modo';

function Anel({ dias }) {
  // o anel enche à medida que a prova se aproxima; a partir de 30 dias está vazio
  const perto = 1 - Math.min(Math.max(dias, 0), DIAS_DO_ANEL) / DIAS_DO_ANEL;
  return (
    <div className="freq-anel">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="45" className="freq-anel__fundo" />
        <circle cx="50" cy="50" r="45" className="freq-anel__progresso" strokeDasharray={CIRCUNFERENCIA} strokeDashoffset={CIRCUNFERENCIA * (1 - perto)} />
      </svg>
      <div className="freq-anel__centro">
        <strong><NumeroAnimado valor={Math.max(dias, 0)} /></strong>
        <span>{dias === 1 ? 'dia' : 'dias'}</span>
      </div>
    </div>
  );
}

export default function Frequencia() {
  const navigate = useNavigate();
  const { prova, topicos, loading, guardarTopicos } = useFrequencia();
  const frase = useFrase('antesFrequencia');
  const [novo, setNovo] = useState('');

  // a escolha do modo da checklist é preferência deste aparelho, não sincroniza no firestore
  const [modo, setModo] = useState(() => {
    try { return localStorage.getItem(CHAVE_MODO) || 'manual'; } catch { return 'manual'; }
  });

  function escolherModo(m) {
    setModo(m);
    try { localStorage.setItem(CHAVE_MODO, m); } catch { /* sem localStorage, só não guarda a escolha */ }
  }

  if (loading) return <div className="freq-pagina"><Carregando texto="A carregar..." tipo="templo" /></div>;

  if (!prova) {
    return (
      <div className="freq-pagina">
        <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />
        <EstadoVazio titulo="Não tens frequências ou exames marcados." texto="Quando marcares uma no calendário, aparece aqui com os dias que faltam." acao={{ texto: 'Abrir o calendário', fn: () => navigate('/calendario') }} />
      </div>
    );
  }

  const cadeira = prova.cadeira ? getCadeira(prova.cadeira) : null;
  const progresso = progressoChecklist(topicos);
  // os sumários de aula só têm o corte de 6 dias definido para frequências (secção 6 do regulamento);
  // para exames o modo automático não se aplica, só a checklist manual
  const podeModoAutomatico = prova.tipo === 'frequencia' && !!prova.cadeira;
  const modoAtivo = podeModoAutomatico ? modo : 'manual';

  function acrescentar(e) {
    e.preventDefault();
    const novos = acrescentarTopico(topicos, novo);
    if (novos !== topicos) guardarTopicos(novos);
    setNovo('');
  }

  return (
    <div className="freq-pagina" style={cadeira ? { '--cor-cadeira': cadeira.cor } : undefined}>
      <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />

      <header className="freq-cabecalho">
        <p className="freq-tipo">{prova.tipo === 'exame' ? 'Exame' : 'Frequência'}{cadeira ? ` · ${cadeira.abrev}` : ''}</p>
        <h1 className="freq-titulo">{prova.titulo}</h1>
        <p className="freq-data">{dataNatural(prova.data)}{prova.horaInicio ? `, às ${prova.horaInicio}` : ''}</p>
      </header>

      <Anel dias={prova.diasRestantes} />
      <p className="freq-dias">{textoDosDias(prova.diasRestantes)}</p>
      {frase && <p className="freq-frase">{frase}</p>}

      {prova.cadeira && (
        <Link className="freq-baralho" to={`/flashcards?cadeira=${prova.cadeira}&baralho=1`}>
          🗂️ Rever o baralho de {cadeira?.abrev || 'cartões'}
        </Link>
      )}

      <section className="freq-materia">
        <div className="freq-materia__topo">
          <h2>A matéria</h2>
          {podeModoAutomatico && (
            <div className="freq-modo" role="group" aria-label="Como queres rever a matéria">
              <button type="button" className={modoAtivo === 'manual' ? 'ativo' : ''} onClick={() => escolherModo('manual')}>Os teus temas</button>
              <button type="button" className={modoAtivo === 'auto' ? 'ativo' : ''} onClick={() => escolherModo('auto')}>Sumários das aulas</button>
            </div>
          )}
        </div>

        {modoAtivo === 'auto' ? (
          <MateriaAutomatica prova={prova} />
        ) : (
          <MateriaManual
            topicos={topicos}
            progresso={progresso}
            novo={novo}
            setNovo={setNovo}
            acrescentar={acrescentar}
            guardarTopicos={guardarTopicos}
          />
        )}
      </section>
    </div>
  );
}

// checklist escrita à mão — funciona logo, sem depender de mais nada
function MateriaManual({ topicos, progresso, novo, setNovo, acrescentar, guardarTopicos }) {
  return (
    <>
      {progresso.total > 0 && (
        <div className="freq-progresso" role="progressbar" aria-valuenow={progresso.percentagem} aria-valuemin={0} aria-valuemax={100} aria-label="Matéria revista">
          <span style={{ transform: `scaleX(${progresso.percentagem / 100})` }} />
        </div>
      )}
      <p className="freq-nota">{progresso.total === 0 ? 'Escreve os temas que tens de rever e vai riscando.' : `${progresso.feitos} de ${progresso.total} revistos.`}</p>

      <ul className="freq-lista">
        {topicos.map((t, i) => (
          <li key={t.texto} className={t.feito ? 'feito' : ''}>
            <button type="button" className="freq-check" role="checkbox" aria-checked={t.feito} onClick={() => guardarTopicos(alternarTopico(topicos, i))}>
              <i aria-hidden="true">{t.feito ? '✓' : ''}</i>
              <span>{t.texto}</span>
            </button>
            <button type="button" className="freq-remover" aria-label={`Tirar ${t.texto}`} onClick={() => guardarTopicos(removerTopico(topicos, i))}>×</button>
          </li>
        ))}
      </ul>

      <form className="freq-novo" onSubmit={acrescentar}>
        <input type="text" value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="Um tema para rever" aria-label="Novo tema" />
        <button type="submit" disabled={!novo.trim()}>Acrescentar</button>
      </form>
    </>
  );
}

// checklist tirada dos sumários de aula que já registaste no Horário
function MateriaAutomatica({ prova }) {
  const limite = dataLimiteMateria(prova.data);
  const { sumarios } = useSumariosCadeira(prova.cadeira);
  const { marcados, alternar } = useRevisaoFrequencia(prova.cadeira);
  const pontos = materiaAteData(sumarios, prova.cadeira, limite);
  const revistos = pontos.filter((p) => marcados.includes(p.chave)).length;
  const percentagem = pontos.length === 0 ? 0 : Math.round((revistos / pontos.length) * 100);

  return (
    <>
      <p className="freq-nota">Matéria dada até {dataNatural(limite)}{pontos.length > 0 ? ` — ${revistos} de ${pontos.length} revistos.` : '.'}</p>

      {pontos.length === 0 ? (
        <p className="freq-vazio">Ainda não há sumários registados para esta cadeira. Vai ao Horário e regista o que deu em cada aula, para a matéria aparecer aqui.</p>
      ) : (
        <div className="freq-progresso" role="progressbar" aria-valuenow={percentagem} aria-valuemin={0} aria-valuemax={100} aria-label="Matéria revista">
          <span style={{ transform: `scaleX(${percentagem / 100})` }} />
        </div>
      )}

      <ul className="freq-lista">
        {pontos.map((ponto) => (
          <li key={ponto.chave} className={marcados.includes(ponto.chave) ? 'feito' : ''}>
            <button type="button" className="freq-check" role="checkbox" aria-checked={marcados.includes(ponto.chave)} onClick={() => alternar(ponto.chave)}>
              <i aria-hidden="true">{marcados.includes(ponto.chave) ? '✓' : ''}</i>
              <span>{ponto.texto}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
