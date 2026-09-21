// formulário do registo diário: a manhã é curta (quatro toques), a noite é completa
import { useState } from 'react';
import { CAMPOS_PRINCIPAIS, OPCOES_SONO, ROTULO_TEXTO_LIVRE, MAX_TEXTO, ESCALA5, campoOpcional } from '../data/bemEstar.js';
import { prepararRegisto } from '../services/bemEstar.js';
import './BemEstar.css';

function Escala({ campo, valor, onEscolher }) {
  return (
    <div className="bem-linha" role="radiogroup" aria-label={campo.pergunta}>
      <p className="bem-pergunta">{campo.pergunta}</p>
      <div className="bem-niveis">
        {campo.niveis.map((n) => (
          <button key={n.valor} type="button" role="radio" aria-checked={valor === n.valor} className={`bem-nivel ${valor === n.valor ? 'ativo' : ''}`} onClick={() => onEscolher(n.valor)}>
            <span className="bem-nivel__icone" aria-hidden="true">{n.icone}</span>
            <span className="bem-nivel__texto">{n.texto}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Opcional({ campo, valor, onEscolher }) {
  const opcoes = campo.tipo === 'escala5' ? ESCALA5.map((t, i) => ({ valor: i + 1, texto: t }))
    : campo.tipo === 'simnao' ? ['Sim', 'Não'].map((t) => ({ valor: t, texto: t }))
      : campo.opcoes.map((t) => ({ valor: t, texto: t }));
  return (
    <div className="bem-linha bem-linha--opcional" role="radiogroup" aria-label={campo.pergunta}>
      <p className="bem-pergunta">{campo.pergunta}</p>
      <div className="bem-chips">
        {opcoes.map((o) => (
          <button key={String(o.valor)} type="button" role="radio" aria-checked={valor === o.valor} className={`bem-chip ${valor === o.valor ? 'ativo' : ''}`} onClick={() => onEscolher(valor === o.valor ? '' : o.valor)}>{o.texto}</button>
        ))}
      </div>
    </div>
  );
}

export default function FormBemEstar({ janela, inicial, camposAtivos = [], onGuardar, onCancelar, rotuloGuardar = 'Guardar' }) {
  const [valores, setValores] = useState(() => ({
    humor: inicial?.humor ?? 0,
    energia: inicial?.energia ?? 0,
    motivacao: inicial?.motivacao ?? 0,
    sono: inicial?.sono ?? '',
    texto: inicial?.texto ?? '',
    opcionais: inicial?.opcionais ?? {},
  }));
  const [erro, setErro] = useState('');
  const [aGuardar, setAGuardar] = useState(false);

  const definir = (campo, valor) => setValores((v) => ({ ...v, [campo]: valor }));

  async function submeter(e) {
    e.preventDefault();
    const r = prepararRegisto(janela, valores, camposAtivos);
    if (r.erro) { setErro(r.erro); return; }
    setErro('');
    setAGuardar(true);
    try {
      await onGuardar(r.dados);
    } catch {
      setErro('Não consegui guardar. Tenta outra vez.');
    } finally {
      setAGuardar(false);
    }
  }

  const opcionaisLigados = janela === 'noite' ? camposAtivos.map(campoOpcional).filter(Boolean) : [];

  return (
    <form className="bem-form" onSubmit={submeter}>
      {CAMPOS_PRINCIPAIS.map((c) => <Escala key={c.id} campo={c} valor={valores[c.id]} onEscolher={(v) => definir(c.id, v)} />)}

      {janela === 'manha' && (
        <div className="bem-linha" role="radiogroup" aria-label="Horas de sono">
          <p className="bem-pergunta">Quantas horas dormiste?</p>
          <div className="bem-chips">
            {OPCOES_SONO.map((h) => (
              <button key={h} type="button" role="radio" aria-checked={valores.sono === h} className={`bem-chip ${valores.sono === h ? 'ativo' : ''}`} onClick={() => definir('sono', valores.sono === h ? '' : h)}>{h === OPCOES_SONO[OPCOES_SONO.length - 1] ? `${h} ou mais` : h === OPCOES_SONO[0] ? `${h} ou menos` : h}</button>
            ))}
          </div>
        </div>
      )}

      {janela === 'noite' && (
        <>
          {opcionaisLigados.map((c) => <Opcional key={c.id} campo={c} valor={valores.opcionais[c.id]} onEscolher={(v) => setValores((x) => ({ ...x, opcionais: { ...x.opcionais, [c.id]: v } }))} />)}
          <div className="bem-linha">
            <label className="bem-pergunta" htmlFor="bem-texto">{ROTULO_TEXTO_LIVRE}</label>
            <textarea id="bem-texto" className="bem-texto" rows={3} maxLength={MAX_TEXTO} value={valores.texto} onChange={(e) => definir('texto', e.target.value)} placeholder="Opcional. Uma ou duas linhas chegam." />
            <p className="bem-nota">O Vini lê isto. É uma mensagem para ele, não um diário privado.</p>
          </div>
        </>
      )}

      {erro && <p className="bem-erro" role="alert">{erro}</p>}
      <div className="bem-acoes">
        <button type="submit" className="bem-botao bem-botao--principal" disabled={aGuardar}>{aGuardar ? 'A guardar...' : rotuloGuardar}</button>
        {onCancelar && <button type="button" className="bem-botao" onClick={onCancelar}>Agora não</button>}
      </div>
    </form>
  );
}

