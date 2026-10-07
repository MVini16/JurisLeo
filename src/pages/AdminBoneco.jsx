// consola do vini (/admin/boneco): acrescenta frases ao boneco sem mexer no código.
// as frases ficam neste aparelho e podem ser exportadas para o ficheiro data/boneco.js
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guardarExtras, lerExtras } from '../services/armazemFrases.js';
import {
  CATEGORIAS, LIMITE_FRASE, adicionarFrase, exportarParaCodigo, normalizarExtra, removerFrase, totalDeFrases,
} from '../services/frasesExtra.js';
import './AdminBoneco.css';

function frasesDe(extra, categoria) {
  return categoria.startsWith('respostas.') ? (extra.respostas?.[categoria.slice(10)] ?? []) : (extra[categoria] ?? []);
}

export default function AdminBoneco() {
  const navigate = useNavigate();
  const [extra, setExtra] = useState(() => lerExtras());
  const [categoria, setCategoria] = useState(CATEGORIAS[0].id);
  const [texto, setTexto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [importar, setImportar] = useState('');
  const total = useMemo(() => totalDeFrases(extra), [extra]);

  function mudar(novo) {
    setExtra(novo);
    guardarExtras(novo);
  }

  function juntar(e) {
    e.preventDefault();
    const r = adicionarFrase(extra, categoria, texto);
    if (r.erro) { setMensagem(r.erro); return; }
    mudar(r.extra);
    setTexto('');
    setMensagem('Frase acrescentada.');
  }

  async function copiarCodigo() {
    const codigo = exportarParaCodigo(extra);
    if (!codigo) { setMensagem('Ainda não há frases para exportar.'); return; }
    try {
      await navigator.clipboard.writeText(codigo);
      setMensagem('Copiado. Cola no ficheiro src/data/boneco.js, na lista certa.');
    } catch {
      setMensagem('Não consegui copiar. Seleciona o texto da caixa abaixo e copia à mão.');
    }
  }

  function importarJson() {
    try {
      const lido = normalizarExtra(JSON.parse(importar));
      mudar(lido);
      setImportar('');
      setMensagem(`Importadas ${totalDeFrases(lido)} frases.`);
    } catch {
      setMensagem('Esse texto não é um JSON válido.');
    }
  }

  return (
    <div className="admin-boneco">
      <button type="button" className="admin-boneco__voltar" onClick={() => navigate(-1)}>‹ Voltar</button>
      <h1>Consola do boneco</h1>
      <p className="admin-boneco__nota">
        Acrescenta frases ao boneco. Ficam guardadas só neste aparelho ({total} {total === 1 ? 'frase' : 'frases'}). Para chegarem à Leonor,
        exporta-as e passa-as para o código (ou diz ao Claude para as pôr no ficheiro).
      </p>

      <form onSubmit={juntar} className="admin-boneco__form">
        <label>
          <span>Onde entra</span>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.rotulo}</option>)}
          </select>
        </label>
        <label>
          <span>A frase ({texto.length}/{LIMITE_FRASE})</span>
          <textarea rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: Alô Necas, hoje já bebeste água?" />
        </label>
        <button type="submit" className="admin-boneco__botao">Acrescentar</button>
      </form>
      {mensagem && <p className="admin-boneco__mensagem" role="status">{mensagem}</p>}

      {CATEGORIAS.map((c) => {
        const frases = frasesDe(extra, c.id);
        if (frases.length === 0) return null;
        return (
          <section key={c.id} className="admin-boneco__lista">
            <h2>{c.rotulo} <small>({frases.length})</small></h2>
            <ul>
              {frases.map((f) => (
                <li key={f}>
                  <span>{f}</span>
                  <button type="button" onClick={() => mudar(removerFrase(extra, c.id, f))} aria-label={`Apagar: ${f}`}>Apagar</button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="admin-boneco__exportar">
        <h2>Exportar e importar</h2>
        <button type="button" className="admin-boneco__botao" onClick={copiarCodigo}>Copiar como código</button>
        <textarea readOnly rows={5} value={exportarParaCodigo(extra)} aria-label="Frases em código" />
        <label>
          <span>Importar (JSON)</span>
          <textarea rows={3} value={importar} onChange={(e) => setImportar(e.target.value)} placeholder='{"elogios":["..."]}' />
        </label>
        <button type="button" className="admin-boneco__botao" onClick={importarJson} disabled={!importar.trim()}>Importar</button>
      </section>
    </div>
  );
}
