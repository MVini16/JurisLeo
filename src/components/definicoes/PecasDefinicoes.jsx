// as peças das definições: grupo com título, linha (navegação, interruptor, opção, informação),
// cabeçalho de subpágina e a confirmação em folha. todas partilham o mesmo desenho
import { useState } from 'react';
import IconeDefinicao from './IconeDefinicao.jsx';
import './Definicoes.css';

export function GrupoDefinicoes({ titulo, nota, indice = 0, children }) {
  return (
    <section className="def-grupo" style={{ '--i': indice }}>
      {titulo && <h2 className="def-grupo__titulo">{titulo}</h2>}
      <div className="def-cartao">{children}</div>
      {nota && <p className="def-grupo__nota">{nota}</p>}
    </section>
  );
}

// tipo: 'link' (abre algo, com seta), 'acao' (faz algo), 'interruptor', 'opcao' (uma de várias) ou 'info'
export function LinhaDefinicao({ tipo = 'link', icone, amostraFolha, rotulo, descricao, valor, ligado, marcada, perigo, desativado, ocupado, aoClicar }) {
  const conteudo = (
    <>
      {icone && <span className="def-linha__icone"><IconeDefinicao nome={icone} /></span>}
      {amostraFolha && <span className="def-amostra" data-folha={amostraFolha} aria-hidden="true" />}
      <span className="def-linha__texto">
        <span className="def-linha__rotulo">{rotulo}</span>
        {descricao && <span className="def-linha__descricao">{descricao}</span>}
      </span>
      {valor && <span className="def-linha__valor">{valor}</span>}
      {ocupado && <span className="def-linha__ocupado" aria-hidden="true" />}
      {tipo === 'link' && <span className="def-linha__seta"><IconeDefinicao nome="seta" tamanho={18} /></span>}
      {tipo === 'interruptor' && <span className={`def-interruptor ${ligado ? 'ligado' : ''}`} aria-hidden="true"><i /></span>}
      {tipo === 'opcao' && <span className={`def-visto ${marcada ? 'marcada' : ''}`} aria-hidden="true"><IconeDefinicao nome="visto" tamanho={18} /></span>}
    </>
  );

  if (tipo === 'info') return <div className="def-linha def-linha--info">{conteudo}</div>;

  return (
    <button
      className={`def-linha ${perigo ? 'def-linha--perigo' : ''}`}
      role={tipo === 'interruptor' ? 'switch' : tipo === 'opcao' ? 'radio' : undefined}
      aria-checked={tipo === 'interruptor' ? !!ligado : tipo === 'opcao' ? !!marcada : undefined}
      disabled={desativado || ocupado}
      onClick={aoClicar}
    >
      {conteudo}
    </button>
  );
}

export function CabecalhoSecao({ titulo, aoVoltar }) {
  return (
    <header className="def-cabecalho">
      <button className="def-cabecalho__voltar" onClick={aoVoltar} aria-label="Voltar às definições"><IconeDefinicao nome="voltar" tamanho={24} /></button>
      <h1 className="def-cabecalho__titulo">{titulo}</h1>
      <span className="def-cabecalho__espaco" />
    </header>
  );
}

// a pergunta antes de uma ação séria; `marcar` obriga a uma caixa marcada para poder confirmar
export function ConfirmarDefinicao({ titulo, texto, rotuloConfirmar, perigo, marcar, aoConfirmar, aoCancelar }) {
  const [marcado, setMarcado] = useState(false);
  const bloqueado = !!marcar && !marcado;
  return (
    <div className="def-fundo" onClick={aoCancelar}>
      <div className="def-folha" role="alertdialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        {perigo && <span className="def-folha__aviso"><IconeDefinicao nome="aviso" tamanho={26} /></span>}
        <h2 className="def-folha__titulo">{titulo}</h2>
        <p className="def-folha__texto">{texto}</p>
        {marcar && (
          <label className="def-folha__marcar">
            <input type="checkbox" checked={marcado} onChange={(e) => setMarcado(e.target.checked)} />
            <span>{marcar}</span>
          </label>
        )}
        <div className="def-folha__botoes">
          <button className="def-botao" onClick={aoCancelar}>Cancelar</button>
          <button className={`def-botao def-botao--principal ${perigo ? 'def-botao--perigo' : ''}`} disabled={bloqueado} onClick={aoConfirmar}>{rotuloConfirmar}</button>
        </div>
      </div>
    </div>
  );
}
