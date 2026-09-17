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
import Anotacoes from './pages/Anotacoes'
import Anotacao from './pages/Anotacao'
import Casos from './pages/Casos'
import Caso from './pages/Caso'
import Estudo from './pages/Estudo'
import Glossario from './pages/Glossario'
import Tarefas from './pages/Tarefas'
import Calendario from './pages/Calendario'
import Perfil from './pages/Perfil'
// componente de navegação — vai envolver todas as páginas principais
import NavBar from './components/NavBar'

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/tarefas" element={<NavBar><Tarefas /></NavBar>} />
        <Route path="/calendario" element={<NavBar><Calendario /></NavBar>} />
        <Route path="/perfil" element={<NavBar><Perfil /></NavBar>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App