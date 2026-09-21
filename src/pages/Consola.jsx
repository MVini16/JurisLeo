// consola do Vini — só leitura. rota /consola, sem link em lado nenhum.
// se a Leonor (ou qualquer outra conta) chegar aqui, volta em silêncio para o início
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { logout } from '../services/auth.js';
import { useAcessoAdmin, useDadosDela } from '../hooks/useConsola.js';
import { UID_DA_LEONOR } from '../data/consola.js';
import { resumirDados, triagem } from '../services/consola.js';
import { textoDuracao } from '../services/estatisticasEstudo.js';
import {
  TAMANHO_PIN, pinValido, criarCredencial, verificarPin, lerCredencial, guardarCredencial,
  lerBloqueio, guardarBloqueio, estaBloqueado, minutosDeBloqueio, aposTentativaErrada, estadoInicialBloqueio, sessaoExpirada,
} from '../services/pin.js';
import Carregando from '../components/animacoes/Carregando.jsx';
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
            <p className="co-nota">O registo diário de bem-estar ainda não existe na app dela. Quando existir, aparece aqui primeiro.</p>
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
  if (acesso.fase === 'sem-sessao') return <Navigate to="/login" replace />;
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
