// central de ajuda — todos os tópicos num só sítio, para além do botão "?" contextual
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import { ajudaPorRota } from '../data/ajuda.js';
import { GUIA } from '../data/guia.js';
import './Ajuda.css';

// só as rotas "normais" (sem parâmetro), para não mostrar duas vezes o mesmo tópico
const TOPICOS = Object.entries(ajudaPorRota).filter(([rota]) => !rota.includes(':'));

export default function Ajuda() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(null);
  const [zonaAberta, setZonaAberta] = useState(GUIA[0].zona);

  return (
    <div className={`ajuda-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar />
      <header className="ajuda-header">
        <h1 className="ajuda-titulo">Ajuda</h1>
        <p className="ajuda-subtitulo">Um resumo de cada ecrã da app. Também tens o botão "?" em qualquer página, se preferires perguntar ali mesmo.</p>
      </header>

      <section className="ajuda-guia" aria-label="Tudo o que podes fazer">
        <h2 className="ajuda-guia__titulo">Tudo o que podes fazer</h2>
        <p className="ajuda-guia__sub">Cada função da app, por zonas. Toca numa zona para a abrir.</p>
        {GUIA.map((z) => (
          <div key={z.zona} className="ajuda-item">
            <button className="ajuda-item__cabecalho" aria-expanded={zonaAberta === z.zona} onClick={() => setZonaAberta(zonaAberta === z.zona ? null : z.zona)}>
              <span>{z.zona}</span>
              <span className={`ajuda-item__seta ${zonaAberta === z.zona ? 'aberta' : ''}`}>›</span>
            </button>
            {zonaAberta === z.zona && (
              <div className="ajuda-item__corpo">
                <dl className="ajuda-guia__lista">
                  {z.funcoes.map((f) => (
                    <div key={f.nome} className="ajuda-guia__funcao"><dt>{f.nome}</dt><dd>{f.texto}</dd></div>
                  ))}
                </dl>
                <button className="ajuda-item__ir" onClick={() => navigate(z.rota)}>Ir para lá →</button>
              </div>
            )}
          </div>
        ))}
      </section>

      <h2 className="ajuda-guia__titulo ajuda-guia__titulo--ecras">Ajuda de cada ecrã</h2>
      <div className="ajuda-lista">
        {TOPICOS.map(([rota, conteudo]) => (
          <div key={rota} className="ajuda-item">
            <button className="ajuda-item__cabecalho" onClick={() => setAberto(aberto === rota ? null : rota)}>
              <span>{conteudo.titulo}</span>
              <span className={`ajuda-item__seta ${aberto === rota ? 'aberta' : ''}`}>›</span>
            </button>
            {aberto === rota && (
              <div className="ajuda-item__corpo">
                <p className="ajuda-item__texto">{conteudo.texto}</p>
                {conteudo.pontos?.length > 0 && (
                  <ul className="ajuda-item__pontos">
                    {conteudo.pontos.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}
                <button className="ajuda-item__ir" onClick={() => navigate(rota)}>Ir para lá →</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
