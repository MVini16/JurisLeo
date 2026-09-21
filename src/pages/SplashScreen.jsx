import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AberturaLivro from '../components/animacoes/AberturaLivro.jsx'

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
  const [curta] = useState(jaViuHoje)

  return <AberturaLivro curta={curta} onEntrar={() => navigate('/login')} />
}

export default SplashScreen
