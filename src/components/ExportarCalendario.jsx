// folha "levar para o calendário do iphone": ela escolhe o que vai e recebe um ficheiro .ics.
// no iphone, abrir o ficheiro mostra "adicionar todos" e os alertas nativos passam a avisar
// mesmo com a app fechada. é uma cópia: se uma data mudar aqui, exporta-se outra vez.
import { useEffect, useRef, useState } from 'react';
import { useTarefas } from '../hooks/useTarefas.js';
import { itensDeEventos, itensDeTarefas, itensDeAulas, gerarIcs } from '../services/ics.js';
import './ExportarCalendario.css';

// no iphone a folha de partilha é o caminho mais fiável; noutros sítios, descarrega o ficheiro
async function entregarFicheiro(texto) {
  const nome = 'jurisleo.ics';
  const ficheiro = new File([texto], nome, { type: 'text/calendar' });
  if (navigator.canShare?.({ files: [ficheiro] })) {
    try {
      await navigator.share({ files: [ficheiro], title: 'JurisLeo' });
      return 'partilhado';
    } catch (erro) {
      if (erro?.name === 'AbortError') return 'cancelado';
    }
  }
  const url = URL.createObjectURL(ficheiro);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'descarregado';
}

export default function ExportarCalendario({ eventos, onFechar }) {
  const { tarefas } = useTarefas();
  const [escolhas, setEscolhas] = useState({ provas: true, prazos: true, outros: false, aulas: false });
  const [estado, setEstado] = useState(null);
  const folha = useRef(null);

  const grupos = [
    { id: 'provas', icone: '⚖️', nome: 'Frequências, exames e orais', ajuda: 'com aviso na véspera', itens: itensDeEventos(eventos, { soProvas: true }) },
    { id: 'prazos', icone: '📆', nome: 'Prazos de tarefas', ajuda: 'aviso às 9h do dia', itens: itensDeTarefas(tarefas) },
    { id: 'outros', icone: '📌', nome: 'Outros eventos', ajuda: 'entregas, férias, compromissos', itens: itensDeEventos(eventos, { soProvas: false }) },
    { id: 'aulas', icone: '🎓', nome: 'Aulas do semestre', ajuda: 'são muitas: só se quiseres', itens: itensDeAulas(eventos) },
  ];
  const total = grupos.filter((g) => escolhas[g.id]).reduce((s, g) => s + g.itens.length, 0);

  // escape fecha e o foco começa na folha
  const fecharRef = useRef(onFechar);
  useEffect(() => { fecharRef.current = onFechar; });
  useEffect(() => {
    folha.current?.focus();
    const tecla = (e) => { if (e.key === 'Escape') fecharRef.current(); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, []);

  async function exportar() {
    const itens = grupos.filter((g) => escolhas[g.id]).flatMap((g) => g.itens);
    if (itens.length === 0) return;
    setEstado('a-preparar');
    const resultado = await entregarFicheiro(gerarIcs(itens));
    setEstado(resultado === 'cancelado' ? null : 'feito');
  }

  return (
    <>
      <div className="expcal-veu" onClick={onFechar} />
      <div className="expcal-folha" ref={folha} role="dialog" aria-modal="true" aria-label="Levar para o Calendário do iPhone" tabIndex={-1}>
        <div className="expcal-pega" aria-hidden="true" />
        <h2>Levar para o Calendário do iPhone</h2>
        <ul className="expcal-lista">
          {grupos.map((g) => (
            <li key={g.id}>
              <label className="expcal-linha">
                <span className="expcal-icone" aria-hidden="true">{g.icone}</span>
                <span className="expcal-texto"><b>{g.nome}</b><small>{g.ajuda}</small></span>
                <span className="expcal-quantos">{g.itens.length}</span>
                <input type="checkbox" checked={escolhas[g.id]} disabled={g.itens.length === 0} onChange={(e) => setEscolhas((x) => ({ ...x, [g.id]: e.target.checked }))} />
              </label>
            </li>
          ))}
        </ul>
        <button type="button" className="expcal-botao" onClick={exportar} disabled={total === 0 || estado === 'a-preparar'}>
          {total === 0 ? 'Escolhe o que levar' : estado === 'a-preparar' ? 'A preparar…' : `Exportar ${total} ${total === 1 ? 'evento' : 'eventos'}`}
        </button>
        <p className="expcal-ajuda" role="status">
          {estado === 'feito'
            ? '✓ Pronto. No iPhone, abre o ficheiro e toca em “Adicionar todos”.'
            : 'Abre o ficheiro no iPhone e toca em “Adicionar todos”. É uma cópia: se mudares uma data aqui, exporta outra vez.'}
        </p>
      </div>
    </>
  );
}
