// importa o css global
import './App.css'
// importa as ferramentas de navegação
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// importa as páginas
import SplashScreen from './pages/SplashScreen'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* rota inicial — splash screen */}
        <Route path="/" element={<SplashScreen />} />
        {/* rota de login */}
        <Route path="/login" element={<Login />} />
        {/* rota de onboarding — primeiro login */}
        <Route path="/onboarding" element={<Onboarding />} />
        {/* rota do dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App