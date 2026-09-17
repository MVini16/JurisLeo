// frase carinhosa contextual — usa o banco de frases originais
import { useFrase } from '../hooks/useFrase.js';
import './MensagemCarinhosa.css';

export default function MensagemCarinhosa({ contexto = 'geral' }) {
  const frase = useFrase(contexto);
  if (!frase) return null;
  return <p className="mensagem-carinhosa">{frase}</p>;
}
