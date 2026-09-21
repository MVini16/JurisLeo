// perfil — dados académicos, preferências e logout
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { logout } from '../services/auth.js';
import { useTheme } from '../context/useTheme.js';
import PerfilEstudo from '../components/PerfilEstudo.jsx';
import './Perfil.css';

export default function Perfil() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [aSair, setASair] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'perfil', 'dados'), (snap) => {
      setPerfil(snap.data() || null);
    });
    return () => unsub();
  }, []);

  async function sair() {
    setASair(true);
    await logout();
    navigate('/login');
  }

  const email = getAuth().currentUser?.email;

  return (
    <div className={`perfil-pagina ${darkMode ? 'dark' : ''}`}>
      <button type="button" className="perfil-definicoes" onClick={() => navigate('/definicoes')} aria-label="Definições">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      </button>

      <header className="perfil-header">
        <div className="perfil-avatar">{(perfil?.nome || 'L').charAt(0).toUpperCase()}</div>
        <h1 className="perfil-nome">{perfil?.nome || 'Leonor'}</h1>
        <p className="perfil-email">{email}</p>
      </header>

      <PerfilEstudo />

      <section className="perfil-seccao">
        <h2 className="perfil-seccao__titulo">Dados académicos</h2>
        <LinhaInfo label="Curso" valor={perfil?.curso} />
        <LinhaInfo label="Ano" valor={perfil?.ano} />
        <LinhaInfo label="Turma" valor={perfil?.turma} />
        <LinhaInfo label="Subturma" valor={perfil?.subturma} />
        <LinhaInfo label="Ano letivo" valor={perfil?.anoLetivo} />
      </section>

      <button className="perfil-btn-sair" onClick={sair} disabled={aSair}>
        {aSair ? 'A sair...' : 'Terminar sessão'}
      </button>
    </div>
  );
}

function LinhaInfo({ label, valor }) {
  return (
    <div className="perfil-linha">
      <span className="perfil-linha__label">{label}</span>
      <span className="perfil-linha__valor">{valor || '—'}</span>
    </div>
  );
}
