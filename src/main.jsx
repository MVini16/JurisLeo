import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// importa a ligação ao firebase para testar
import { db } from './firebase.js'

// mostra no console se a ligação foi feita
console.log('Firebase ligado:', db)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
