// perfil — dados académicos, preferências e logout
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { logout } from '../services/auth.js';
import { useTheme } from '../context/useTheme.js';
import './Perfil.css';

export default function Perfil() {
  const { darkMode, toggleTheme } = useTheme();
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
      <header className="perfil-header">
        <div className="perfil-avatar">{(perfil?.nome || 'L').charAt(0).toUpperCase()}</div>
        <h1 className="perfil-nome">{perfil?.nome || 'Leonor'}</h1>
        <p className="perfil-email">{email}</p>
      </header>

      <section className="perfil-seccao">
        <h2 className="perfil-seccao__titulo">Dados académicos</h2>
        <LinhaInfo label="Curso" valor={perfil?.curso} />
        <LinhaInfo label="Ano" valor={perfil?.ano} />
        <LinhaInfo label="Turma" valor={perfil?.turma} />
        <LinhaInfo label="Subturma" valor={perfil?.subturma} />
        <LinhaInfo label="Ano letivo" valor={perfil?.anoLetivo} />
      </section>

      <section className="perfil-seccao">
        <h2 className="perfil-seccao__titulo">Preferências</h2>
        <div className="perfil-linha">
          <span className="perfil-linha__label">Tema escuro</span>
          <button className={`perfil-toggle ${darkMode ? 'ativo' : ''}`} onClick={toggleTheme}>
            <span className="perfil-toggle__bolinha" />
          </button>
        </div>
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
