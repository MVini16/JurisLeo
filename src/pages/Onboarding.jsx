import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { getAuth } from 'firebase/auth'
import './Onboarding.css'

// cadeiras pré-definidas da leonor
const cadeirasPredefinidas = [
  { id: 'tgdc2', nome: 'Teoria Geral Direito Civil II', cor: '#9b59b6' },
  { id: 'ied2', nome: 'Introdução ao Estudo do Direito II', cor: '#e91e8c' },
  { id: 'dc2', nome: 'Direito Constitucional II', cor: '#1a3a6b' },
  { id: 'hdp', nome: 'História do Direito Português', cor: '#e67e22' },
  { id: 'hip', nome: 'História das Ideias Políticas', cor: '#f1c40f' },
]

function Onboarding() {
  const navigate = useNavigate()
  const auth = getAuth()

  // ecrã atual (1 a 6)
  const [ecra, setEcra] = useState(1)

  // dados recolhidos
  const [nome, setNome] = useState('')
  const [curso, setCurso] = useState('Licenciatura em Direito')
  const [ano, setAno] = useState('1º Ano')
  const [cadeiras, setCadeiras] = useState(cadeirasPredefinidas.map(c => ({ ...c, ativa: true })))
  const [tema, setTema] = useState('dark')
  const [notificacoes, setNotificacoes] = useState(true)
  const [notasAnteriores, setNotasAnteriores] = useState(false)

  // estado do easter egg
  const [easterEggFase, setEasterEggFase] = useState(0)
  // 0 = não ativo, 1 = "espera chamas-te leonor?", 2 = "a namorada do marcus?", 3 = "tens a certeza?", 4 = "final"

  // avança para o próximo ecrã
  const avancar = () => setEcra(e => e + 1)

  // volta ao ecrã anterior
  const recuar = () => setEcra(e => e - 1)

  // guarda tudo no firestore e vai para o dashboard
  const terminar = async () => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const userRef = doc(db, 'users', userId)

    // guarda o perfil
    await setDoc(doc(userRef, 'perfil', 'dados'), {
      nome,
      curso,
      ano,
      turma: 'Turma A',
      subturma: 'Subturma 6',
      objetivos: [],
      onboardingFeito: true,
      criadoEm: new Date(),
    })

    // guarda as configurações
    await setDoc(doc(userRef, 'configuracoes', 'dados'), {
      tema,
      notificacoesAtivas: notificacoes,
      emailNotificacoes: '',
    })

    navigate('/dashboard')
  }

  // renderiza o ecrã correto
  const renderEcra = () => {
    switch (ecra) {
      case 1: return <Ecra1 nome={nome} setNome={setNome} avancar={avancar} />
      case 2: return <Ecra2 curso={curso} setCurso={setCurso} ano={ano} setAno={setAno} avancar={avancar} recuar={recuar} />
      case 3: return <Ecra3 nome={nome} cadeiras={cadeiras} setCadeiras={setCadeiras} avancar={avancar} recuar={recuar} easterEggFase={easterEggFase} setEasterEggFase={setEasterEggFase} />
      case 4: return <Ecra4 avancar={avancar} recuar={recuar} />
      case 5: return <Ecra5 tema={tema} setTema={setTema} notificacoes={notificacoes} setNotificacoes={setNotificacoes} avancar={avancar} recuar={recuar} />
      case 6: return <Ecra6 notasAnteriores={notasAnteriores} setNotasAnteriores={setNotasAnteriores} terminar={terminar} recuar={recuar} />
      default: return null
    }
  }

  return (
    <div className="ob-container">
      <div className="ob-bg" />

      {/* barra de progresso */}
      <div className="ob-progresso">
        {[1,2,3,4,5,6].map(n => (
          <div key={n} className={`ob-ponto ${ecra >= n ? 'ob-ponto-ativo' : ''}`} />
        ))}
      </div>

      {/* conteúdo do ecrã atual */}
      <div className="ob-card">
        {renderEcra()}
      </div>
    </div>
  )
}

// ── ecrã 1 — boas vindas + nome ──
function Ecra1({ nome, setNome, avancar }) {
  return (
    <div className="ob-ecra">
      <div className="ob-logo">⚖️</div>
      <h1 className="ob-titulo">Bem-vinda ao JurisLeo!</h1>
      <p className="ob-subtitulo">Vamos começar. Como te chamas?</p>
      <input
        className="ob-input"
        type="text"
        placeholder="O teu nome"
        value={nome}
        onChange={e => setNome(e.target.value)}
      />
      <button
        className="ob-botao"
        onClick={avancar}
        disabled={!nome.trim()}
      >
        Continuar →
      </button>
    </div>
  )
}

// ── ecrã 2 — curso e ano ──
function Ecra2({ curso, setCurso, ano, setAno, avancar, recuar }) {
  return (
    <div className="ob-ecra">
      <h1 className="ob-titulo">O teu curso</h1>
      <p className="ob-subtitulo">Confirma os teus dados académicos.</p>
      <input
        className="ob-input"
        type="text"
        placeholder="Curso"
        value={curso}
        onChange={e => setCurso(e.target.value)}
      />
      <input
        className="ob-input"
        type="text"
        placeholder="Ano"
        value={ano}
        onChange={e => setAno(e.target.value)}
      />
      <div className="ob-botoes">
        <button className="ob-botao-secundario" onClick={recuar}>← Voltar</button>
        <button className="ob-botao" onClick={avancar}>Continuar →</button>
      </div>
    </div>
  )
}

// ── ecrã 3 — cadeiras + easter egg ──
function Ecra3({ nome, cadeiras, setCadeiras, avancar, recuar, easterEggFase, setEasterEggFase }) {
  
  // deteta se o nome é leonor e ativa o easter egg
  const handleAvancar = () => {
    if (nome.trim().toLowerCase() === 'leonor' && easterEggFase === 0) {
      setEasterEggFase(1)
    } else {
      avancar()
    }
  }

  // toggle de cadeira ativa/inativa
  const toggleCadeira = (id) => {
    setCadeiras(cs => cs.map(c => c.id === id ? { ...c, ativa: !c.ativa } : c))
  }

  // easter egg ativo — mostra o diálogo
  if (easterEggFase > 0 && easterEggFase < 5) {
    return <EasterEgg fase={easterEggFase} setFase={setEasterEggFase} avancar={avancar} />
  }

  return (
    <div className="ob-ecra">
      <h1 className="ob-titulo">As tuas cadeiras</h1>
      <p className="ob-subtitulo">Confirma as cadeiras deste semestre.</p>
      <div className="ob-cadeiras">
        {cadeiras.map(c => (
          <div
            key={c.id}
            className={`ob-cadeira ${c.ativa ? 'ob-cadeira-ativa' : ''}`}
            style={{ borderColor: c.ativa ? c.cor : 'rgba(255,255,255,0.1)' }}
            onClick={() => toggleCadeira(c.id)}
          >
            <div className="ob-cadeira-cor" style={{ background: c.cor }} />
            <span>{c.nome}</span>
            {c.ativa && <span className="ob-check">✓</span>}
          </div>
        ))}
      </div>
      <div className="ob-botoes">
        <button className="ob-botao-secundario" onClick={recuar}>← Voltar</button>
        <button className="ob-botao" onClick={handleAvancar}>Continuar →</button>
      </div>
    </div>
  )
}

// ── easter egg ──
// ── easter egg ──
function EasterEgg({ fase, setFase, avancar }) {
  // controla o flash de resposta errada
  const [errado, setErrado] = useState(false)

  // mostra o flash e volta à mesma fase
  const respostaErrada = () => {
    setErrado(true)
    setTimeout(() => setErrado(false), 1000)
  }

  const conteudo = {
    1: {
      texto: 'Espera… chamas-te Leonor? 👀',
      botoes: [{ label: 'Sim 😳', acao: () => setFase(2) }]
    },
    2: {
      texto: 'A namorada do Marcus???? 😱',
      botoes: [
        { label: 'Sim! 🙋‍♀️', acao: () => setFase(4) },
        { label: 'Não…', acao: respostaErrada }
      ]
    },
    3: {
      texto: 'Tens a certeza? 🤨 Pareces muito a ela…',
      botoes: [
        { label: 'Ok ok sou eu 😂', acao: () => setFase(4) },
        { label: 'Sim tenho', acao: respostaErrada }
      ]
    },
    4: {
      texto: 'AAAAA! Então és tu a tal princesa encantada de quem ele me falou! 👸⚖️\n\nEle disse que ias precisar de ajuda com a faculdade… Não te preocupes, estou aqui para isso!\n\nVamos fazer de ti a melhor advogada de Lisboa? 🏛️',
      botoes: [{ label: 'Vamos a isso! 🚀', acao: () => { setFase(5); avancar() } }]
    },
  }

  const atual = conteudo[fase]

  return (
    <div className="ob-ecra ob-easter">
      {/* flash de resposta errada */}
      {errado && (
        <div className="ob-errado">
          ❌ Resposta errada!
        </div>
      )}
      <p className="ob-easter-texto">{atual.texto}</p>
      <div className="ob-botoes-easter">
        {atual.botoes.map((b, i) => (
          <button key={i} className="ob-botao" onClick={b.acao}>{b.label}</button>
        ))}
      </div>
    </div>
  )
}

// ── ecrã 4 — horário ──
function Ecra4({ avancar, recuar }) {
  return (
    <div className="ob-ecra">
      <h1 className="ob-titulo">O teu horário</h1>
      <p className="ob-subtitulo">Vamos configurar o teu horário semanal mais tarde, com mais detalhe.</p>
      <p className="ob-info">📅 Podes configurar o horário completo no separador <strong>Horário</strong> depois de entrares na app.</p>
      <div className="ob-botoes">
        <button className="ob-botao-secundario" onClick={recuar}>← Voltar</button>
        <button className="ob-botao" onClick={avancar}>Continuar →</button>
      </div>
    </div>
  )
}

// ── ecrã 5 — preferências ──
function Ecra5({ tema, setTema, notificacoes, setNotificacoes, avancar, recuar }) {
  return (
    <div className="ob-ecra">
      <h1 className="ob-titulo">Preferências</h1>
      <p className="ob-subtitulo">Como preferes usar a app?</p>

      <div className="ob-preferencia">
        <span>Tema</span>
        <div className="ob-toggle-tema">
          <button
            className={`ob-tema-btn ${tema === 'dark' ? 'ob-tema-ativo' : ''}`}
            onClick={() => setTema('dark')}
          >🌙 Escuro</button>
          <button
            className={`ob-tema-btn ${tema === 'light' ? 'ob-tema-ativo' : ''}`}
            onClick={() => setTema('light')}
          >☀️ Claro</button>
        </div>
      </div>

      <div className="ob-preferencia">
        <span>Notificações</span>
        <button
          className={`ob-toggle-btn ${notificacoes ? 'ob-toggle-on' : ''}`}
          onClick={() => setNotificacoes(n => !n)}
        >
          {notificacoes ? 'Ativas ✓' : 'Desativas'}
        </button>
      </div>

      <div className="ob-botoes">
        <button className="ob-botao-secundario" onClick={recuar}>← Voltar</button>
        <button className="ob-botao" onClick={avancar}>Continuar →</button>
      </div>
    </div>
  )
}

// ── ecrã 6 — notas anteriores ──
function Ecra6({ notasAnteriores, setNotasAnteriores, terminar, recuar }) {
  return (
    <div className="ob-ecra">
      <h1 className="ob-titulo">Quase lá! 🎉</h1>
      <p className="ob-subtitulo">Tens notas de semestres anteriores que queiras registar?</p>

      <div className="ob-opcoes">
        <button
          className={`ob-opcao ${notasAnteriores ? 'ob-opcao-ativa' : ''}`}
          onClick={() => setNotasAnteriores(true)}
        >
          Sim, tenho notas anteriores
        </button>
        <button
          className={`ob-opcao ${!notasAnteriores ? 'ob-opcao-ativa' : ''}`}
          onClick={() => setNotasAnteriores(false)}
        >
          Não, é o meu primeiro semestre
        </button>
      </div>

      <p className="ob-info">💡 Podes sempre adicionar notas anteriores mais tarde no teu Perfil.</p>

      <div className="ob-botoes">
        <button className="ob-botao-secundario" onClick={recuar}>← Voltar</button>
        <button className="ob-botao" onClick={terminar}>Entrar na app 🚀</button>
      </div>
    </div>
  )
}

export default Onboarding