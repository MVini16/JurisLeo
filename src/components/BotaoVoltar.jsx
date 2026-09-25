// botão de voltar consistente, para todas as páginas fora dos separadores principais
import { useNavigate } from 'react-router-dom';
import './BotaoVoltar.css';

// com destino, substitui a página atual no histórico: o gesto de voltar do iphone
// não traz de novo a página que ela acabou de fechar
export default function BotaoVoltar({ destino, texto = '‹ Voltar' }) {
  const navigate = useNavigate();
  return (
    <button className="botao-voltar no-print" onClick={() => (destino ? navigate(destino, { replace: true }) : navigate(-1))}>
      {texto}
    </button>
  );
}
