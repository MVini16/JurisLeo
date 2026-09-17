import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase.js'
import { ThemeContext } from './useTheme.js'

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('jurisleo-theme') === 'dark'
  })

  // evita escrever no firestore o valor que acabou de vir de lá
  const aCarregarDoFirestore = useRef(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('jurisleo-theme', darkMode ? 'dark' : 'light')

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
        if (tema === 'dark' || tema === 'light') {
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
