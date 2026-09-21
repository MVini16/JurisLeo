// lógica pura das fichas — sem firebase nem react
import { tipoDeFicha } from '../data/fichas.js';
import { chaveData } from '../data/feriados.js';

// texto sem acentos e em minúsculas, para pesquisar sem se preocupar com isso
export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// uma ficha nova, com todos os campos vazios
export function fichaVazia(tipoId) {
  const tipo = tipoDeFicha(tipoId);
  if (!tipo) return {};
  return Object.fromEntries(tipo.campos.map((c) => [c.id, '']));
}

// só os campos do tipo, sem espaços a mais
export function limparFicha(tipoId, dados) {
  const tipo = tipoDeFicha(tipoId);
  if (!tipo) return {};
  const limpa = {};
  for (const campo of tipo.campos) {
    const valor = dados?.[campo.id];
    limpa[campo.id] = typeof valor === 'string' ? valor.trim() : '';
  }
  return limpa;
}

// { campoId: mensagem } — vazio quando está tudo bem
export function validarFicha(tipoId, dados) {
  const tipo = tipoDeFicha(tipoId);
  const erros = {};
  if (!tipo) return { tipo: 'Este tipo de ficha não existe.' };
  for (const campo of tipo.campos) {
    const valor = String(dados?.[campo.id] ?? '').trim();
    if (campo.obrigatorio && !valor) erros[campo.id] = `Preenche "${campo.rotulo}".`;
    if (campo.tipo === 'escolha' && valor && !campo.opcoes.includes(valor)) erros[campo.id] = `Escolhe uma opção de "${campo.rotulo}".`;
  }
  return erros;
}

// texto e cadeira; a pesquisa procura em todos os campos
export function filtrarFichas(fichas, { texto = '', cadeiraId = 'todas' } = {}) {
  const busca = normalizar(texto.trim());
  return fichas.filter((f) => {
    if (cadeiraId !== 'todas' && f.cadeiraId !== cadeiraId) return false;
    if (!busca) return true;
    return Object.values(f).some((v) => typeof v === 'string' && normalizar(v).includes(busca));
  });
}

// aceita Date, Timestamp do firestore ou número; o que ainda não chegou ao servidor conta como agora
function paraMs(valor) {
  if (valor == null) return Number.MAX_SAFE_INTEGER;
  if (typeof valor === 'number') return valor;
  if (valor instanceof Date) return valor.getTime();
  return valor.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
}

// as mais recentes primeiro
export function ordenarFichas(fichas) {
  return [...fichas].sort((a, b) => paraMs(b.atualizadaEm ?? b.criadaEm) - paraMs(a.atualizadaEm ?? a.criadaEm));
}

// contactos com "voltar a falar" já chegado (data até hoje), os mais atrasados primeiro
export function contactosParaFalar(fichas, hoje = new Date()) {
  const hojeChave = chaveData(hoje);
  return fichas
    .filter((f) => f.tipo === 'contactos' && f.voltarFalar && f.voltarFalar <= hojeChave)
    .sort((a, b) => a.voltarFalar.localeCompare(b.voltarFalar));
}

// os passos de uma checklist: uma linha, um passo (sem linhas vazias)
export function passosDaChecklist(ficha) {
  return String(ficha?.passos ?? '')
    .split('\n')
    .map((p) => p.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}
