import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase.js'
import { ThemeContext } from './useTheme.js'

export function ThemeProvider({ children }) {
  // sem escolha guardada, segue o tema do telemóvel
  const [darkMode, setDarkMode] = useState(() => {
    const guardado = localStorage.getItem('jurisleo-theme')
    if (guardado === 'dark' || guardado === 'light') return guardado === 'dark'
    return !!window.matchMedia?.('(prefers-color-scheme: dark)').matches
  })

  // evita escrever no firestore o valor que acabou de vir de lá
  const aCarregarDoFirestore = useRef(false)
  // o valor atual, para o listener do login saber se o do firestore é diferente
  const darkAtual = useRef(darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('jurisleo-theme', darkMode ? 'dark' : 'light')
    darkAtual.current = darkMode

    // sincroniza com o firestore, para o tema escolhido no onboarding
    // (ou noutro dispositivo) se manter ao entrar de novo na app
    const userId = auth.currentUser?.uid
    if (userId && !aCarregarDoFirestore.current) {
      setDoc(doc(db, 'users', userId, 'configuracoes', 'dados'), {
        tema: darkMode ? 'dark' : 'light',
      }, { merge: true }).catch(() => {})
    }
    aCarregarDoFirestore.current = false
  }, [darkMode])

  // quando o utilizador faz login, vai buscar a preferência guardada no firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (utilizador) => {
      if (!utilizador) return
      try {
        const snap = await getDoc(doc(db, 'users', utilizador.uid, 'configuracoes', 'dados'))
        const tema = snap.data()?.tema
        // só marca "veio do firestore" quando muda mesmo: se for igual, o react não
        // redesenha, a marca ficava presa e a próxima escolha dela não era gravada
        if ((tema === 'dark' || tema === 'light') && (tema === 'dark') !== darkAtual.current) {
          aCarregarDoFirestore.current = true
          setDarkMode(tema === 'dark')
        }
      } catch {
        // sem net ou sem dados ainda — mantém o que estava em localStorage
      }
    })
    return unsub
  }, [])

  const toggleTheme = () => setDarkMode(prev => !prev)

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
