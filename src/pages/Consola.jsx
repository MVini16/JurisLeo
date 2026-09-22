// consola do Vini — só leitura. rota /consola, sem link em lado nenhum.
// se a Leonor (ou qualquer outra conta) chegar aqui, volta em silêncio para o início
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { login, logout, entrarComGoogle } from '../services/auth.js';
import { useAcessoAdmin, useDadosDela } from '../hooks/useConsola.js';
import { UID_DA_LEONOR } from '../data/consola.js';
import { resumirDados, triagem } from '../services/consola.js';
import { textoDuracao } from '../services/estatisticasEstudo.js';
import {
  TAMANHO_PIN, pinValido, criarCredencial, verificarPin, lerCredencial, guardarCredencial,
  lerBloqueio, guardarBloqueio, estaBloqueado, minutosDeBloqueio, aposTentativaErrada, estadoInicialBloqueio, sessaoExpirada,
} from '../services/pin.js';
import Carregando from '../components/animacoes/Carregando.jsx';
import GraficoBemEstar from '../components/GraficoBemEstar.jsx';
import './Consola.css';

const ROTULO_ESTADO = {
  aprovada: 'Aprovada',
  admitidaEscrito: 'Vai a escrito',
  admitidaOral: 'Vai a oral',
  excluida: 'Excluída',
  passaMetodoB: 'Método B',
  semDados: 'Sem dados',
};

const ROTULO_SEMAFORO = { verde: 'Faltas em ordem', amarelo: 'Faltas a chegar ao limite', vermelho: 'Faltas no limite' };

// mensagens simples para os erros de entrada mais comuns
function mensagemDeErro(erro) {
  const e = String(erro || '');
  if (e.includes('operation-not-allowed')) return 'O login com Google ainda não está ativo no Firebase. Usa o email e a palavra-passe, ou ativa o Google (docs/CONSOLA.md).';
  if (e.includes('popup-closed') || e.includes('cancelled-popup')) return '';
  if (e.includes('invalid-credential') || e.includes('wrong-password') || e.includes('user-not-found') || e.includes('invalid-email')) return 'Email ou palavra-passe errados.';
  if (e.includes('too-many-requests')) return 'Demasiadas tentativas. Espera um bocado.';
  return 'Não consegui entrar. Tenta outra vez.';
}

// entrada própria da consola: quem escreve /admin no endereço não passa pelo login da app
function EntrarAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [aEntrar, setAEntrar] = useState(false);

  async function comGoogle() {
    setErro('');
    setAEntrar(true);
    const r = await entrarComGoogle();
    setAEntrar(false);
    if (!r.sucesso) setErro(mensagemDeErro(r.erro));
  }

  async function comEmail(e) {
    e.preventDefault();
    setErro('');
    setAEntrar(true);
    const r = await login(email.trim(), password);
    setAEntrar(false);
    if (!r.sucesso) setErro(mensagemDeErro(r.erro));
  }

  return (
    <div className="co-pin">
      <h1>Consola</h1>
      <p>Entra com a tua conta.</p>
      <button type="button" className="co-botao co-botao--principal co-largo" onClick={comGoogle} disabled={aEntrar}>Entrar com Google</button>
      <p className="co-ou">ou</p>
      <form className="co-form" onSubmit={comEmail}>
        <input className="co-campo" type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
        <input className="co-campo" type="password" autoComplete="current-password" placeholder="Palavra-passe" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Palavra-passe" />
        <button type="submit" className="co-botao co-largo" disabled={aEntrar || !email || !password}>Entrar com email</button>
      </form>
      {erro && <p className="co-erro" role="alert">{erro}</p>}
    </div>
  );
}

function Cartao({ titulo, children }) {
  return (
    <details className="co-cartao">
      <summary>{titulo}</summary>
      <div className="co-cartao__corpo">{children}</div>
    </details>
  );
}

function PedirPin({ credencial, onAberto, onDefinida }) {
  const [pin, setPin] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [bloqueio, setBloqueio] = useState(() => lerBloqueio(localStorage));
  const definir = !credencial;
  const bloqueado = estaBloqueado(bloqueio);

  async function submeter(e) {
    e.preventDefault();
    setErro('');
    if (!pinValido(pin)) { setErro(`O PIN tem ${TAMANHO_PIN} dígitos.`); return; }

    if (definir) {
      if (pin !== confirmar) { setErro('Os dois PIN não são iguais.'); return; }
      const nova = await criarCredencial(pin);
      guardarCredencial(localStorage, nova);
      onDefinida(nova);
      onAberto();
      return;
    }

    if (bloqueado) return;
    if (await verificarPin(pin, credencial)) {
      guardarBloqueio(localStorage, estadoInicialBloqueio());
      onAberto();
      return;
    }
    const novo = aposTentativaErrada(bloqueio);
    guardarBloqueio(localStorage, novo);
    setBloqueio(novo);
    setPin('');
    setErro(estaBloqueado(novo) ? 'PIN errado três vezes. Bloqueado durante uma hora.' : 'PIN errado.');
  }

  return (
    <form className="co-pin" onSubmit={submeter}>
      <h1>Consola</h1>
      <p>{definir ? `Define um PIN de ${TAMANHO_PIN} dígitos. Fica só neste aparelho.` : 'Introduz o PIN.'}</p>
      {bloqueado ? (
        <p className="co-erro" role="alert">Bloqueado. Tenta daqui a {minutosDeBloqueio(bloqueio)} min.</p>
      ) : (
        <>
          <input className="co-pin__campo" type="password" inputMode="numeric" autoComplete="off" maxLength={TAMANHO_PIN} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} aria-label="PIN" autoFocus />
          {definir && <input className="co-pin__campo" type="password" inputMode="numeric" autoComplete="off" maxLength={TAMANHO_PIN} value={confirmar} onChange={(e) => setConfirmar(e.target.value.replace(/\D/g, ''))} aria-label="Repete o PIN" placeholder="Repete o PIN" />}
          <button type="submit" className="co-botao co-botao--principal">{definir ? 'Guardar PIN' : 'Entrar'}</button>
        </>
      )}
      {erro && <p className="co-erro" role="alert">{erro}</p>}
      {!definir && <p className="co-nota">Se te esqueceres do PIN, limpa os dados do site neste aparelho e define outro.</p>}
    </form>
  );
}

function Conteudo({ onBloquear }) {
  const { dados, loading, erro, lidoEm, carregar } = useDadosDela(true);
  const resumo = useMemo(() => (dados ? resumirDados(dados, new Date()) : null), [dados]);
  const aviso = useMemo(() => (resumo ? triagem(resumo) : []), [resumo]);

  return (
    <div className="co-pagina">
      <header className="co-cabecalho">
        <h1>Consola</h1>
        <div className="co-acoes">
          <button type="button" className="co-botao" onClick={carregar} disabled={loading}>{loading ? 'A ler...' : 'Atualizar'}</button>
          <button type="button" className="co-botao" onClick={onBloquear}>Bloquear</button>
        </div>
      </header>

      {erro === 'permissao' && (
        <div className="co-cartao co-cartao--aviso" role="alert">
          <p><b>Sem permissão para ler os dados dela.</b> As regras do Firestore ainda não foram publicadas com a tua conta de administrador. Ver docs/CONSOLA.md.</p>
        </div>
      )}
      {erro === 'falhou' && <p className="co-erro" role="alert">Não consegui ler os dados. Tenta atualizar.</p>}
      {loading && !resumo && <Carregando texto="A ler os dados dela..." />}

      {resumo && (
        <>
          <section className="co-bloco">
            <h2>Como ela está</h2>
            {resumo.bemEstar.temRegistos ? (
              <>
                <GraficoBemEstar serie={resumo.bemEstar.serie} />
                <p className="co-nota">{resumo.bemEstar.sequencia > 0 ? `Contou como está ${resumo.bemEstar.sequencia} ${resumo.bemEstar.sequencia === 1 ? 'dia seguido' : 'dias seguidos'}.` : 'Hoje ainda não contou.'}</p>
                {resumo.bemEstar.texto && (
                  <blockquote className="co-texto">
                    <p>{resumo.bemEstar.texto.texto}</p>
                    <footer>{resumo.bemEstar.texto.data}</footer>
                  </blockquote>
                )}
              </>
            ) : (
              <p className="co-nota">Ainda não registou nenhum dia. Quando o fizer, aparece aqui primeiro.</p>
            )}
          </section>

          <section className="co-bloco">
            <h2>O que precisa de ti</h2>
            {aviso.length === 0 ? (
              <p className="co-frase">Está tudo bem.</p>
            ) : (
              <>
                <p className="co-frase">{aviso.length === 1 ? 'Uma coisa a precisar de ti.' : `${aviso.length} coisas a precisar de ti.`}</p>
                <ul className="co-lista">
                  {aviso.map((a) => (
                    <li key={a.id} className={`co-item co-item--${a.severidade}`}>
                      <b>{a.titulo}</b>
                      {a.detalhe && <span>{a.detalhe}</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <Cartao titulo="Cadeiras">
            <ul className="co-lista">
              {resumo.cadeiras.map((c) => (
                <li key={c.id} className="co-cadeira">
                  <b>{c.abrev}</b>
                  <span>{c.avaliacao ? (ROTULO_ESTADO[c.avaliacao.estado] || c.avaliacao.estado) : 'Sem notas'}{c.avaliacao?.notaFinal != null ? ` · ${c.avaliacao.notaFinal}` : ''}</span>
                  {c.faltas && <span className={`co-semaforo co-semaforo--${c.faltas.semaforo}`}>{ROTULO_SEMAFORO[c.faltas.semaforo]}: pode faltar mais {c.faltas.faltasRestantesSemestre}</span>}
                </li>
              ))}
            </ul>
          </Cartao>

          <Cartao titulo="Média">
            {resumo.media ? (
              <p>{resumo.media.aprovadas} de {resumo.media.total} cadeiras aprovadas. Média atual: <b>{resumo.media.media.toFixed(2)}</b>{resumo.media.escala ? ` (${resumo.media.escala})` : ''}. O bónus de 0,6 só conta se fechar o ano todo.</p>
            ) : (
              <p>Ainda não há cadeiras aprovadas.</p>
            )}
          </Cartao>

          <Cartao titulo="Próxima prova e tarefas">
            <p>{resumo.proximaProva ? `${resumo.proximaProva.titulo || 'Prova'}: ${resumo.proximaProva.diasRestantes === 0 ? 'hoje' : `daqui a ${resumo.proximaProva.diasRestantes} dias`}.` : 'Sem frequências ou exames marcados.'}</p>
            <p>{resumo.tarefas.pendentes} tarefas por fazer, {resumo.tarefas.atrasadas} atrasadas.</p>
          </Cartao>

          <Cartao titulo="Estudo">
            <p>Esta semana: <b>{textoDuracao(resumo.estudo.minutosSemana)}</b>. Dias seguidos: <b>{resumo.estudo.sequencia}</b>. Sessões registadas: {resumo.estudo.sessoes}.</p>
            {dados?.sequenciaADoisLigada && (
              <p className="co-nota">{resumo.estudo.hoje ? '✓ Já estudou hoje.' : 'Ainda não estudou hoje.'} Ela ligou a "sequência a dois" — é a única coisa nova que este toggle mostra.</p>
            )}
          </Cartao>

          <Cartao titulo="O que ela produziu (só números)">
            <p>{resumo.producao.anotacoes} anotações, {resumo.producao.palavras} palavras.</p>
            <p>{resumo.producao.casosTotal} casos ({resumo.producao.casosPorResolver} por resolver ou com dúvida).</p>
            <p>{resumo.producao.flashcardsTotal} cartões ({resumo.producao.flashcardsProntos} prontos a rever).</p>
          </Cartao>

          <Cartao titulo="Sistema">
            <p>Dados lidos às {lidoEm?.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}. Leem-se ao abrir e quando tocas em Atualizar, para poupar leituras.</p>
          </Cartao>
        </>
      )}
    </div>
  );
}

export default function Consola() {
  const acesso = useAcessoAdmin();
  const [credencial, setCredencial] = useState(() => lerCredencial(localStorage));
  const [aberta, setAberta] = useState(false);
  const ultimaAtividade = useRef(0);

  // bloqueia sozinha ao fim de 15 minutos sem mexer
  useEffect(() => {
    if (!aberta) return undefined;
    ultimaAtividade.current = Date.now();
    const marcar = () => { ultimaAtividade.current = Date.now(); };
    window.addEventListener('pointerdown', marcar);
    window.addEventListener('keydown', marcar);
    const intervalo = setInterval(() => {
      if (sessaoExpirada(ultimaAtividade.current)) setAberta(false);
    }, 30000);
    return () => {
      window.removeEventListener('pointerdown', marcar);
      window.removeEventListener('keydown', marcar);
      clearInterval(intervalo);
    };
  }, [aberta]);

  if (acesso.fase === 'a-verificar') return <Carregando texto="A verificar..." tipo="templo" />;
  if (acesso.fase === 'sem-sessao') return <EntrarAdmin />;
  if (acesso.fase === 'nao-admin') return <Navigate to="/dashboard" replace />;

  if (acesso.fase === 'email-por-verificar') {
    return (
      <div className="co-pin">
        <h1>Consola</h1>
        <p>Falta verificar o email desta conta no Firebase. As regras só te deixam ler os dados dela com o email verificado.</p>
        <button type="button" className="co-botao" onClick={() => logout()}>Terminar sessão</button>
      </div>
    );
  }

  if (!UID_DA_LEONOR) {
    return (
      <div className="co-pin">
        <h1>Consola</h1>
        <p>Falta dizer à app qual é a conta da Leonor. Acrescenta <b>VITE_UID_LEONOR</b> ao ficheiro <b>.env</b>, com o uid dela (Firebase, Authentication), e volta a fazer o build. Ver docs/CONSOLA.md.</p>
      </div>
    );
  }

  if (!aberta) return <PedirPin credencial={credencial} onDefinida={setCredencial} onAberto={() => setAberta(true)} />;
  return <Conteudo onBloquear={() => setAberta(false)} />;
}
