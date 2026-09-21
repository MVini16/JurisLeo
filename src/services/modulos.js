// lógica pura dos módulos ligáveis — sem firebase nem react
// guardados: o objeto que vem de configuracoes/dados.modulos, { [id]: true|false }, ou nada
import { MODULOS, ORDEM_CARTOES_DEFEITO } from '../data/modulos.js';

// se não há escolha guardada, vale o defeito do módulo; os fixos estão sempre ligados
export function moduloAtivo(id, guardados) {
  const modulo = MODULOS.find((m) => m.id === id);
  if (!modulo) return false;
  if (modulo.fixo) return true;
  const escolha = guardados?.[id];
  return typeof escolha === 'boolean' ? escolha : !!modulo.defeito;
}

// mapa id → ligado, para todos os módulos
export function estadoModulos(guardados) {
  return Object.fromEntries(MODULOS.map((m) => [m.id, moduloAtivo(m.id, guardados)]));
}

// ordem final dos cartões: mantém a que ela guardou (sem ids que já não existem)
// e põe no fim os cartões que ela ainda não conhece, para uma novidade nunca ficar escondida
export function ordemCartoes(guardada) {
  const conhecidos = new Set(ORDEM_CARTOES_DEFEITO);
  const dela = Array.isArray(guardada) ? guardada.filter((id) => conhecidos.has(id)) : [];
  const semRepetidos = [...new Set(dela)];
  const emFalta = ORDEM_CARTOES_DEFEITO.filter((id) => !semRepetidos.includes(id));
  return [...semRepetidos, ...emFalta];
}

// troca um cartão com o vizinho (direcao -1 sobe, +1 desce); fora dos limites não faz nada
export function moverCartao(ordem, id, direcao) {
  const i = ordem.indexOf(id);
  const j = i + direcao;
  if (i < 0 || j < 0 || j >= ordem.length) return ordem;
  const nova = [...ordem];
  [nova[i], nova[j]] = [nova[j], nova[i]];
  return nova;
}
