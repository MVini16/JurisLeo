// pesquisa global — cadeiras, tarefas, anotações, casos, artigos, glossário, leituras
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useTarefas } from '../hooks/useTarefas.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import { useCasos } from '../hooks/useCasos.js';
import { useArtigos } from '../hooks/useArtigos.js';
import { useGlossario } from '../hooks/useGlossario.js';
import { useLeituras } from '../hooks/useLeituras.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import { cadeirasS1, coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import './Pesquisa.css';

function contemTexto(alvo, termo) {
  return (alvo || '').toLowerCase().includes(termo);
}

export default function Pesquisa() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [termo, setTermo] = useState('');

  const { tarefas } = useTarefas();
  const { anotacoes } = useAnotacoes();
  const { casos } = useCasos();
  const { artigos } = useArtigos();
  const { termos } = useGlossario();
  const { leituras } = useLeituras();

  const q = termo.trim().toLowerCase();
  const aPesquisar = q.length > 0;

  const resultados = !aPesquisar ? null : {
    cadeiras: cadeirasS1.filter((c) => contemTexto(c.nome, q) || contemTexto(c.abrev, q) || contemTexto(c.regente, q)),
    tarefas: tarefas.filter((t) => contemTexto(t.titulo, q) || contemTexto(t.notas, q)),
    anotacoes: anotacoes.filter((a) => contemTexto(a.titulo, q) || contemTexto(a.conteudo, q) || (a.tags || []).some((tag) => contemTexto(tag, q))),
    casos: casos.filter((c) => contemTexto(c.titulo, q) || contemTexto(c.enunciado, q)),
    artigos: artigos.filter((a) => contemTexto(a.numero, q) || contemTexto(a.epigrafe, q) || contemTexto(a.notaPessoal, q)),
    termos: termos.filter((t) => contemTexto(t.termo, q) || contemTexto(t.significado, q)),
    leituras: leituras.filter((l) => contemTexto(l.manual, q) || contemTexto(l.autor, q)),
  };

  const totalResultados = resultados
    ? Object.values(resultados).reduce((soma, lista) => soma + lista.length, 0)
    : 0;

  return (
    <div className={`pesquisa-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/cadeiras" />
      <h1 className="pesquisa-titulo">Pesquisa</h1>

      <input
        className="pesquisa-input"
        type="text"
        placeholder="Pesquisar em tudo..."
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        autoFocus
      />

      {!aPesquisar && <p className="pesquisa-dica">Escreve para pesquisares em cadeiras, tarefas, anotações, casos, artigos, glossário e leituras.</p>}

      {aPesquisar && totalResultados === 0 && <p className="pesquisa-dica">Nada encontrado para "{termo}".</p>}

      {aPesquisar && (
        <div className="pesquisa-resultados">
          {resultados.cadeiras.length > 0 && (
            <Grupo titulo="Cadeiras">
              {resultados.cadeiras.map((c) => (
                <Resultado key={c.id} cor={c.cor} etiqueta={c.abrev} titulo={c.nome} subtitulo={c.regente} onClick={() => navigate(`/cadeiras/${c.id}`)} />
              ))}
            </Grupo>
          )}

          {resultados.tarefas.length > 0 && (
            <Grupo titulo="Tarefas">
              {resultados.tarefas.map((t) => (
                <Resultado key={t.id} cor={coresCadeiras[t.cadeira]} etiqueta={abrevCadeiras[t.cadeira] || '—'} titulo={t.titulo} subtitulo={t.notas} onClick={() => navigate('/tarefas')} />
              ))}
            </Grupo>
          )}

          {resultados.anotacoes.length > 0 && (
            <Grupo titulo="Anotações">
              {resultados.anotacoes.map((a) => (
                <Resultado key={a.id} cor={coresCadeiras[a.cadeiraId]} etiqueta={abrevCadeiras[a.cadeiraId] || '—'} titulo={a.titulo} subtitulo={(a.conteudo || '').slice(0, 80)} onClick={() => navigate(`/anotacoes/${a.id}`)} />
              ))}
            </Grupo>
          )}

          {resultados.casos.length > 0 && (
            <Grupo titulo="Casos Práticos">
              {resultados.casos.map((c) => (
                <Resultado key={c.id} cor={coresCadeiras[c.cadeiraId]} etiqueta={abrevCadeiras[c.cadeiraId] || '—'} titulo={c.titulo} subtitulo={(c.enunciado || '').slice(0, 80)} onClick={() => navigate(`/casos/${c.id}`)} />
              ))}
            </Grupo>
          )}

          {resultados.artigos.length > 0 && (
            <Grupo titulo="Artigos">
              {resultados.artigos.map((a) => (
                <Resultado key={a.id} cor="#4A6670" etiqueta={`Art. ${a.numero} ${a.codigo}`} titulo={a.epigrafe || 'Sem epígrafe'} subtitulo={a.notaPessoal} onClick={() => navigate('/artigos')} />
              ))}
            </Grupo>
          )}

          {resultados.termos.length > 0 && (
            <Grupo titulo="Glossário">
              {resultados.termos.map((t) => (
                <Resultado key={t.id} cor={coresCadeiras[t.cadeiraId]} etiqueta={abrevCadeiras[t.cadeiraId] || '—'} titulo={t.termo} subtitulo={t.significado} onClick={() => navigate('/glossario')} />
              ))}
            </Grupo>
          )}

          {resultados.leituras.length > 0 && (
            <Grupo titulo="Leituras">
              {resultados.leituras.map((l) => (
                <Resultado key={l.id} cor={coresCadeiras[l.cadeiraId]} etiqueta={abrevCadeiras[l.cadeiraId] || '—'} titulo={l.manual} subtitulo={l.autor} onClick={() => navigate('/leituras')} />
              ))}
            </Grupo>
          )}
        </div>
      )}
    </div>
  );
}

function Grupo({ titulo, children }) {
  return (
    <div className="pesquisa-grupo">
      <h2 className="pesquisa-grupo__titulo">{titulo}</h2>
      <div className="pesquisa-grupo__lista">{children}</div>
    </div>
  );
}

function Resultado({ cor, etiqueta, titulo, subtitulo, onClick }) {
  return (
    <button className="pesquisa-resultado" style={{ '--cor': cor || '#b8963e' }} onClick={onClick}>
      <span className="pesquisa-resultado__etiqueta">{etiqueta}</span>
      <span className="pesquisa-resultado__titulo">{titulo}</span>
      {subtitulo && <span className="pesquisa-resultado__subtitulo">{subtitulo}</span>}
    </button>
  );
}
