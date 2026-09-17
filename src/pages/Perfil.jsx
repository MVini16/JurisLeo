// perfil — dados académicos, preferências e logout
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { logout } from '../services/auth.js';
import { limparCadeirasAntigas, seedCadeiras } from '../services/initFirestore.js';
import { exportarDadosComoFicheiro } from '../services/exportar.js';
import { useTheme } from '../context/useTheme.js';
import './Perfil.css';

export default function Perfil() {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [aSair, setASair] = useState(false);
  const [aRepor, setARepor] = useState(false);
  const [reposto, setReposto] = useState(false);
  const [aExportar, setAExportar] = useState(false);

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

  // repara contas de teste criadas antes da correção do seed para o 2.º ano —
  // apaga as cadeiras do 1.º ano e recria as 5 reais
  async function reporCadeiras() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    setARepor(true);
    await limparCadeirasAntigas(userId);
    await seedCadeiras(userId);
    setARepor(false);
    setReposto(true);
  }

  // volta a mostrar o tutorial do dashboard na próxima vez que lá entrar
  async function reverTutorial() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await setDoc(doc(db, 'users', userId, 'perfil', 'dados'), { tutorialFeito: false }, { merge: true });
    navigate('/dashboard');
  }

  // descarrega uma cópia de segurança de todos os dados, em json
  async function exportarDados() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    setAExportar(true);
    try {
      await exportarDadosComoFicheiro(userId);
    } finally {
      setAExportar(false);
    }
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
        <button className="perfil-btn-tutorial" onClick={reverTutorial}>Rever o tutorial</button>
      </section>

      <section className="perfil-seccao">
        <h2 className="perfil-seccao__titulo">Os teus dados</h2>
        <p className="perfil-manutencao-texto">
          Descarrega uma cópia de segurança de tudo — cadeiras, notas, faltas, anotações, casos e mais — num ficheiro.
        </p>
        <button className="perfil-btn-reparar" onClick={exportarDados} disabled={aExportar}>
          {aExportar ? 'A preparar...' : '⬇ Exportar os meus dados'}
        </button>
      </section>

      <section className="perfil-seccao">
        <h2 className="perfil-seccao__titulo">Manutenção</h2>
        <p className="perfil-manutencao-texto">
          Se esta conta ainda tem as cadeiras antigas do 1.º ano, repõe as 5 cadeiras reais do 2.º ano.
        </p>
        <button className="perfil-btn-reparar" onClick={reporCadeiras} disabled={aRepor}>
          {aRepor ? 'A repor...' : reposto ? '✓ Cadeiras repostas' : 'Repor cadeiras do 2.º ano'}
        </button>
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
