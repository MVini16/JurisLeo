import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ModalCriarEvento from './ModalCriarEvento.jsx'
import DicaPrimeiraVez from './DicaPrimeiraVez.jsx'
import BotaoAjuda from './BotaoAjuda.jsx'
import { resolverAjuda } from '../data/ajuda.js'
import { useModulos } from '../hooks/useModulos.js'
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

// definições ficam junto ao perfil: na barra lateral, e no ecrã do perfil no telemóvel
const itemDefinicoes = {
  path: '/definicoes',
  label: 'Definições',
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
}

// o perfil e as definições contam como o mesmo separador
const estaAtivo = (item, pathname) =>
  pathname === item.path || (item.path === '/perfil' && pathname === '/definicoes')

// itens do menu + (adicionar rápido)
// acao: 'navegar' vai para uma rota (com estado a pedir para abrir o modal certo),
// 'frequencia' abre o modal de evento já aqui, 'em-breve' ainda não tem funcionalidade própria
const itensMais = [
  { modulo: 'atalhoTarefa', label: 'Nova Tarefa', icon: '✅', cor: '#7C3AED', acao: 'navegar', destino: '/tarefas' },
  { modulo: 'atalhoAnotacao', label: 'Nova Anotação', icon: '📝', cor: '#1E3A5F', acao: 'navegar', destino: '/anotacoes/nova' },
  { modulo: 'atalhoCaso', label: 'Novo Caso', icon: '⚖️', cor: '#2E6F5E', acao: 'navegar', destino: '/casos/novo' },
  { modulo: 'atalhoFrequencia', label: 'Nova Frequência', icon: '📅', cor: '#6B0F1A', acao: 'frequencia' },
  { modulo: 'atalhoOral', label: 'Oral de Melhoria', icon: '🗣️', cor: '#C9A84C', acao: 'navegar', destino: '/cadeiras' },
  { modulo: 'atalhoFalta', label: 'Registar Falta', icon: '❌', cor: '#EC4899', acao: 'navegar', destino: '/faltas' },
  { modulo: 'atalhoNota', label: 'Lançar Nota', icon: '📊', cor: '#EA580C', acao: 'navegar', destino: '/notas' },
  { modulo: 'atalhoEstudar', label: 'Estudar', icon: '⏱️', cor: '#0F766E', acao: 'navegar', destino: '/estudo' },
]

// navBar envolve o conteúdo das páginas principais
function NavBar({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)
  const [modalFrequenciaAberto, setModalFrequenciaAberto] = useState(false)
  const [avisoEmBreve, setAvisoEmBreve] = useState(null)
  // o que ela escolheu ver no botão +
  const { ativos } = useModulos()

  // índice do item activo para o slider
  const indiceActivo = itens.findIndex(i => estaAtivo(i, location.pathname))

  // abrir uma cadeira é abrir um livro; mudar de anotação é virar a página
  const variantePagina = location.pathname.startsWith('/cadeiras/') ? 'pagina-livro' : location.pathname.startsWith('/anotacoes/') ? 'pagina-vira' : ''

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
      <aside className="sidebar no-print">
        <div className="sidebar-logo">
          <span>⚖️</span>
          <span className="sidebar-logo-texto">JurisLeo</span>
        </div>

        <nav className="sidebar-nav">
          {itens.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${estaAtivo(item, location.pathname) ? 'activo' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          ))}
          <button
            className={`sidebar-item ${location.pathname === itemDefinicoes.path ? 'activo' : ''}`}
            onClick={() => navigate(itemDefinicoes.path)}
          >
            <span className="sidebar-item-icon">{itemDefinicoes.icon}</span>
            <span className="sidebar-item-label">{itemDefinicoes.label}</span>
          </button>
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
        <div key={location.pathname} className={`pagina-entra ${variantePagina}`}>{children}</div>
      </main>

      {ajuda && (
        <div className="no-print">
          <BotaoAjuda titulo={ajuda.titulo} texto={ajuda.texto} pontos={ajuda.pontos} />
        </div>
      )}

      {/* overlay escuro quando o menu + está aberto */}
      {menuAberto && (
        <div
          className="menu-overlay no-print"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* menu + expandido — itens a aparecerem em leque */}
      <div className={`menu-mais no-print ${menuAberto ? 'aberto' : ''}`}>
        {itensMais.filter((item) => ativos[item.modulo] !== false).map((item, i) => (
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
        <div className="menu-aviso-em-breve no-print">
          {avisoEmBreve} — ainda a caminho. Em breve por aqui! 🚧
        </div>
      )}

      {/* tab bar — só visível no mobile */}
      <nav className="tabbar no-print">
        <div className="tabbar-wrapper">

          {/* slider animado por baixo do item activo */}
          <div
            className="tabbar-slider"
            style={{ transform: `translateX(${indiceActivo * 100}%)` }}
          />

          {itens.map((item) => (
            <button
              key={item.path}
              className={`tabbar-item ${estaAtivo(item, location.pathname) ? 'activo' : ''}`}
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