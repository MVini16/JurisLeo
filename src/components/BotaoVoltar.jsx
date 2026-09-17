// botão de voltar consistente, para todas as páginas fora dos separadores principais
import { useNavigate } from 'react-router-dom';
import './BotaoVoltar.css';

export default function BotaoVoltar({ destino, texto = '‹ Voltar' }) {
  const navigate = useNavigate();
  return (
    <button className="botao-voltar no-print" onClick={() => (destino ? navigate(destino) : navigate(-1))}>
      {texto}
    </button>
  );
}
