// famílias de eventos do calendário: um só calendário, com cores e filtro
// faculdade usa a cor da cadeira; as outras têm cor própria (definida em index.css)
import { coresCadeiras } from './dadosLeonor.js';

export const FAMILIAS = [
  { id: 'faculdade', nome: 'Faculdade', cor: 'var(--burgundy)' },
  { id: 'ferias', nome: 'Férias e viagens', cor: 'var(--familia-ferias)' },
  { id: 'social', nome: 'Social e pessoal', cor: 'var(--familia-social)' },
  { id: 'saude', nome: 'Saúde e rotina', cor: 'var(--familia-saude)' },
];

const IDS = FAMILIAS.map((f) => f.id);

// eventos antigos, sem família, são da faculdade
export function familiaDoEvento(ev) {
  return IDS.includes(ev?.familia) ? ev.familia : 'faculdade';
}

export function corDoEvento(ev) {
  const familia = familiaDoEvento(ev);
  if (familia !== 'faculdade') return FAMILIAS.find((f) => f.id === familia).cor;
  return (ev?.cadeira && coresCadeiras[ev.cadeira]) || 'var(--gold)';
}
