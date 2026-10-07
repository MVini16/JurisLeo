// botão para alternar entre a app normal e o modo social (feed vertical); a escolha fica neste telemóvel
import { useNavigate } from 'react-router-dom';
import { usePreferencias } from '../../hooks/usePreferencias.js';
import { guardarPreferencias } from '../../services/preferenciasBrincadeiras.js';
import Icone from '../icones/Icone.jsx';
import './AlternarModo.css';

export default function AlternarModo({ className = '', compacto = false }) {
  const prefs = usePreferencias();
  const navigate = useNavigate();
  const social = prefs.modoApp === 'social';

  function alternar() {
    guardarPreferencias({ modoApp: social ? 'normal' : 'social' });
    navigate(social ? '/dashboard' : '/feed');
  }

  return (
    <button type="button" className={`alt-modo ${social ? 'social' : ''} ${compacto ? 'compacto' : ''} ${className}`} onClick={alternar} aria-pressed={social}
      aria-label={social ? 'Voltar à app normal' : 'Mudar para o modo Feed'}>
      <Icone nome={social ? 'inicio' : 'feed'} tamanho={compacto ? 18 : 20} />
      {!compacto && <span>{social ? 'App normal' : 'Modo Feed'}</span>}
    </button>
  );
}
