// uma subpágina das definições (/perfil/:secao): dados, aparência, brincadeiras, os meus dados e sobre
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../context/useTheme.js';
import { useBarney } from '../hooks/useBarney.jsx';
import { usePerfil } from '../hooks/usePerfil.js';
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
    </>
  );
}

function Brincadeiras() {
  const { elemento: barney, disparar } = useBarney();
  const [prefs, setPrefs] = useState(() => lerPreferencias());
  const mudar = (parcial) => setPrefs(guardarPreferencias(parcial));
  return (
    <>
      {barney}
      <GrupoDefinicoes titulo="Barney" indice={0} nota="A piada do «Legen... wait for it... dary» salta de vez em quando e sempre que algo corre bem.">
        <LinhaDefinicao tipo="interruptor" rotulo="Piadas do Barney" ligado={prefs.barney} aoClicar={() => mudar({ barney: !prefs.barney })} />
        <LinhaDefinicao tipo="acao" rotulo="Ver a piada outra vez" desativado={!prefs.barney} aoClicar={() => disparar('segredo')} />
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="Vini" indice={1} nota="As mensagens só aparecem enquanto escreves notas e casos, e só contam o tempo em que estás mesmo a escrever.">
        <LinhaDefinicao tipo="interruptor" rotulo="Mensagens do Vini ao escrever" ligado={prefs.provocacoes} aoClicar={() => mudar({ provocacoes: !prefs.provocacoes })} />
      </GrupoDefinicoes>

      <GrupoDefinicoes titulo="De quanto em quanto tempo" indice={2}>
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

      <GrupoDefinicoes titulo="Zona de perigo" indice={1} nota="Só serve para arranjar uma conta antiga, criada antes de as cadeiras do 2.º ano estarem certas. Se está tudo bem contigo, não precisas disto.">
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
