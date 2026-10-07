import { Component, StrictMode } from 'react'
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

// se algo rebentar ao abrir, mostra o erro em vez de um ecrã em branco
class AppComErro extends Component {
  state = { erro: null }
  static getDerivedStateFromError(erro) { return { erro } }
  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div style={{ padding: '24px 16px', fontFamily: 'Georgia, serif' }}>
        <h1 style={{ fontSize: '1.2rem' }}>A app não conseguiu abrir</h1>
        <p>Tenta atualizar a página. Se continuar assim, manda este texto ao Vini:</p>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '.8rem' }}>{String(this.state.erro?.message ?? this.state.erro)}</pre>
        <button type="button" onClick={() => window.location.reload()}>Atualizar</button>
      </div>
    )
  }
}

// abrir a app com ?vini=NUMERO guarda o contacto do Vini neste telemóvel e tira o número do endereço
const contactoDoVini = contactoDoLink(window.location.search)
if (contactoDoVini) {
  guardarPreferencias({ bonecoContacto: contactoDoVini })
  window.history.replaceState(null, '', window.location.pathname)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* envolve toda a app com o tema — agora todas as páginas têm acesso */}
    <AppComErro>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AppComErro>
  </StrictMode>,
)