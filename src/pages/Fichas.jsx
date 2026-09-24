// fichas de qualquer tipo (jurisprudência, erros, perguntas, checklists, portfólio, estágio, contactos)
// a lista de campos vem de data/fichas.js; esta página serve todos os tipos
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFichas } from '../hooks/useFichas.js';
import { tipoDeFicha } from '../data/fichas.js';
import { fichaVazia, validarFicha, filtrarFichas, passosDaChecklist } from '../services/fichas.js';
import { cadeirasS1 } from '../data/dadosLeonor.js';
import { dataDeChave, dataCurta } from '../services/datas.js';
import { chaveData } from '../data/feriados.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import Carregando from '../components/animacoes/Carregando.jsx';
import Toast from '../components/Toast.jsx';
import './Ferramentas.css';
import TextareaRevista from '../components/TextareaRevista.jsx';

function valorLegivel(campo, valor) {
  if (!valor) return '';
  if (campo.tipo === 'data') return dataCurta(dataDeChave(valor));
  if (campo.tipo === 'cadeira') return cadeirasS1.find((c) => c.id === valor)?.abrev || '';
  return valor;
}

function Campo({ campo, valor, erro, onMudar }) {
  const id = `fx-${campo.id}`;
  return (
    <div className="fx-campo">
      <label htmlFor={id}>{campo.rotulo}{campo.obrigatorio ? ' *' : ''}</label>
      {campo.tipo === 'longo' && <TextareaRevista id={id} rows={3} value={valor} placeholder={campo.dica} onValor={onMudar} />}
      {campo.tipo === 'texto' && <input id={id} type="text" value={valor} placeholder={campo.dica} onChange={(e) => onMudar(e.target.value)} />}
      {campo.tipo === 'data' && <input id={id} type="date" value={valor} onChange={(e) => onMudar(e.target.value)} />}
      {campo.tipo === 'escolha' && (
        <select id={id} value={valor} onChange={(e) => onMudar(e.target.value)}>
          <option value="">—</option>
          {campo.opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {campo.tipo === 'cadeira' && (
        <select id={id} value={valor} onChange={(e) => onMudar(e.target.value)}>
          <option value="">—</option>
          {cadeirasS1.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      )}
      {erro && <p className="fx-erro" role="alert">{erro}</p>}
    </div>
  );
}

export default function Fichas() {
  const { tipo: tipoId } = useParams();
  const tipo = tipoDeFicha(tipoId);
  const { fichas, loading, adicionar, atualizar, apagar } = useFichas(tipoId);
  const [texto, setTexto] = useState('');
  const [cadeiraId, setCadeiraId] = useState('todas');
  const [edicao, setEdicao] = useState(null); // { id, dados } | null
  const [erros, setErros] = useState({});
  const [aGuardar, setAGuardar] = useState(false);
  const [apagarPendente, setApagarPendente] = useState(false);
  const [toast, setToast] = useState(null);

  if (!tipo) {
    return (
      <div className="fx-pagina">
        <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />
        <EstadoVazio titulo="Não encontrei esta ferramenta." texto="Volta às ferramentas e escolhe outra." />
      </div>
    );
  }

  const temCadeira = tipo.campos.some((c) => c.tipo === 'cadeira');
  const hojeChave = chaveData(new Date());
  const visiveis = filtrarFichas(fichas, { texto, cadeiraId });

  function abrir(ficha) {
    setErros({});
    setApagarPendente(false);
    setEdicao(ficha ? { id: ficha.id, dados: { ...fichaVazia(tipoId), ...ficha } } : { id: null, dados: fichaVazia(tipoId) });
  }

  async function guardar() {
    const e = validarFicha(tipoId, edicao.dados);
    setErros(e);
    if (Object.keys(e).length) return;
    setAGuardar(true);
    try {
      if (edicao.id) await atualizar(edicao.id, edicao.dados);
      else await adicionar(edicao.dados);
      setEdicao(null);
    } finally {
      setAGuardar(false);
    }
  }

  async function confirmarApagar() {
    if (!apagarPendente) { setApagarPendente(true); return; }
    const guardada = edicao.dados;
    await apagar(edicao.id);
    setEdicao(null);
    // um toque a mais não pode custar uma ficha: seis segundos para desfazer
    setToast({ mensagem: 'Ficha apagada.', acao: { texto: 'Desfazer', fn: () => adicionar(guardada) } });
  }

  // formulário
  if (edicao) {
    return (
      <div className="fx-pagina">
        <button type="button" className="botao-voltar no-print" onClick={() => setEdicao(null)}>‹ Voltar à lista</button>
        <h1 className="fx-titulo">{edicao.id ? 'Editar' : 'Nova'} · {tipo.nome}</h1>
        {tipo.aviso && <p className="fx-aviso">{tipo.aviso}</p>}
        {tipo.campos.map((campo) => (
          <Campo
            key={campo.id}
            campo={campo}
            valor={edicao.dados[campo.id] ?? ''}
            erro={erros[campo.id]}
            onMudar={(v) => setEdicao((e) => ({ ...e, dados: { ...e.dados, [campo.id]: v } }))}
          />
        ))}
        <div className="fx-acoes">
          <button type="button" className="fx-botao fx-botao--principal" onClick={guardar} disabled={aGuardar}>{aGuardar ? 'A guardar...' : 'Guardar'}</button>
          <button type="button" className="fx-botao" onClick={() => setEdicao(null)}>Cancelar</button>
          {edicao.id && (
            <button type="button" className="fx-botao fx-botao--perigo" onClick={confirmarApagar}>{apagarPendente ? 'Toca outra vez para apagar' : 'Apagar'}</button>
          )}
        </div>
      </div>
    );
  }

  // lista
  return (
    <div className="fx-pagina">
      <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />
      <header className="fx-cabecalho">
        <div>
          <h1 className="fx-titulo">{tipo.nome}</h1>
          <p className="fx-sub">{tipo.descricao}</p>
        </div>
        <button type="button" className="fx-botao fx-botao--principal" onClick={() => abrir(null)}>+ Nova</button>
      </header>
      {tipo.aviso && <p className="fx-aviso">{tipo.aviso}</p>}

      {fichas.length > 0 && (
        <>
          <input className="fx-pesquisa" type="search" placeholder="Pesquisar..." value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Pesquisar" />
          {temCadeira && (
            <div className="fx-chips" role="group" aria-label="Filtrar por cadeira">
              <button type="button" className={`fx-chip ${cadeiraId === 'todas' ? 'ativo' : ''}`} onClick={() => setCadeiraId('todas')}>Todas</button>
              {cadeirasS1.map((c) => (
                <button key={c.id} type="button" className={`fx-chip ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>{c.abrev}</button>
              ))}
            </div>
          )}
        </>
      )}

      {loading && <Carregando texto="A carregar..." />}
      {!loading && fichas.length === 0 && <EstadoVazio titulo={tipo.vazio} acao={{ texto: '+ Criar a primeira', fn: () => abrir(null) }} />}
      {!loading && fichas.length > 0 && visiveis.length === 0 && <p className="fx-vazio">Nada encontrado com esse filtro.</p>}

      <ul className="fx-lista">
        {visiveis.map((f) => {
          const meta = tipo.resumo.map((id) => valorLegivel(tipo.campos.find((c) => c.id === id), f[id])).filter(Boolean);
          const cadeira = cadeirasS1.find((c) => c.id === f.cadeiraId);
          const previa = tipo.campos.find((c) => c.tipo === 'longo' && c.id !== 'passos' && f[c.id]);
          const passos = tipo.id === 'checklists' ? passosDaChecklist(f) : [];
          const atrasado = tipo.id === 'contactos' && f.voltarFalar && f.voltarFalar <= hojeChave;
          return (
            <li key={f.id}>
              <button type="button" className="fx-cartao" onClick={() => abrir(f)}>
                <span className="fx-cartao__titulo">{f.titulo}</span>
                <span className="fx-cartao__meta">
                  {cadeira && <i className="fx-ponto" style={{ background: cadeira.cor }} />}
                  {[cadeira?.abrev, ...meta].filter(Boolean).join(' · ')}
                  {atrasado && <b className="fx-alerta"> · voltar a falar</b>}
                </span>
                {passos.length > 0 && <span className="fx-cartao__previa">{passos.length} {passos.length === 1 ? 'passo' : 'passos'}: {passos.slice(0, 3).join(', ')}{passos.length > 3 ? '...' : ''}</span>}
                {previa && <span className="fx-cartao__previa">{f[previa.id]}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {toast && <Toast mensagem={toast.mensagem} acao={toast.acao} duracao={6000} onFechar={() => setToast(null)} />}
    </div>
  );
}
