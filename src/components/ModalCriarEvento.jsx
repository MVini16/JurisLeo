// modal para criar ou editar um evento no calendário
import { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase.js';
import { collection, addDoc, updateDoc, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { cadeirasS1, coresCadeiras } from '../data/dadosLeonor.js';
import { FAMILIAS, familiaDoEvento } from '../data/familias.js';
import { chaveData } from '../data/feriados.js';
import { tarefasEmCadeia, pedeLembretes } from '../services/lembretesProva.js';
import { naEpocaNormal } from '../data/calendarioEscolar.js';
import { detetarChoques, explicarChoque } from '../services/coincidencias.js';
import './ModalCriarEvento.css';
import TextareaRevista from './TextareaRevista.jsx';

// cores por cadeira
const CORES_CADEIRA = coresCadeiras;

// cadeiras disponíveis
const CADEIRAS = cadeirasS1.map((c) => ({ id: c.id, nome: c.abrev }));

// tipos de evento
const TIPOS = [
  { id: 'aula',       nome: 'Aula',        icone: '📚' },
  { id: 'frequencia', nome: 'Frequência',  icone: '⚡' },
  { id: 'oral',       nome: 'Oral',        icone: '🎤' },
  { id: 'exame',      nome: 'Exame',       icone: '📖' },
  { id: 'entrega',    nome: 'Entrega',     icone: '📝' },
  { id: 'outro',      nome: 'Outro',       icone: '📌' },
];

// formata uma data para o input date (yyyy-mm-dd), em hora local —
// nunca por toISOString, que converte para utc e pode mostrar o dia anterior
function formatarData(data) {
  return chaveData(new Date(data));
}

export default function ModalCriarEvento({ onFechar, dataInicial, eventoExistente, tipoInicial, tituloInicial, eventos }) {
  const aEditar = !!eventoExistente;

  // estado do formulário — se receber um evento existente, começa preenchido com os dados dele
  const [form, setForm] = useState(() => {
    if (eventoExistente) {
      const dataEv = eventoExistente.data instanceof Date
        ? eventoExistente.data
        : eventoExistente.data?.toDate?.();
      const dataFimEv = eventoExistente.dataFim instanceof Date
        ? eventoExistente.dataFim
        : eventoExistente.dataFim?.toDate?.();
      return {
        titulo:      eventoExistente.titulo || '',
        familia:     familiaDoEvento(eventoExistente),
        data:        dataEv ? formatarData(dataEv) : formatarData(new Date()),
        dataFim:     dataFimEv ? formatarData(dataFimEv) : '',
        horaInicio:  eventoExistente.horaInicio || '',
        horaFim:     eventoExistente.horaFim || '',
        tipo:        eventoExistente.tipo || 'aula',
        cadeira:     eventoExistente.cadeira || CADEIRAS[0]?.id,
        notas:       eventoExistente.notas || '',
        importancia: eventoExistente.importancia || 'media',
        estado:      eventoExistente.estado || 'pendente',
        contaFalta:  eventoExistente.contaFalta || false,
      };
    }
    return {
      titulo:      tituloInicial || '',
      data:        dataInicial ? formatarData(dataInicial) : formatarData(new Date()),
      dataFim:     '',
      horaInicio:  '',
      horaFim:     '',
      familia:     'faculdade',
      tipo:        tipoInicial || 'aula',
      cadeira:     CADEIRAS[0]?.id,
      notas:       '',
      importancia: 'media',
      estado:      'pendente',
      contaFalta:  false,
      lembretes:   true,
    };
  });

  // fora da faculdade não faz sentido escolher tipo, cadeira ou "conta falta"
  const daFaculdade = form.familia === 'faculdade';

  // aviso de coincidências em tempo real (art. 39.º) — só avisa, nunca bloqueia.
  // só calcula se a página que abriu o modal passou a lista de eventos existentes.
  const avisoChoque = useMemo(() => {
    if (!eventos || !form.data || !form.titulo.trim()) return null;
    const outrosEventos = eventos.filter((ev) => !aEditar || ev.id !== eventoExistente.id);
    const rascunho = { id: '__rascunho__', titulo: form.titulo.trim(), tipo: form.tipo, data: new Date(form.data + 'T00:00:00') };
    const choques = detetarChoques([...outrosEventos, rascunho], { epocaNormal: naEpocaNormal });
    const choqueDoRascunho = choques.find((c) => c.a.id === '__rascunho__' || c.b.id === '__rascunho__');
    return choqueDoRascunho ? explicarChoque(choqueDoRascunho) : null;
  }, [eventos, form.data, form.tipo, form.titulo, aEditar, eventoExistente]);

  // estados da animação
  const [visivel, setVisivel]       = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [sucesso, setSucesso]       = useState(false);
  const [erro, setErro]             = useState('');

  // animação de entrada
  useEffect(() => {
    requestAnimationFrame(() => setVisivel(true));
  }, []);

  // ao marcar uma frequência ou um exame novo, oferece os lembretes de estudo (14, 7 e 2 dias antes)
  const lembretes = !aEditar && daFaculdade && pedeLembretes(form.tipo) && form.data
    ? tarefasEmCadeia({ titulo: form.titulo, cadeira: form.cadeira, dataProva: form.data })
    : [];

  // atualiza um campo do formulário
  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  // fecha o modal com animação de saída
  function fechar() {
    setVisivel(false);
    setTimeout(onFechar, 300);
  }

  // guarda o evento no firestore
  async function guardar() {
    // validação básica
    if (!form.titulo.trim()) {
      setErro('O título é obrigatório.');
      return;
    }
    if (!form.data) {
      setErro('A data é obrigatória.');
      return;
    }
    if (form.dataFim && form.dataFim < form.data) {
      setErro('A data em que termina não pode ser antes da data de início.');
      return;
    }

    setErro('');
    setGuardando(true);

    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Utilizador não autenticado.');

      // converte as datas para timestamp do firestore
      const dataObj = new Date(form.data + 'T' + (form.horaInicio || '00:00') + ':00');
      // só grava dataFim quando é mesmo um evento de vários dias — evita null vs undefined a mais nos documentos antigos
      const dataFimObj = form.dataFim && form.dataFim > form.data ? new Date(form.dataFim + 'T00:00:00') : null;

      // fora da faculdade não há tipo, cadeira nem falta
      const dados = {
        titulo:      form.titulo.trim(),
        familia:     form.familia,
        data:        Timestamp.fromDate(dataObj),
        dataFim:     dataFimObj ? Timestamp.fromDate(dataFimObj) : null,
        horaInicio:  form.horaInicio,
        horaFim:     form.horaFim,
        tipo:        daFaculdade ? form.tipo : 'outro',
        cadeira:     daFaculdade ? form.cadeira : null,
        notas:       form.notas.trim(),
        importancia: form.importancia,
        estado:      form.estado,
        contaFalta:  daFaculdade ? form.contaFalta : false,
      };

      if (aEditar) {
        await updateDoc(doc(db, 'users', userId, 'eventos', eventoExistente.id), dados);
      } else {
        await addDoc(collection(db, 'users', userId, 'eventos'), dados);
        // prazos em cadeia: as tarefas de estudo
        if (form.lembretes) {
          for (const t of lembretes) {
            await addDoc(collection(db, 'users', userId, 'tarefas'), { ...t, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() });
          }
        }
      }

      // animação de sucesso
      setGuardando(false);
      setSucesso(true);
      setTimeout(() => {
        fechar();
      }, 1800);

    } catch {
      setGuardando(false);
      setErro('Erro ao guardar. Tenta outra vez.');
    }
  }

  return (
    <div className={`mce-overlay ${visivel ? 'visivel' : ''}`} onClick={fechar}>
      <div
        className={`mce-modal ${visivel ? 'visivel' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* animação de sucesso — aparece por cima de tudo */}
        {sucesso && (
          <div className="mce-sucesso">
            <div className="mce-sucesso__check">
              <svg viewBox="0 0 52 52">
                <circle className="mce-sucesso__circulo" cx="26" cy="26" r="25" />
                <path className="mce-sucesso__visto" d="M14 27 l8 8 l16-16" />
              </svg>
            </div>
            <p className="mce-sucesso__texto">{aEditar ? 'Evento atualizado!' : 'Evento guardado!'}</p>
            <div className="mce-sucesso__particulas">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="mce-sucesso__particula" style={{ '--i': i }} />
              ))}
            </div>
          </div>
        )}

        {/* header do modal */}
        <div className="mce-header">
          <h3 className="mce-titulo">{aEditar ? 'Editar Evento' : 'Novo Evento'}</h3>
          <button className="mce-fechar" onClick={fechar}>✕</button>
        </div>

        {/* corpo do formulário */}
        <div className="mce-corpo">

          {/* título */}
          <div className="mce-campo mce-campo--1">
            <label className="mce-label">Título *</label>
            <input
              className="mce-input"
              type="text"
              placeholder="Ex: Frequência de TGDC II"
              value={form.titulo}
              onChange={(e) => atualizar('titulo', e.target.value)}
            />
          </div>

          {/* família do evento */}
          <div className="mce-campo mce-campo--1">
            <label className="mce-label">Família</label>
            <div className="mce-familias" role="group" aria-label="Família do evento">
              {FAMILIAS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`mce-familia-chip ${form.familia === f.id ? 'ativo' : ''}`}
                  style={{ '--cor': f.cor }}
                  aria-pressed={form.familia === f.id}
                  onClick={() => atualizar('familia', f.id)}
                >
                  <span className="mce-familia-chip__ponto" />
                  {f.nome}
                </button>
              ))}
            </div>
          </div>

          {/* tipo de evento — só faz sentido para eventos da faculdade */}
          {daFaculdade && (
            <div className="mce-campo mce-campo--3">
              <label className="mce-label">Tipo</label>
              <div className="mce-tipos">
                {TIPOS.map((t) => (
                  <button
                    key={t.id}
                    className={`mce-tipo-btn ${form.tipo === t.id ? 'ativo' : ''}`}
                    onClick={() => atualizar('tipo', t.id)}
                  >
                    <span>{t.icone}</span>
                    <span>{t.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* cadeira — só faz sentido para eventos da faculdade */}
          {daFaculdade && (
            <div className="mce-campo mce-campo--4">
              <label className="mce-label">Cadeira</label>
              <div className="mce-cadeiras">
                {CADEIRAS.map((c) => (
                  <button
                    key={c.id}
                    className={`mce-cadeira-btn ${form.cadeira === c.id ? 'ativo' : ''}`}
                    style={{
                      '--cor': CORES_CADEIRA[c.id],
                      borderColor: form.cadeira === c.id ? CORES_CADEIRA[c.id] : 'transparent',
                      backgroundColor: form.cadeira === c.id ? CORES_CADEIRA[c.id] + '33' : 'rgba(255,255,255,0.05)',
                    }}
                    onClick={() => atualizar('cadeira', c.id)}
                  >
                    {c.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* data e horas */}
          <div className="mce-campo mce-campo--4 mce-linha">
            <div className="mce-sublinha">
              <label className="mce-label">Data *</label>
              <input
                className="mce-input"
                type="date"
                value={form.data}
                onChange={(e) => atualizar('data', e.target.value)}
              />
            </div>
            <div className="mce-sublinha">
              <label className="mce-label">Início</label>
              <input
                className="mce-input"
                type="time"
                value={form.horaInicio}
                onChange={(e) => atualizar('horaInicio', e.target.value)}
              />
            </div>
            <div className="mce-sublinha">
              <label className="mce-label">Fim</label>
              <input
                className="mce-input"
                type="time"
                value={form.horaFim}
                onChange={(e) => atualizar('horaFim', e.target.value)}
              />
            </div>
          </div>

          {/* termina em — opcional, só para eventos de vários dias (ex: férias, semana de exames) */}
          <div className="mce-campo mce-campo--4">
            <label className="mce-label">Termina em (opcional)</label>
            <input
              className="mce-input"
              type="date"
              min={form.data}
              value={form.dataFim}
              onChange={(e) => atualizar('dataFim', e.target.value)}
            />
          </div>

          {/* aviso de coincidência — nunca bloqueia, só avisa */}
          {avisoChoque && <p className="mce-aviso-choque">⚠️ {avisoChoque}</p>}

          {/* importância */}
          <div className="mce-campo mce-campo--5">
            <label className="mce-label">Importância</label>
            <div className="mce-importancias">
              {['baixa', 'media', 'alta'].map((imp) => (
                <button
                  key={imp}
                  className={`mce-imp-btn mce-imp-btn--${imp} ${form.importancia === imp ? 'ativo' : ''}`}
                  onClick={() => atualizar('importancia', imp)}
                >
                  {imp.charAt(0).toUpperCase() + imp.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* estado */}
          <div className="mce-campo mce-campo--6">
            <label className="mce-label">Estado</label>
            <div className="mce-estados">
              {['pendente', 'concluido', 'cancelado'].map((est) => (
                <button
                  key={est}
                  className={`mce-estado-btn ${form.estado === est ? 'ativo' : ''}`}
                  onClick={() => atualizar('estado', est)}
                >
                  {est.charAt(0).toUpperCase() + est.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* notas */}
          <div className="mce-campo mce-campo--7">
            <label className="mce-label">Notas</label>
            <TextareaRevista
              className="mce-input mce-textarea"
              placeholder="Alguma nota adicional..."
              value={form.notas}
              onValor={(valor) => atualizar('notas', valor)}
            />
          </div>

          {/* conta falta — só faz sentido para eventos da faculdade */}
          {daFaculdade && (
            <div className="mce-campo mce-campo--8 mce-toggle-linha">
              <label className="mce-label">Conta como falta?</label>
              <button
                className={`mce-toggle ${form.contaFalta ? 'ativo' : ''}`}
                onClick={() => atualizar('contaFalta', !form.contaFalta)}
              >
                <span className="mce-toggle__bolinha" />
              </button>
            </div>
          )}

          {/* lembretes de estudo */}
          {lembretes.length > 0 && (
            <div className="mce-campo mce-campo--8 mce-toggle-linha">
              <label className="mce-label">Criar {lembretes.length} lembretes de estudo?</label>
              <button type="button" role="switch" aria-checked={form.lembretes} className={`mce-toggle ${form.lembretes ? 'ativo' : ''}`} onClick={() => atualizar('lembretes', !form.lembretes)}>
                <span className="mce-toggle__bolinha" />
              </button>
            </div>
          )}
          {lembretes.length > 0 && form.lembretes && (
            <ul className="mce-lembretes">
              {lembretes.map((t) => <li key={t.prazo}>{t.prazo.split('-').reverse().join('/')}: {t.titulo}</li>)}
            </ul>
          )}

          {/* erro */}
          {erro && <p className="mce-erro">{erro}</p>}

        </div>

        {/* footer com botão guardar */}
        <div className="mce-footer">
          <button className="mce-btn-cancelar" onClick={fechar}>Cancelar</button>
          <button
            className={`mce-btn-guardar ${guardando ? 'guardando' : ''}`}
            onClick={guardar}
            disabled={guardando || sucesso}
          >
            {guardando ? (
              <span className="mce-spinner" />
            ) : (
              aEditar ? 'Guardar Alterações' : 'Guardar Evento'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}