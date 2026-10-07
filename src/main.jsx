import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/imprimir.css'
import './styles/animacoes.css'
import App from './App.jsx'
// importa o provider global do tema
import { ThemeProvider } from './context/ThemeContext.jsx'
import { iniciarAnimacoes } from './services/animacoes.js'
import { contactoDoLink } from './services/boneco.js'
import { guardarPreferencias } from './services/preferenciasBrincadeiras.js'

iniciarAnimacoes()

// abrir a app com ?vini=NUMERO guarda o contacto do Vini neste telemóvel e tira o número do endereço
const contactoDoVini = contactoDoLink(window.location.search)
if (contactoDoVini) {
  guardarPreferencias({ bonecoContacto: contactoDoVini })
  window.history.replaceState(null, '', window.location.pathname)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* envolve toda a app com o tema — agora todas as páginas têm acesso */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)