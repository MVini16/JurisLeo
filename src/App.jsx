import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// páginas existentes
import SplashScreen from './pages/SplashScreen'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
// páginas novas
import Horario from './pages/Horario'
import Cadeiras from './pages/Cadeiras'
import Cadeira from './pages/Cadeira'
import Notas from './pages/Notas'
import Faltas from './pages/Faltas'
import Anotacoes from './pages/Anotacoes'
import Cadernos from './pages/Cadernos'
import Caderno from './pages/Caderno'
import Anotacao from './pages/Anotacao'
import Casos from './pages/Casos'
import Caso from './pages/Caso'
import Estudo from './pages/Estudo'
import Glossario from './pages/Glossario'
import Artigos from './pages/Artigos'
import Leituras from './pages/Leituras'
import Pesquisa from './pages/Pesquisa'
import Flashcards from './pages/Flashcards'
import Ajuda from './pages/Ajuda'
import Tarefas from './pages/Tarefas'
import Calendario from './pages/Calendario'
import Perfil from './pages/Perfil'
import Definicoes from './pages/Definicoes'
import Ferramentas from './pages/Ferramentas'
import Fichas from './pages/Fichas'
import Prazos from './pages/Prazos'
import Respirar from './pages/Respirar'
import Consola from './pages/Consola'
import Frequencia from './pages/Frequencia'
import Pares from './pages/Pares'
import ModoExame from './pages/ModoExame'
import TopicosCorrecaoLista from './pages/TopicosCorrecaoLista'
import TopicosCorrecao from './pages/TopicosCorrecao'
import MapasMentaisLista from './pages/MapasMentaisLista'
import MapaMental from './pages/MapaMental'
import PlanoEstudo from './pages/PlanoEstudo'
// componente de navegação — vai envolver todas as páginas principais
import NavBar from './components/NavBar'
import Carregando from './components/animacoes/Carregando.jsx'
import { useAuthPronto } from './hooks/useAuthPronto.js'

function App() {
  // só monta as rotas depois do firebase saber se há sessão guardada — sem isto,
  // um arranque a frio direto numa página com dados (ex: pwa reaberta em /calendario)
  // fica preso a "a carregar" para sempre, porque os hooks de dados só olham para
  // a sessão uma vez, ao montar
  const pronto = useAuthPronto();
  if (!pronto) return <Carregando texto="A abrir..." tipo="templo" />;

  return (
    <BrowserRouter>
      <Routes>
        {/* páginas sem navbar — entrada da app */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/consola" element={<Consola />} />
        <Route path="/admin" element={<Consola />} />
        {/* modo frequência: ecrã cheio, distração zero, também sem navbar */}
        <Route path="/frequencia" element={<Frequencia />} />

        {/* páginas principais — com navbar */}
        <Route path="/dashboard" element={<NavBar><Dashboard /></NavBar>} />
        <Route path="/horario" element={<NavBar><Horario /></NavBar>} />
        <Route path="/cadeiras" element={<NavBar><Cadeiras /></NavBar>} />
        <Route path="/cadeiras/:id" element={<NavBar><Cadeira /></NavBar>} />
        <Route path="/notas" element={<NavBar><Notas /></NavBar>} />
        <Route path="/faltas" element={<NavBar><Faltas /></NavBar>} />
        <Route path="/anotacoes" element={<NavBar><Cadernos /></NavBar>} />
        <Route path="/anotacoes/todas" element={<NavBar><Anotacoes /></NavBar>} />
        <Route path="/anotacoes/caderno/:cadeiraId" element={<NavBar><Caderno /></NavBar>} />
        <Route path="/anotacoes/:id" element={<NavBar><Anotacao /></NavBar>} />
        <Route path="/casos" element={<NavBar><Casos /></NavBar>} />
        <Route path="/casos/:id" element={<NavBar><Caso /></NavBar>} />
        <Route path="/estudo" element={<NavBar><Estudo /></NavBar>} />
        <Route path="/glossario" element={<NavBar><Glossario /></NavBar>} />
        <Route path="/artigos" element={<NavBar><Artigos /></NavBar>} />
        <Route path="/leituras" element={<NavBar><Leituras /></NavBar>} />
        <Route path="/pesquisa" element={<NavBar><Pesquisa /></NavBar>} />
        <Route path="/flashcards" element={<NavBar><Flashcards /></NavBar>} />
        <Route path="/ajuda" element={<NavBar><Ajuda /></NavBar>} />
        <Route path="/tarefas" element={<NavBar><Tarefas /></NavBar>} />
        <Route path="/calendario" element={<NavBar><Calendario /></NavBar>} />
        <Route path="/perfil" element={<NavBar><Perfil /></NavBar>} />
        <Route path="/ferramentas" element={<NavBar><Ferramentas /></NavBar>} />
        <Route path="/fichas/:tipo" element={<NavBar><Fichas /></NavBar>} />
        <Route path="/respirar" element={<NavBar><Respirar /></NavBar>} />
        <Route path="/pares" element={<NavBar><Pares /></NavBar>} />
        <Route path="/prazos" element={<NavBar><Prazos /></NavBar>} />
        <Route path="/modo-exame" element={<NavBar><ModoExame /></NavBar>} />
        <Route path="/topicos-correcao" element={<NavBar><TopicosCorrecaoLista /></NavBar>} />
        <Route path="/topicos-correcao/:id" element={<NavBar><TopicosCorrecao /></NavBar>} />
        <Route path="/mapas-mentais" element={<NavBar><MapasMentaisLista /></NavBar>} />
        <Route path="/mapas-mentais/:id" element={<NavBar><MapaMental /></NavBar>} />
        <Route path="/plano-estudo" element={<NavBar><PlanoEstudo /></NavBar>} />
        <Route path="/definicoes" element={<NavBar><Definicoes /></NavBar>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App