// widgets do estudo: frequências, o que já fiz, flashcards, sequência, domínio, neste dia e leituras
import { Link } from 'react-router-dom';
import { contagemFrequencias, resumoDaSemana, dominioPorCadeira, dominioMedio, anotacaoDeHaUmMes } from '../../services/widgets.js';
import { minutosPorDia, sequenciaAtual, textoDuracao } from '../../services/estatisticasEstudo.js';
import { estaPronto } from '../../services/repeticaoEspacada.js';
import { dataCurta } from '../../services/datas.js';
import { calendarioS1, getCadeira, nomeCurtoCadeira } from '../../data/dadosLeonor.js';
import { useFlashcards } from '../../hooks/useFlashcards.js';
import { useSessoesEstudo } from '../../hooks/useSessoesEstudo.js';
import { useSumarios } from '../../hooks/useSumarios.js';
import { useAnotacoes } from '../../hooks/useAnotacoes.js';
import { useLeituras } from '../../hooks/useLeituras.js';
import NumeroAnimado from '../animacoes/NumeroAnimado.jsx';

const DIAS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

// anel que enche à medida que a prova se aproxima
function AnelProva({ fracao, children }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="ew-anel-grande">
      <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="48" cy="48" r={r} className="ew-anel__fundo" />
        <circle cx="48" cy="48" r={r} className="ew-anel__cheio" strokeDasharray={c} strokeDashoffset={c * (1 - fracao)} />
      </svg>
      <span className="ew-anel-grande__centro">{children}</span>
    </div>
  );
}

export function WidgetFrequencias({ tamanho, contexto }) {
  const conta = contagemFrequencias(contexto.eventos, calendarioS1.janelaFrequencias, contexto.agora);
  if (!conta) return null;
  const nome = conta.origem === 'janela' ? 'até à janela' : (conta.cadeira ? nomeCurtoCadeira(conta.cadeira) : conta.titulo);
  const dias = conta.dias === 0 ? 'hoje' : conta.dias === 1 ? 'dia' : 'dias';

  if (tamanho === 'largo') {
    return (
      <Link to="/frequencia" className="ew ew-frequencias ew-frequencias--largo">
        <AnelProva fracao={conta.fracao}>
          <b className="ew-num">{conta.dias === 0 ? '!' : <NumeroAnimado valor={conta.dias} />}</b>
          <small>{dias}</small>
        </AnelProva>
        <span>
          <span className="ew-rotulo">{conta.origem === 'janela' ? 'Frequências' : 'Próxima prova'}</span>
          <b className="ew-frequencias__titulo">{conta.origem === 'janela' ? 'A janela de frequências' : (conta.titulo || nome)}</b>
          <span className="ew-legenda">{dataCurta(conta.data)}</span>
        </span>
      </Link>
    );
  }
  return (
    <Link to="/frequencia" className="ew ew-frequencias">
      <span className="ew-rotulo">{conta.origem === 'janela' ? 'Frequências' : 'Próxima prova'}</span>
      <b className="ew-grande ew-num">{conta.dias === 0 ? 'Hoje' : <NumeroAnimado valor={conta.dias} />}{conta.dias > 0 && <small> {dias}</small>}</b>
      <div className="ew-barra"><i style={{ width: `${Math.round(conta.fracao * 100)}%` }} /></div>
      <span className="ew-legenda">{nome} · {dataCurta(conta.data).split(', ')[1]}</span>
    </Link>
  );
}

function BarrasSemana({ porDia, hojeIndice }) {
  const maximo = Math.max(30, ...porDia);
  return (
    <div className="ew-barras" aria-hidden="true">
      {porDia.map((m, i) => (
        <span key={i}>
          <i className={i === hojeIndice ? 'hoje' : ''} style={{ height: `${Math.max(4, (m / maximo) * 100)}%`, opacity: m ? 1 : 0.25 }} />
          <small>{DIAS[i]}</small>
        </span>
      ))}
    </div>
  );
}

export function WidgetOQueJaFiz({ tamanho, contexto }) {
  const { sessoes } = useSessoesEstudo();
  const { flashcards } = useFlashcards();
  const { sumarios } = useSumarios();
  const semana = resumoDaSemana({ sessoes, flashcards, sumarios }, contexto.agora);
  const horas = Math.round((semana.minutos / 60) * 10) / 10;

  if (tamanho === 'largo') {
    return (
      <Link to="/perfil" className="ew ew-feito">
        <span className="ew-rotulo">O que já fizeste esta semana</span>
        <span className="ew-feito__numeros">
          <span><b className="ew-num">{textoDuracao(semana.minutos)}</b><small>de estudo</small></span>
          <span><b className="ew-num"><NumeroAnimado valor={semana.cartoes} /></b><small>cartões</small></span>
          <span><b className="ew-num"><NumeroAnimado valor={semana.sumarios} /></b><small>sumários</small></span>
        </span>
        <BarrasSemana porDia={semana.porDia} hojeIndice={semana.hojeIndice} />
      </Link>
    );
  }
  return (
    <Link to="/perfil" className="ew ew-feito">
      <span className="ew-rotulo">Esta semana</span>
      <b className="ew-grande ew-num">{horas}<small> h</small></b>
      <BarrasSemana porDia={semana.porDia} hojeIndice={semana.hojeIndice} />
    </Link>
  );
}

export function WidgetFlashcards() {
  const { flashcards } = useFlashcards();
  const prontos = flashcards.filter((f) => estaPronto(f)).length;
  return (
    <Link to="/flashcards" className="ew">
      <span className="ew-rotulo">Flashcards</span>
      <b className="ew-grande ew-num"><NumeroAnimado valor={prontos} /></b>
      <span className="ew-legenda">{prontos === 0 ? 'tudo em dia ✓' : `para rever · ~${Math.max(1, Math.round(prontos / 2))} min`}</span>
    </Link>
  );
}

export function WidgetSequencia({ contexto }) {
  const { sessoes } = useSessoesEstudo();
  const mapa = minutosPorDia(sessoes);
  const { dias } = sequenciaAtual(mapa, contexto.agora);
  const semana = resumoDaSemana({ sessoes }, contexto.agora);
  return (
    <Link to="/perfil" className="ew ew-sequencia">
      <span className="ew-rotulo">Sequência</span>
      <b className="ew-grande ew-num"><NumeroAnimado valor={dias} /> <span aria-hidden="true">🔥</span></b>
      <span className="ew-pontos-semana" aria-label={`${semana.porDia.filter(Boolean).length} dias com estudo esta semana`}>
        {semana.porDia.map((m, i) => <i key={i} className={m ? 'on' : ''} />)}
      </span>
    </Link>
  );
}

export function WidgetDominio({ tamanho }) {
  const { flashcards } = useFlashcards();
  const porCadeira = dominioPorCadeira(flashcards);
  const media = dominioMedio(porCadeira);

  if (tamanho === 'pequeno') {
    return (
      <Link to="/flashcards" className="ew">
        <span className="ew-rotulo">Domínio</span>
        <b className="ew-grande ew-num">{media === null ? '—' : <><NumeroAnimado valor={media} />%</>}</b>
        <span className="ew-legenda">{media === null ? 'revê uns cartões primeiro' : 'média pelos teus cartões'}</span>
      </Link>
    );
  }
  return (
    <Link to="/flashcards" className="ew ew-dominio">
      <span className="ew-rotulo">Quanto dominas · pelos cartões</span>
      {porCadeira.length === 0 ? (
        <span className="ew-legenda">Quando reveres cartões, aparece aqui quanto dominas cada cadeira.</span>
      ) : (
        <span className="ew-dominio__linhas">
          {porCadeira.map((c) => (
            <span key={c.cadeiraId} className="ew-dominio__linha">
              <span>{nomeCurtoCadeira(c.cadeiraId)}</span>
              <span className="ew-dominio__barra"><i style={{ width: `${c.percentagem}%`, background: getCadeira(c.cadeiraId)?.cor }} /></span>
              <span className="ew-num">{c.percentagem}%</span>
            </span>
          ))}
        </span>
      )}
    </Link>
  );
}

export function WidgetNesteDia({ contexto }) {
  const { anotacoes } = useAnotacoes();
  const achada = anotacaoDeHaUmMes(anotacoes, contexto.agora);
  if (!achada) return null;
  return (
    <Link to={`/anotacoes/${achada.anotacao.id}`} className="ew ew-neste-dia">
      <span className="ew-rotulo">Há um mês</span>
      <b className="ew-neste-dia__titulo">“{achada.anotacao.titulo || 'Sem título'}”</b>
      <span className="ew-legenda">{nomeCurtoCadeira(achada.anotacao.cadeiraId)} · {dataCurta(achada.data).split(', ')[1]}</span>
    </Link>
  );
}

export function WidgetLeituras() {
  const { leituras } = useLeituras();
  const atual = leituras.find((l) => !l.totalPaginas || (l.paginaAtual || 0) < l.totalPaginas);
  if (!atual) return null;
  const pct = atual.totalPaginas ? Math.round(((atual.paginaAtual || 0) / atual.totalPaginas) * 100) : null;
  return (
    <Link to="/leituras" className="ew ew-leituras">
      <span className="ew-rotulo">A ler</span>
      <b className="ew-leituras__titulo">{atual.manual || 'Manual'}</b>
      {pct !== null && <div className="ew-barra"><i style={{ width: `${pct}%` }} /></div>}
      <span className="ew-legenda ew-num">p. {atual.paginaAtual || 0}{atual.totalPaginas ? ` de ${atual.totalPaginas}` : ''}</span>
    </Link>
  );
}
