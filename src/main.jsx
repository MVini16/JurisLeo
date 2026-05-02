import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { db } from './firebase.js'
// importa o provider global do tema
import { ThemeProvider } from './context/ThemeContext.jsx'

console.log('Firebase ligado:', db)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* envolve toda a app com o tema — agora todas as páginas têm acesso */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)