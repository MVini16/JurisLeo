// uma textarea normal com os botões "rever texto" e "significado" por baixo — para qualquer campo onde ela escreve
// onValor recebe o texto novo (em vez do evento), porque a revisão também muda o texto por aqui
import { useRef, useMemo } from 'react';
import RevisaoTexto from './RevisaoTexto.jsx';
import Significado from './Significado.jsx';

export default function TextareaRevista({ value, onValor, ...resto }) {
  const ref = useRef(null);

  // adaptador da textarea para a revisão e o significado: ler e mudar a seleção
  const campo = useMemo(() => ({
    selecao: () => (ref.current ? { inicio: ref.current.selectionStart, fim: ref.current.selectionEnd } : null),
    selecionar: (inicio, fim) => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(inicio, fim);
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },
  }), []);

  return (
    <>
      <textarea ref={ref} value={value} onChange={(e) => onValor(e.target.value)} {...resto} />
      <div className="campo-ferramentas">
        <RevisaoTexto texto={value} setTexto={onValor} campo={campo} />
        <Significado texto={value} campo={campo} />
      </div>
    </>
  );
}
