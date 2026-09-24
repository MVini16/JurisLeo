// uma textarea normal com o botão "rever texto" por baixo — para qualquer campo onde ela escreve
// onValor recebe o texto novo (em vez do evento), porque a revisão também muda o texto por aqui
import { useRef } from 'react';
import RevisaoTexto from './RevisaoTexto.jsx';

export default function TextareaRevista({ value, onValor, ...resto }) {
  const campo = useRef(null);
  return (
    <>
      <textarea ref={campo} value={value} onChange={(e) => onValor(e.target.value)} {...resto} />
      <RevisaoTexto texto={value} setTexto={onValor} campoRef={campo} />
    </>
  );
}
