import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AberturaLivro from '../components/animacoes/AberturaLivro.jsx'
import { lerPreferencias, modoAbertura } from '../services/preferencias.js'

const CHAVE_ABERTURA = 'jurisleo-abertura-dia'

// a abertura completa passa uma vez por dia; nas restantes aberturas é a versão curta
function jaViuHoje() {
  const hoje = new Date().toDateString()
  try {
    if (localStorage.getItem(CHAVE_ABERTURA) === hoje) return true
    localStorage.setItem(CHAVE_ABERTURA, hoje)
  } catch {
    // sem localStorage, mostra sempre a completa
  }
  return false
}

function SplashScreen() {
  const navigate = useNavigate()
  // a escolha dela em definições manda: completa, rápida ou nenhuma
  const [modo] = useState(() => modoAbertura(lerPreferencias().abertura, jaViuHoje()))

  useEffect(() => {
    if (modo === 'nenhuma') navigate('/login', { replace: true })
  }, [modo, navigate])

  if (modo === 'nenhuma') return null
  return <AberturaLivro curta={modo === 'curta'} onEntrar={() => navigate('/login')} />
}

export default SplashScreen
