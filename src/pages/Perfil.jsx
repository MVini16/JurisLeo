// definições — o perfil e tudo o que se pode mudar, arrumado em grupos (à maneira das definições do TikTok):
// cartão de perfil, pesquisa, grupos de linhas com ícone, valor à direita e seta, e subpáginas
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { logout } from '../services/auth.js';
import { useTheme } from '../context/useTheme.js';
import { useBarney } from '../hooks/useBarney.jsx';
import { usePerfil } from '../hooks/usePerfil.js';
import { lerPreferencias } from '../services/preferenciasBrincadeiras.js';
import { pesquisarDefinicoes, localDaDefinicao, rotaDaSeccao } from '../services/definicoes.js';
import IconeDefinicao from '../components/definicoes/IconeDefinicao.jsx';
import { GrupoDefinicoes, LinhaDefinicao, ConfirmarDefinicao } from '../components/definicoes/PecasDefinicoes.jsx';
import '../components/definicoes/Definicoes.css';

function resumoDasBrincadeiras(prefs) {
  const ligadas = [prefs.barney, prefs.provocacoes].filter(Boolean).length;
  if (ligadas === 2) return 'Ligadas';
  return ligadas === 0 ? 'Desligadas' : 'Algumas';
}

export default function Perfil() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { perfil } = usePerfil();
  const { elemento: barney, tocar: tocarAvatar } = useBarney();
  const [termo, setTermo] = useState('');
  const [confirmarSair, setConfirmarSair] = useState(false);
  const [aSair, setASair] = useState(false);

  const prefs = lerPreferencias();
  const email = getAuth().currentUser?.email;
  const resultados = pesquisarDefinicoes(termo);
  const aPesquisar = termo.trim().length > 0;

  // volta a mostrar o tutorial do dashboard na próxima vez que lá entrar
  async function reverTutorial() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await setDoc(doc(db, 'users', userId, 'perfil', 'dados'), { tutorialFeito: false }, { merge: true });
    navigate('/dashboard');
  }

  async function sair() {
    setASair(true);
    await logout();
    navigate('/login');
  }

  function abrir(definicao) {
    const { destino } = definicao;
    if (destino.tipo === 'secao') navigate(rotaDaSeccao(destino.secao));
    else if (destino.tipo === 'rota') navigate(destino.rota);
    else if (destino.acao === 'tutorial') reverTutorial();
    else setConfirmarSair(true);
  }

  return (
    <div className={`def-pagina ${darkMode ? 'dark' : ''}`}>
      {barney}

      <header className="def-perfil">
        <button className="def-perfil__avatar" onClick={tocarAvatar} aria-label="Avatar">{(perfil?.nome || 'L').charAt(0).toUpperCase()}</button>
        <h1 className="def-perfil__nome">{perfil?.nome || 'Leonor'}</h1>
        <p className="def-perfil__curso">{[perfil?.curso, perfil?.ano].filter(Boolean).join(' · ') || 'Licenciatura em Direito'}</p>
        {email && <p className="def-perfil__email">{email}</p>}
      </header>

      <label className="def-pesquisa">
        <IconeDefinicao nome="pesquisa" tamanho={18} />
        <input
          type="search"
          placeholder="Pesquisar nas definições"
          aria-label="Pesquisar nas definições"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
        {aPesquisar && <button type="button" className="def-pesquisa__limpar" onClick={() => setTermo('')} aria-label="Limpar a pesquisa">×</button>}
      </label>

      {aPesquisar ? (
        <GrupoDefinicoes titulo={resultados.length > 0 ? `${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'}` : ''}>
          {resultados.length === 0 && <p className="def-vazio">Não encontrei nada para «{termo.trim()}». Experimenta outra palavra.</p>}
          {resultados.map((d) => (
            <LinhaDefinicao
              key={d.id}
              tipo="link"
              rotulo={d.rotulo}
              descricao={localDaDefinicao(d)}
              aoClicar={() => abrir(d)}
            />
          ))}
        </GrupoDefinicoes>
      ) : (
        <>
          <GrupoDefinicoes titulo="Conta" indice={0}>
            <LinhaDefinicao icone="pessoa" rotulo="Dados académicos" valor={perfil?.ano} aoClicar={() => navigate(rotaDaSeccao('dados'))} />
          </GrupoDefinicoes>

          <GrupoDefinicoes titulo="Aplicação" indice={1}>
            <LinhaDefinicao icone="paleta" rotulo="Aparência" valor={darkMode ? 'Escuro' : 'Claro'} aoClicar={() => navigate(rotaDaSeccao('aparencia'))} />
            <LinhaDefinicao icone="sorriso" rotulo="Brincadeiras" valor={resumoDasBrincadeiras(prefs)} aoClicar={() => navigate(rotaDaSeccao('brincadeiras'))} />
          </GrupoDefinicoes>

          <GrupoDefinicoes titulo="Dados" indice={2}>
            <LinhaDefinicao icone="base" rotulo="Os meus dados" aoClicar={() => navigate(rotaDaSeccao('os-meus-dados'))} />
          </GrupoDefinicoes>

          <GrupoDefinicoes titulo="Suporte" indice={3}>
            <LinhaDefinicao icone="ajuda" rotulo="Central de ajuda" aoClicar={() => navigate('/ajuda')} />
            <LinhaDefinicao icone="livro" rotulo="Rever o tutorial" tipo="acao" aoClicar={reverTutorial} />
            <LinhaDefinicao icone="info" rotulo="Sobre o JurisLeo" aoClicar={() => navigate(rotaDaSeccao('sobre'))} />
          </GrupoDefinicoes>

          <GrupoDefinicoes indice={4}>
            <LinhaDefinicao icone="sair" rotulo="Terminar sessão" tipo="acao" perigo aoClicar={() => setConfirmarSair(true)} />
          </GrupoDefinicoes>
        </>
      )}

      {confirmarSair && (
        <ConfirmarDefinicao
          titulo="Terminar sessão?"
          texto="Vais ter de entrar outra vez com o teu email e a tua palavra-passe."
          rotuloConfirmar={aSair ? 'A sair...' : 'Terminar sessão'}
          perigo
          aoConfirmar={sair}
          aoCancelar={() => setConfirmarSair(false)}
        />
      )}
    </div>
  );
}

