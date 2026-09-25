import './App.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// as páginas de entrada carregam logo; as outras só quando ela lá vai (React.lazy),
// para o primeiro arranque não descarregar a app inteira — e o ficheiro principal
// ficar bem abaixo do limite de 2 MB do modo offline
import SplashScreen from './pages/SplashScreen'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Horario = lazy(() => import('./pages/Horario'))
const Cadeiras = lazy(() => import('./pages/Cadeiras'))
const Cadeira = lazy(() => import('./pages/Cadeira'))
const Notas = lazy(() => import('./pages/Notas'))
const Faltas = lazy(() => import('./pages/Faltas'))
const Anotacoes = lazy(() => import('./pages/Anotacoes'))
const Cadernos = lazy(() => import('./pages/Cadernos'))
const Caderno = lazy(() => import('./pages/Caderno'))
const Anotacao = lazy(() => import('./pages/Anotacao'))
const Casos = lazy(() => import('./pages/Casos'))
const Caso = lazy(() => import('./pages/Caso'))
const Estudo = lazy(() => import('./pages/Estudo'))
const Glossario = lazy(() => import('./pages/Glossario'))
const Artigos = lazy(() => import('./pages/Artigos'))
const Leituras = lazy(() => import('./pages/Leituras'))
const Pesquisa = lazy(() => import('./pages/Pesquisa'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const Ajuda = lazy(() => import('./pages/Ajuda'))
const Tarefas = lazy(() => import('./pages/Tarefas'))
const Calendario = lazy(() => import('./pages/Calendario'))
const Perfil = lazy(() => import('./pages/Perfil'))
const Definicoes = lazy(() => import('./pages/Definicoes'))
const Ferramentas = lazy(() => import('./pages/Ferramentas'))
const Fichas = lazy(() => import('./pages/Fichas'))
const Prazos = lazy(() => import('./pages/Prazos'))
const Respirar = lazy(() => import('./pages/Respirar'))
const Consola = lazy(() => import('./pages/Consola'))
const Frequencia = lazy(() => import('./pages/Frequencia'))
const Pares = lazy(() => import('./pages/Pares'))
const ModoExame = lazy(() => import('./pages/ModoExame'))
const TopicosCorrecaoLista = lazy(() => import('./pages/TopicosCorrecaoLista'))
const TopicosCorrecao = lazy(() => import('./pages/TopicosCorrecao'))
const MapasMentaisLista = lazy(() => import('./pages/MapasMentaisLista'))
const MapaMental = lazy(() => import('./pages/MapaMental'))
const PlanoEstudo = lazy(() => import('./pages/PlanoEstudo'))
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
      <Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}>
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
        <Route path="/dashboard" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Dashboard /></Suspense></NavBar>} />
        <Route path="/horario" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Horario /></Suspense></NavBar>} />
        <Route path="/cadeiras" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Cadeiras /></Suspense></NavBar>} />
        <Route path="/cadeiras/:id" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Cadeira /></Suspense></NavBar>} />
        <Route path="/notas" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Notas /></Suspense></NavBar>} />
        <Route path="/faltas" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Faltas /></Suspense></NavBar>} />
        <Route path="/anotacoes" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Cadernos /></Suspense></NavBar>} />
        <Route path="/anotacoes/todas" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Anotacoes /></Suspense></NavBar>} />
        <Route path="/anotacoes/caderno/:cadeiraId" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Caderno /></Suspense></NavBar>} />
        <Route path="/anotacoes/:id" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Anotacao /></Suspense></NavBar>} />
        <Route path="/casos" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Casos /></Suspense></NavBar>} />
        <Route path="/casos/:id" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Caso /></Suspense></NavBar>} />
        <Route path="/estudo" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Estudo /></Suspense></NavBar>} />
        <Route path="/glossario" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Glossario /></Suspense></NavBar>} />
        <Route path="/artigos" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Artigos /></Suspense></NavBar>} />
        <Route path="/leituras" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Leituras /></Suspense></NavBar>} />
        <Route path="/pesquisa" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Pesquisa /></Suspense></NavBar>} />
        <Route path="/flashcards" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Flashcards /></Suspense></NavBar>} />
        <Route path="/ajuda" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Ajuda /></Suspense></NavBar>} />
        <Route path="/tarefas" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Tarefas /></Suspense></NavBar>} />
        <Route path="/calendario" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Calendario /></Suspense></NavBar>} />
        <Route path="/perfil" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Perfil /></Suspense></NavBar>} />
        <Route path="/ferramentas" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Ferramentas /></Suspense></NavBar>} />
        <Route path="/fichas/:tipo" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Fichas /></Suspense></NavBar>} />
        <Route path="/respirar" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Respirar /></Suspense></NavBar>} />
        <Route path="/pares" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Pares /></Suspense></NavBar>} />
        <Route path="/prazos" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Prazos /></Suspense></NavBar>} />
        <Route path="/modo-exame" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><ModoExame /></Suspense></NavBar>} />
        <Route path="/topicos-correcao" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><TopicosCorrecaoLista /></Suspense></NavBar>} />
        <Route path="/topicos-correcao/:id" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><TopicosCorrecao /></Suspense></NavBar>} />
        <Route path="/mapas-mentais" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><MapasMentaisLista /></Suspense></NavBar>} />
        <Route path="/mapas-mentais/:id" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><MapaMental /></Suspense></NavBar>} />
        <Route path="/plano-estudo" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><PlanoEstudo /></Suspense></NavBar>} />
        <Route path="/definicoes" element={<NavBar><Suspense fallback={<Carregando texto="A abrir..." tipo="templo" />}><Definicoes /></Suspense></NavBar>} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App