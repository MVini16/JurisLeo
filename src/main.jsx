import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/imprimir.css'
import App from './App.jsx'
// importa o provider global do tema
import { ThemeProvider } from './context/ThemeContext.jsx'
import { lerPreferencias, aplicarPreferencias } from './services/preferencias.js'

// animações ligadas ou desligadas, conforme a escolha dela neste aparelho
aplicarPreferencias(lerPreferencias())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* envolve toda a app com o tema — agora todas as páginas têm acesso */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)