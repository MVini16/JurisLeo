// erro de um serviço de fora (tempo, correção...), no tom tranquilo de errosApi.js, com "explicar"
import { useState } from 'react';
import { mensagemDeErro } from '../data/errosApi.js';
import './CaixaErroApi.css';

export default function CaixaErroApi({ erro, tentarDepois }) {
  const [aberta, setAberta] = useState(false);
  const mensagem = mensagemDeErro(erro, tentarDepois);
  return (
    <div className="erro-api">
      <strong className="erro-api__titulo">{mensagem.titulo}</strong>
      <span className="erro-api__texto">{mensagem.texto}</span>
      <button type="button" className="erro-api__botao" onClick={() => setAberta((a) => !a)} aria-expanded={aberta}>
        {aberta ? 'Fechar' : 'Explicar'}
      </button>
      {aberta && <p className="erro-api__explicacao">{mensagem.explicacao}</p>}
    </div>
  );
}
