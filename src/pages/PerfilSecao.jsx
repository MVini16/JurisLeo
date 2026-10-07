// uma subpágina das definições (/perfil/:secao): dados, aparência, brincadeiras, os meus dados e sobre
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../context/useTheme.js';
import { useBarney } from '../hooks/useBarney.jsx';
import { usePerfil } from '../hooks/usePerfil.js';
import { usePreferencias } from '../hooks/usePreferencias.js';
import { ASPETOS } from '../data/boneco.js';
import { SKINS_JOGOS, skinValida } from '../services/jogosSkins.js';
import { VARIANTES_HOJE, varianteHojeValida } from '../services/hoje.js';
import { recolherCopia, restaurarCopia } from '../services/copiaLocal.js';
import { PACOTES_ANIMACAO, pacoteValido } from '../services/animacoes.js';
import { VARIANTES_ESTUDO, varianteValida } from '../services/modoEstudo.js';
import { telefoneValido } from '../services/boneco.js';
import { ESTILOS_CARREGAMENTO, estiloCarregamentoValido } from '../data/carregamento.js';
import AvisosDeVersao from '../components/definicoes/AvisosDeVersao.jsx';
import PartilharComOVini from '../components/definicoes/PartilharComOVini.jsx';
import AvatarBoneco from '../components/boneco/AvatarBoneco.jsx';
import { lerPreferencias, guardarPreferencias } from '../services/preferenciasBrincadeiras.js';
import { exportarDadosComoFicheiro } from '../services/exportar.js';
import { limparCadeirasAntigas, seedCadeiras } from '../services/initFirestore.js';
import { seccaoValida } from '../services/definicoes.js';
import { FOLHAS } from '../services/notaRica.js';
import { CabecalhoSecao, GrupoDefinicoes, LinhaDefinicao, ConfirmarDefinicao } from '../components/definicoes/PecasDefinicoes.jsx';
import '../components/definicoes/Definicoes.css';

const NOMES_FOLHA = { pautado: 'Pautado', quadriculado: 'Quadriculado', pontos: 'Pontos', branco: 'Branco' };

function Dados() {
  const { perfil } = usePerfil();
  return (
    <GrupoDefinicoes nota="Estes dados vêm da tua conta. Para os mudares, fala com o Vini.">
      <LinhaDefinicao tipo="info" rotulo="Curso" valor={perfil?.curso || '—'} />
      <LinhaDefinicao tipo="info" rotulo="Ano" valor={perfil?.ano || '—'} />
      <LinhaDefinicao tipo="info" rotulo="Turma" valor={perfil?.turma || '—'} />
      <LinhaDefinicao tipo="info" rotulo="Subturma" valor={perfil?.subturma || '—'} />
      <LinhaDefinicao tipo="info" rotulo="Ano letivo" valor={perfil?.anoLetivo || '—'} />
    </GrupoDefinicoes>
  );
}

function Aparencia() {
  const { darkMode, toggleTheme } = useTheme();
  const [prefs, setPrefs] = useState(() => lerPreferencias());
  return (
    <>
      <GrupoDefinicoes indice={0} nota="O tema fica guardado na tua conta, por isso é o mesmo em qualquer aparelho.">
        <LinhaDefinicao tipo="interruptor" rotulo="Tema escuro" ligado={darkMode} aoClicar={toggleTheme} />
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Folha das notas novas" indice={1} nota="É a folha com que cada nota nova começa. Dentro de cada nota podes sempre mudar.">
        {FOLHAS.map((folha) => (
          <LinhaDefinicao
            key={folha}
            tipo="opcao"
            amostraFolha={folha}
            rotulo={NOMES_FOLHA[folha]}
            marcada={prefs.folhaNotas === folha}
            aoClicar={() => setPrefs(guardarPreferencias({ folhaNotas: folha }))}
          />
        ))}
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Estante dos cadernos" indice={1} nota="Podes mudar a qualquer momento, também na própria página das notas.">
        {[['lombadas', 'Prateleira', 'Lombadas com a cor de cada cadeira.'], ['capas', 'Capas', 'Capas de caderno com fita, em grelha.']].map(([id, nome, descricao]) => (
          <LinhaDefinicao key={id} tipo="opcao" rotulo={nome} descricao={descricao} marcada={(prefs.estanteEstilo === 'capas' ? 'capas' : 'lombadas') === id}
            aoClicar={() => setPrefs(guardarPreferencias({ estanteEstilo: id }))} />
        ))}
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Animações" indice={2} nota="Escolhe como as páginas e as listas aparecem. Se o telemóvel tiver «reduzir movimento» ligado, a app respeita isso.">
        {PACOTES_ANIMACAO.map((p) => (
          <LinhaDefinicao
            key={p.id}
            tipo="opcao"
            rotulo={p.nome}
            descricao={p.descricao}
            marcada={pacoteValido(prefs.animacoes) === p.id}
            aoClicar={() => setPrefs(guardarPreferencias({ animacoes: p.id }))}
          />
        ))}
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Cartão de hoje" indice={3} nota="É o bloco no topo do Dashboard com a tua série, os flashcards para rever e o desafio do dia.">
        {VARIANTES_HOJE.map((v) => (
          <LinhaDefinicao
            key={v.id}
            tipo="opcao"
            rotulo={v.nome}
            descricao={v.descricao}
            marcada={varianteHojeValida(prefs.hojeVisual) === v.id}
            aoClicar={() => setPrefs(guardarPreferencias({ hojeVisual: v.id }))}
          />
        ))}
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Estilo dos jogos" indice={4}>
        {SKINS_JOGOS.map((sk) => (
          <LinhaDefinicao
            key={sk.id}
            tipo="opcao"
            rotulo={sk.nome}
            descricao={sk.descricao}
            marcada={skinValida(prefs.jogosSkin) === sk.id}
            aoClicar={() => setPrefs(guardarPreferencias({ jogosSkin: sk.id }))}
          />
        ))}
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Modo de estudo" indice={5} nota="É o aspeto da revisão de flashcards em ecrã inteiro.">
        {VARIANTES_ESTUDO.map((v) => (
          <LinhaDefinicao
            key={v.id}
            tipo="opcao"
            rotulo={v.nome}
            descricao={v.descricao}
            marcada={varianteValida(prefs.estudoVisual) === v.id}
            aoClicar={() => setPrefs(guardarPreferencias({ estudoVisual: v.id }))}
          />
        ))}
      </GrupoDefinicoes>
    </>
  );
}

function Brincadeiras() {
  const { elemento: barney, disparar } = useBarney();
  const prefs = usePreferencias();
  const mudar = (parcial) => guardarPreferencias(parcial);
  const [contacto, setContacto] = useState(prefs.bonecoContacto);
  const contactoOk = contacto === '' || telefoneValido(contacto);
  return (
    <>
      {barney}
      <GrupoDefinicoes titulo="Ecrãs de carregamento" indice={0} nota="As frases que aparecem enquanto uma página chega. Muda a qualquer momento.">
        {ESTILOS_CARREGAMENTO.map((e) => (
          <LinhaDefinicao key={e.id} tipo="opcao" rotulo={e.nome} descricao={e.descricao} marcada={estiloCarregamentoValido(prefs.carregamento) === e.id}
            aoClicar={() => mudar({ carregamento: e.id })} />
        ))}
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Jogos" indice={0} nota="Sons curtos nos jogos (acertos, erros, combos e prémios). Se o telemóvel estiver em silêncio, não se ouve nada.">
        <LinhaDefinicao tipo="interruptor" rotulo="Sons dos jogos" ligado={prefs.jogosSom} aoClicar={() => mudar({ jogosSom: !prefs.jogosSom })} />
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Boneco do Vini" indice={1} nota="Um boneco que anda contigo pelas páginas, pergunta como estás e leva-te a algo útil. Não é o Vini a sério: fala com frases que ele escreveu. Fica tudo só neste telemóvel.">
        <LinhaDefinicao tipo="interruptor" rotulo="Mostrar o boneco" ligado={prefs.boneco} aoClicar={() => mudar({ boneco: !prefs.boneco })} />
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Como se parece" indice={2}>
        {ASPETOS.map((a) => (
          <button key={a.id} type="button" role="radio" aria-checked={prefs.bonecoAspeto === a.id} className="def-linha" disabled={!prefs.boneco} onClick={() => mudar({ bonecoAspeto: a.id })}>
            <span className="def-linha__icone" style={{ width: 36, height: 36 }}><AvatarBoneco aspeto={a.id} /></span>
            <span className="def-linha__texto"><span className="def-linha__rotulo">{a.nome}</span></span>
            <span className={`def-visto ${prefs.bonecoAspeto === a.id ? 'marcada' : ''}`} aria-hidden="true">✓</span>
          </button>
        ))}
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Onde fica" indice={3}>
        {[['esquerda', 'Em baixo, à esquerda'], ['direita', 'Em baixo, à direita']].map(([id, rotulo]) => (
          <LinhaDefinicao key={id} tipo="opcao" rotulo={rotulo} desativado={!prefs.boneco} marcada={prefs.bonecoPosicao === id} aoClicar={() => mudar({ bonecoPosicao: id })} />
        ))}
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Puxar conversa" indice={4} nota="Nunca aparece quando estás a escrever, a estudar ou nos flashcards. «Hoje não» no balão cala-o até ao fim do dia.">
        {[['nunca', 'Nunca, só quando eu tocar'], ['as-vezes', 'De vez em quando (1 por dia)'], ['mais', 'Mais vezes (até 3 por dia)']].map(([id, rotulo]) => (
          <LinhaDefinicao key={id} tipo="opcao" rotulo={rotulo} desativado={!prefs.boneco} marcada={prefs.bonecoConversa === id} aoClicar={() => mudar({ bonecoConversa: id })} />
        ))}
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Contacto do Vini" indice={5} nota={contactoOk ? 'O número fica só guardado neste telemóvel e serve ao botão «Falar com o Vini a sério» (ligar, mensagem ou WhatsApp).' : 'Esse número não parece válido. Usa só dígitos, com ou sem +351.'}>
        <label className="def-linha def-linha--info">
          <span className="def-linha__texto"><span className="def-linha__rotulo">Número do Vini</span></span>
          <input
            type="tel"
            inputMode="tel"
            className="def-campo"
            value={contacto}
            placeholder="+351 ..."
            onChange={(e) => { setContacto(e.target.value); if (e.target.value === '' || telefoneValido(e.target.value)) mudar({ bonecoContacto: e.target.value.trim() }); }}
          />
        </label>
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Barney" indice={6} nota="A piada do «Legen... wait for it... dary» salta de vez em quando e sempre que algo corre bem.">
        <LinhaDefinicao tipo="interruptor" rotulo="Piadas do Barney" ligado={prefs.barney} aoClicar={() => mudar({ barney: !prefs.barney })} />
        <LinhaDefinicao tipo="acao" rotulo="Ver a piada outra vez" desativado={!prefs.barney} aoClicar={() => disparar('segredo')} />
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Vini" indice={7} nota="As mensagens só aparecem enquanto escreves notas e casos, e só contam o tempo em que estás mesmo a escrever.">
        <LinhaDefinicao tipo="interruptor" rotulo="Mensagens do Vini ao escrever" ligado={prefs.provocacoes} aoClicar={() => mudar({ provocacoes: !prefs.provocacoes })} />
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="De quanto em quanto tempo" indice={8}>
        {[5, 10, 20].map((min) => (
          <LinhaDefinicao
            key={min}
            tipo="opcao"
            rotulo={`A cada ${min} minutos a escrever`}
            desativado={!prefs.provocacoes}
            marcada={prefs.frequenciaMin === min}
            aoClicar={() => mudar({ frequenciaMin: min })}
          />
        ))}
      </GrupoDefinicoes>
    </>
  );
}

function OsMeusDados() {
  const { elemento: barney, disparar } = useBarney();
  const [aExportar, setAExportar] = useState(false);
  const [confirmarReposicao, setConfirmarReposicao] = useState(false);
  const [reposicao, setReposicao] = useState('parado'); // parado | a-repor | feito | erro
  const [copiaAberta, setCopiaAberta] = useState(false);
  const [textoCopia, setTextoCopia] = useState('');
  const [avisoCopia, setAvisoCopia] = useState('');

  // copia para a área de transferência o que só está neste telemóvel (jogos, aparência, série de estudo)
  async function copiarDadosDoTelemovel() {
    const texto = recolherCopia(localStorage);
    try {
      await navigator.clipboard.writeText(texto);
      setAvisoCopia('Copiado. Cola numa mensagem para ti, para guardares num sítio seguro.');
    } catch {
      setTextoCopia(texto);
      setCopiaAberta(true);
      setAvisoCopia('Não consegui copiar sozinho. Seleciona o texto da caixa e copia-o à mão.');
    }
  }

  function restaurarDadosDoTelemovel() {
    const r = restaurarCopia(localStorage, textoCopia);
    if (r.ok) { setAvisoCopia(`Cópia reposta (${r.repostas} grupos de dados). Fecha e abre a app para veres tudo.`); setTextoCopia(''); setCopiaAberta(false); }
    else setAvisoCopia(r.erro);
  }

  async function exportarDados() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    setAExportar(true);
    try {
      await exportarDadosComoFicheiro(userId);
      disparar('exportacao');
    } finally {
      setAExportar(false);
    }
  }

  // repara contas antigas: apaga as cadeiras do 1.º ano e volta a criar as 5 do 2.º, com as notas e as faltas a zero
  async function reporCadeiras() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    setConfirmarReposicao(false);
    setReposicao('a-repor');
    try {
      await limparCadeirasAntigas(userId);
      await seedCadeiras(userId);
      setReposicao('feito');
    } catch {
      setReposicao('erro');
    }
  }

  return (
    <>
      {barney}
      <GrupoDefinicoes titulo="Cópia de segurança" indice={0} nota="Um ficheiro com tudo o que tens na app: cadeiras, notas, faltas, anotações, casos e mais. Para levares uma só nota para o OneNote, Word ou PDF, usa o botão Exportar dentro da nota.">
        <LinhaDefinicao icone="base" rotulo="Exportar os meus dados" descricao="Descarrega um ficheiro .json" ocupado={aExportar} aoClicar={exportarDados} tipo="acao" />
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Cópia do que está só neste telemóvel" indice={1} nota="Os recordes e selos dos jogos, a aparência e a série de estudo ficam guardados só neste telemóvel. Faz uma cópia antes de instalares a app de novo e repõe-na depois.">
        <LinhaDefinicao icone="base" tipo="acao" rotulo="Copiar os dados deste telemóvel" descricao="Copia um texto para guardares" aoClicar={copiarDadosDoTelemovel} />
        <LinhaDefinicao icone="base" tipo="acao" rotulo="Repor uma cópia" descricao="Cola aqui o texto que guardaste" aoClicar={() => setCopiaAberta((a) => !a)} />
      </GrupoDefinicoes>
      {copiaAberta && (
        <div className="def-grupo">
          <textarea className="def-campo-grande" rows={4} value={textoCopia} onChange={(e) => setTextoCopia(e.target.value)} placeholder="Cola aqui a cópia" aria-label="Texto da cópia" />
          <button type="button" className="def-botao def-botao--principal" disabled={!textoCopia.trim()} onClick={restaurarDadosDoTelemovel}>Repor</button>
        </div>
      )}
      {avisoCopia && <p className="def-grupo__nota" role="status">{avisoCopia}</p>}

      <PartilharComOVini indice={2} />
      <AvisosDeVersao indice={3} />

      <GrupoDefinicoes titulo="Zona de perigo" indice={2} nota="Só serve para arranjar uma conta antiga, criada antes de as cadeiras do 2.º ano estarem certas. Se está tudo bem contigo, não precisas disto.">
        <LinhaDefinicao
          icone="aviso"
          perigo
          tipo="acao"
          rotulo="Repor as cadeiras do 2.º ano"
          descricao={reposicao === 'feito' ? 'Feito. As 5 cadeiras voltaram ao início.' : reposicao === 'erro' ? 'Não consegui. Tenta outra vez.' : 'Apaga as notas e as faltas das cadeiras'}
          ocupado={reposicao === 'a-repor'}
          aoClicar={() => setConfirmarReposicao(true)}
        />
      </GrupoDefinicoes>

      {confirmarReposicao && (
        <ConfirmarDefinicao
          titulo="Repor as cadeiras do 2.º ano?"
          texto="Isto apaga as notas e as faltas que registaste nas 5 cadeiras e volta a pô-las a zero. Não se pode desfazer. As anotações, os casos e o resto ficam como estão. Se tiveres dúvidas, exporta primeiro uma cópia dos teus dados."
          marcar="Percebi que isto apaga as minhas notas e faltas"
          rotuloConfirmar="Repor"
          perigo
          aoConfirmar={reporCadeiras}
          aoCancelar={() => setConfirmarReposicao(false)}
        />
      )}
    </>
  );
}

function Sobre() {
  return (
    <section className="def-sobre">
      <span className="def-sobre__marca">JurisLeo</span>
      <p>Feita pelo Vini, para a Leonor.</p>
      <p>Para organizar o horário, as cadeiras, as notas e as faltas do 2.º ano de Direito na Faculdade de Direito da Universidade de Lisboa, com o regulamento de avaliação a fazer as contas por ti.</p>
      <p className="def-sobre__fim">Com carinho, e com algumas piadas.</p>
    </section>
  );
}

const CONTEUDO = { dados: Dados, aparencia: Aparencia, brincadeiras: Brincadeiras, 'os-meus-dados': OsMeusDados, sobre: Sobre };

export default function PerfilSecao() {
  const { secao } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const dados = seccaoValida(secao);
  const Conteudo = dados ? CONTEUDO[dados.id] : null;

  return (
    <div className={`def-pagina def-pagina--secao ${darkMode ? 'dark' : ''}`}>
      <CabecalhoSecao titulo={dados?.titulo ?? 'Definições'} aoVoltar={() => navigate('/perfil')} />
      {Conteudo ? <Conteudo /> : <p className="def-vazio">Não encontrei esta definição.</p>}
    </div>
  );
}
