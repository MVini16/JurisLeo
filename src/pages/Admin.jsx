// consola do vini (/admin): os resumos que a leonor decidiu mandar-lhe. nada é lido da conta dela:
// ela manda o texto (Definições, Os meus dados, Partilhar com o Vini) e o vini cola-o aqui
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CABECALHO_NOTIFICACOES, lerSubscricao } from '../services/notificacoes.js';
import { apagarResumo, colarResumo, lerResumos } from '../services/armazemResumos.js';
import './Admin.css';

const CAMPOS = [['Estudo', 'estudo'], ['Jogos', 'jogos'], ['Recordes', 'recordes'], ['Tarefas', 'tarefas'], ['Como estava', 'estado']];

function Campo({ rotulo, valor }) {
  return (
    <div className="admin-campo">
      <small>{rotulo}</small>
      <span>{valor ?? 'não partilhado'}</span>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [resumos, setResumos] = useState(() => lerResumos());
  const [escolhido, setEscolhido] = useState(0);
  const [texto, setTexto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [codigoPush, setCodigoPush] = useState('');

  const recente = resumos[0];
  const aberto = resumos[Math.min(escolhido, resumos.length - 1)];

  function colar(e) {
    e.preventDefault();
    // o código das notificações dela não é um resumo: mostra-se para copiares para o segredo do github
    if (texto.includes(CABECALHO_NOTIFICACOES)) {
      const sub = lerSubscricao(texto);
      if (!sub) { setMensagem('Este código das notificações está incompleto. Pede-lhe que o mande outra vez.'); return; }
      setCodigoPush(JSON.stringify(sub));
      setTexto('');
      setMensagem('Código das notificações lido. Copia-o para o segredo PUSH_SUBSCRIPTION no GitHub.');
      return;
    }
    const r = colarResumo(texto);
    if (!r.ok) { setMensagem('Isto não parece um resumo do JurisLeo. Cola o texto todo, começa em "Resumo do JurisLeo".'); return; }
    setResumos(r.lista);
    setEscolhido(0);
    setTexto('');
    setMensagem('Resumo guardado.');
  }

  function apagar(id) {
    setResumos(apagarResumo(id));
    setEscolhido(0);
  }

  return (
    <div className="admin">
      <button type="button" className="admin-voltar" onClick={() => navigate('/dashboard')}>‹ Voltar</button>
      <header className="admin-topo">
        <h1>Consola do Vini</h1>
        <p>Aqui aparece só o que a Leonor decidir mandar-te. Ela escolhe o que partilha e quando.</p>
      </header>

      <nav className="admin-atalhos" aria-label="Outras consolas">
        <button type="button" onClick={() => navigate('/admin/boneco')}>Frases do boneco</button>
      </nav>

      <section className="admin-cartoes" aria-label="Último resumo">
        <div className="admin-cartao"><small>Última partilha</small><b>{recente ? recente.quando : 'ainda nenhuma'}</b></div>
        <div className="admin-cartao"><small>Estudo</small><b>{recente?.estudo ?? 'não partilhado'}</b></div>
        <div className="admin-cartao"><small>Jogos</small><b>{recente?.jogos ?? 'não partilhado'}</b></div>
        <div className="admin-cartao"><small>Tarefas</small><b>{recente?.tarefas ?? 'não partilhado'}</b></div>
        <div className="admin-cartao"><small>Como estava</small><b>{recente?.estado ?? 'não partilhado'}</b></div>
      </section>

      <form className="admin-colar" onSubmit={colar}>
        <label htmlFor="admin-texto">Colar um resumo que ela te mandou</label>
        <textarea id="admin-texto" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Resumo do JurisLeo&#10;Quando: ..." />
        <div className="admin-colar__linha">
          <button type="submit" disabled={!texto.trim()}>Guardar resumo</button>
          {mensagem && <span role="status">{mensagem}</span>}
        </div>
      </form>

      {codigoPush && (
        <section className="admin-colar" aria-label="Código das notificações">
          <label htmlFor="admin-push">Código das notificações dela</label>
          <textarea id="admin-push" rows={3} readOnly value={codigoPush} onFocus={(e) => e.target.select()} />
          <small>No GitHub, em Settings, Secrets and variables, Actions, cria o segredo PUSH_SUBSCRIPTION com este texto.</small>
        </section>
      )}

      {resumos.length === 0 ? (
        <p className="admin-vazio">Ainda não recebeste nenhum resumo. Ela decide quando e o que partilha, nas Definições dela.</p>
      ) : (
        <section className="admin-duas" aria-label="Resumos recebidos">
          <ul className="admin-lista">
            {resumos.map((r, i) => (
              <li key={r.id}>
                <button type="button" className="admin-item" aria-current={i === Math.min(escolhido, resumos.length - 1)} onClick={() => setEscolhido(i)}>
                  <b>{r.quando}</b>
                  <small>{CAMPOS.filter(([, k]) => r[k]).map(([n]) => n.toLowerCase()).join(', ') || 'sem detalhes'}</small>
                </button>
              </li>
            ))}
          </ul>
          {aberto && (
            <article className="admin-detalhe">
              <h2>{aberto.quando}</h2>
              {CAMPOS.map(([nome, chave]) => <Campo key={chave} rotulo={nome} valor={aberto[chave]} />)}
              <button type="button" className="admin-apagar" onClick={() => apagar(aberto.id)}>Apagar este resumo</button>
            </article>
          )}
        </section>
      )}
    </div>
  );
}
