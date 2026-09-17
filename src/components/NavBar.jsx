import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ModalCriarEvento from './ModalCriarEvento.jsx'
import DicaPrimeiraVez from './DicaPrimeiraVez.jsx'
import BotaoAjuda from './BotaoAjuda.jsx'
import { resolverAjuda } from '../data/ajuda.js'
import './NavBar.css'

// itens da navegação principal
const itens = [
  {
    path: '/dashboard',
    label: 'Início',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="8" x2="21" y2="8" />
      <path d="M6 8c0 3-1.5 5-3 6" />
      <path d="M18 8c0 3 1.5 5 3 6" />
      <path d="M3 14c1.5 1 3 1.5 6 1.5S10.5 15 12 14" />
      <path d="M21 14c-1.5 1-3 1.5-6 1.5S13.5 15 12 14" />
      </svg>
    ),
  },
  {
    path: '/horario',
    label: 'Horário',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    path: '/cadeiras',
    label: 'Cadeiras',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    path: '/tarefas',
    label: 'Tarefas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    path: '/calendario',
    label: 'Calendário',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    path: '/perfil',
    label: 'Perfil',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

// itens do menu + (adicionar rápido)
// acao: 'navegar' vai para uma rota (com estado a pedir para abrir o modal certo),
// 'frequencia' abre o modal de evento já aqui, 'em-breve' ainda não tem funcionalidade própria
const itensMais = [
  { label: 'Nova Tarefa', icon: '✅', cor: '#7C3AED', acao: 'navegar', destino: '/tarefas' },
  { label: 'Nova Anotação', icon: '📝', cor: '#1E3A5F', acao: 'navegar', destino: '/anotacoes/nova' },
  { label: 'Novo Caso', icon: '⚖️', cor: '#2E6F5E', acao: 'navegar', destino: '/casos/novo' },
  { label: 'Nova Frequência', icon: '📅', cor: '#6B0F1A', acao: 'frequencia' },
  { label: 'Oral de Melhoria', icon: '🗣️', cor: '#C9A84C', acao: 'navegar', destino: '/cadeiras' },
  { label: 'Registar Falta', icon: '❌', cor: '#EC4899', acao: 'navegar', destino: '/cadeiras' },
  { label: 'Lançar Nota', icon: '📊', cor: '#EA580C', acao: 'navegar', destino: '/cadeiras' },
  { label: 'Estudar', icon: '⏱️', cor: '#0F766E', acao: 'navegar', destino: '/estudo' },
]

// navBar envolve o conteúdo das páginas principais
function NavBar({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)
  const [modalFrequenciaAberto, setModalFrequenciaAberto] = useState(false)
  const [avisoEmBreve, setAvisoEmBreve] = useState(null)

  // índice do item activo para o slider
  const indiceActivo = itens.findIndex(i => i.path === location.pathname)

  // tópico de ajuda da página actual, para a dica de primeira visita e o botão de ajuda
  const ajuda = resolverAjuda(location.pathname)

  // trata o clique num item do menu + consoante a sua acção
  function clicarItemMais(item) {
    setMenuAberto(false)
    if (item.acao === 'navegar') {
      navigate(item.destino, { state: { abrirModal: true } })
    } else if (item.acao === 'frequencia') {
      setModalFrequenciaAberto(true)
    } else {
      // funcionalidade ainda não construída — avisa em vez de fingir que fez algo
      setAvisoEmBreve(item.label)
      setTimeout(() => setAvisoEmBreve(null), 2200)
    }
  }

  return (
    <div className="navbar-layout">

      {/* sidebar — só visível no desktop */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>⚖️</span>
          <span className="sidebar-logo-texto">JurisLeo</span>
        </div>

        <nav className="sidebar-nav">
          {itens.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'activo' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* botão + na sidebar */}
        <button
          className="sidebar-mais"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <span className={`mais-icone ${menuAberto ? 'aberto' : ''}`}>+</span>
          <span>Adicionar</span>
        </button>
      </aside>

      {/* conteúdo da página */}
      <main className="navbar-conteudo">
        {ajuda && <DicaPrimeiraVez chave={ajuda.chave} titulo={ajuda.titulo} texto={ajuda.texto} />}
        {children}
      </main>

      {ajuda && <BotaoAjuda titulo={ajuda.titulo} texto={ajuda.texto} pontos={ajuda.pontos} />}

      {/* overlay escuro quando o menu + está aberto */}
      {menuAberto && (
        <div
          className="menu-overlay"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* menu + expandido — itens a aparecerem em leque */}
      <div className={`menu-mais ${menuAberto ? 'aberto' : ''}`}>
        {itensMais.map((item, i) => (
          <button
            key={i}
            className="menu-mais-item"
            style={{
              '--delay': `${i * 0.05}s`,
              '--cor': item.cor,
            }}
            onClick={() => clicarItemMais(item)}
          >
            <span className="menu-mais-icon">{item.icon}</span>
            <span className="menu-mais-label">{item.label}</span>
          </button>
        ))}
      </div>

      {/* aviso simples para acções ainda não construídas */}
      {avisoEmBreve && (
        <div className="menu-aviso-em-breve">
          {avisoEmBreve} — ainda a caminho. Em breve por aqui! 🚧
        </div>
      )}

      {/* tab bar — só visível no mobile */}
      <nav className="tabbar">
        <div className="tabbar-wrapper">

          {/* slider animado por baixo do item activo */}
          <div
            className="tabbar-slider"
            style={{ transform: `translateX(${indiceActivo * 100}%)` }}
          />

          {itens.map((item) => (
            <button
              key={item.path}
              className={`tabbar-item ${location.pathname === item.path ? 'activo' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="tabbar-icon">{item.icon}</span>
              <span className="tabbar-label">{item.label}</span>
            </button>
          ))}

          {/* botão + central fixo */}
          <button
            className={`tabbar-mais ${menuAberto ? 'aberto' : ''}`}
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <span className="mais-icone">+</span>
          </button>
        </div>
      </nav>

      {/* modal de nova frequência, aberto a partir do menu + */}
      {modalFrequenciaAberto && (
        <ModalCriarEvento
          tipoInicial="frequencia"
          onFechar={() => setModalFrequenciaAberto(false)}
        />
      )}

    </div>
  )
}

export default NavBar