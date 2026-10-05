import './App.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// entrada da app — carregada logo; as restantes páginas só descarregam quando a rota abre
import SplashScreen from './pages/SplashScreen'
import Login from './pages/Login'
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Horario = lazy(() => import('./pages/Horario'))
const Cadeiras = lazy(() => import('./pages/Cadeiras'))
const Cadeira = lazy(() => import('./pages/Cadeira'))
const Anotacoes = lazy(() => import('./pages/Anotacoes'))
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
// componente de navegação — vai envolver todas as páginas principais
import NavBar from './components/NavBar'

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
      <Routes>
        {/* páginas sem navbar — entrada da app */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* páginas principais — com navbar */}
        <Route path="/dashboard" element={<NavBar><Dashboard /></NavBar>} />
        <Route path="/horario" element={<NavBar><Horario /></NavBar>} />
        <Route path="/cadeiras" element={<NavBar><Cadeiras /></NavBar>} />
        <Route path="/cadeiras/:id" element={<NavBar><Cadeira /></NavBar>} />
        <Route path="/anotacoes" element={<NavBar><Anotacoes /></NavBar>} />
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
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App