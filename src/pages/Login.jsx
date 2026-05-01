// importa os hooks do react
import { useState } from 'react'
// importa a navegação
import { useNavigate } from 'react-router-dom'
// importa as funções de autenticação
import { login, registar } from '../auth.js'
// importa o firestore para verificar o onboarding
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
// importa o css
import './Login.css'

function Login() {
  const navigate = useNavigate()

  // controla se está em modo login ou registo
  const [modoRegisto, setModoRegisto] = useState(false)

  // campos do formulário
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // estado de carregamento e erro
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  // submete o formulário
  const handleSubmit = async () => {
    setErro('')
    setCarregando(true)

    const resultado = modoRegisto
      ? await registar(email, password)
      : await login(email, password)

    setCarregando(false)

    if (resultado.sucesso) {
      if (modoRegisto) {
        // registo novo — vai sempre para onboarding
        navigate('/onboarding')
      } else {
        // login — verifica se o onboarding já foi feito
        try {
          const userId = resultado.utilizador.uid
          const perfilRef = doc(db, 'users', userId, 'perfil', 'dados')
          const perfilSnap = await getDoc(perfilRef)

          if (perfilSnap.exists() && perfilSnap.data().onboardingFeito) {
            // onboarding já feito — vai para dashboard
            navigate('/dashboard')
          } else {
            // onboarding não feito — vai para onboarding
            navigate('/onboarding')
          }
        } catch {
          navigate('/dashboard')
        }
      }
    } else {
      // traduz os erros mais comuns do firebase
      if (resultado.erro.includes('invalid-credential')) {
        setErro('Email ou password incorretos.')
      } else if (resultado.erro.includes('email-already-in-use')) {
        setErro('Este email já está registado.')
      } else if (resultado.erro.includes('weak-password')) {
        setErro('A password deve ter pelo menos 6 caracteres.')
      } else if (resultado.erro.includes('invalid-email')) {
        setErro('Email inválido.')
      } else {
        setErro('Ocorreu um erro. Tenta novamente.')
      }
    }
  }

  return (
    <div className="login-container">
      {/* fundo */}
      <div className="login-bg" />

      {/* card central */}
      <div className="login-card">

        {/* logo pequeno */}
        <div className="login-logo">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="50" y1="10" x2="50" y2="85" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="20" y1="25" x2="80" y2="25" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="20" y1="25" x2="10" y2="45" stroke="#C9A84C" strokeWidth="1.5"/>
            <line x1="20" y1="25" x2="30" y2="45" stroke="#C9A84C" strokeWidth="1.5"/>
            <path d="M10 45 Q20 55 30 45" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
            <line x1="80" y1="25" x2="70" y2="45" stroke="#C9A84C" strokeWidth="1.5"/>
            <line x1="80" y1="25" x2="90" y2="45" stroke="#C9A84C" strokeWidth="1.5"/>
            <path d="M70 45 Q80 55 90 45" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
            <line x1="35" y1="85" x2="65" y2="85" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* título */}
        <h1 className="login-titulo">JurisLeo</h1>

        {/* toggle login/registo */}
        <div className="login-toggle">
          <button
            className={`toggle-btn ${!modoRegisto ? 'toggle-ativo' : ''}`}
            onClick={() => { setModoRegisto(false); setErro('') }}
          >
            Entrar
          </button>
          <button
            className={`toggle-btn ${modoRegisto ? 'toggle-ativo' : ''}`}
            onClick={() => { setModoRegisto(true); setErro('') }}
          >
            Registar
          </button>
        </div>

        {/* campos */}
        <div className="login-campos">
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* mensagem de erro */}
        {erro && <p className="login-erro">{erro}</p>}

        {/* botão principal */}
        <button
          className="login-botao"
          onClick={handleSubmit}
          disabled={carregando}
        >
          {carregando ? 'A processar...' : modoRegisto ? 'Criar conta' : 'Entrar'}
        </button>

      </div>
    </div>
  )
}

export default Login