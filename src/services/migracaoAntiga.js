// recuperação dos dados da outra versão da app (a que esteve publicada antes de 07-10-2026, da linha "fase-2"):
// essa versão guardava as aulas marcadas em users/{uid}/estadosAula/{aulaId_AAAA-MM-DD} e os sumários em
// users/{uid}/sumarios/{aulaId_AAAA-MM-DD}. a versão atual lê as marcas e as notas de cada aula de
// cadeiras/{id}/presencas/dados (campos marcas e notasAulas), com as mesmas chaves aulaId_AAAA-MM-DD.
// lógica pura: converte e junta, sem nunca pisar uma marca que ela já tenha feito na versão atual.
// as faltas/dados não se mexem: a versão antiga não somava as aulas marcadas às lecionadas (procurava o campo
// "tipo" em documentos que só tinham "tipoAula"), por isso não há nada contado a dobrar
import { normalizarMarca } from './presencas.js';

// os estados da versão antiga e o seu equivalente na atual (src/data/estadosAula.js)
export const ESTADO_ANTIGO_PARA_ATUAL = {
  fui: 'presente',
  faltei: 'faltei',
  stotFaltou: 'prof-faltou',
  cancelada: 'sem-aula',
};

function emMs(valor) {
  if (!valor) return 0;
  if (typeof valor.toMillis === 'function') return valor.toMillis();
  if (valor instanceof Date) return valor.getTime();
  return Number(valor) || 0;
}

// estados: [{ id, aulaId, cadeiraId, data, tipoAula, estado }]
// sumarios: [{ id, cadeiraId, aulaId, data, bullets: [], atualizadoEm }]
// atuais: { [cadeiraId]: { marcas: {}, notasAulas: {} } } (o que já está em presencas/dados)
// devolve { porCadeira: { [cadeiraId]: { marcas, notasAulas } } só com o que é novo, marcas: n, sumarios: n }
export function migrarDaVersaoAntiga({ estados = [], sumarios = [], atuais = {} }) {
  const porCadeira = {};
  let nMarcas = 0; let nSumarios = 0;
  const destino = (cadeiraId) => {
    if (!porCadeira[cadeiraId]) porCadeira[cadeiraId] = { marcas: {}, notasAulas: {} };
    return porCadeira[cadeiraId];
  };

  estados.forEach((e) => {
    const estado = ESTADO_ANTIGO_PARA_ATUAL[e?.estado];
    const chave = e?.id || (e?.aulaId && e?.data ? `${e.aulaId}_${e.data}` : null);
    if (!estado || !chave || !e.cadeiraId) return;
    if (atuais[e.cadeiraId]?.marcas?.[chave]) return; // já marcada na versão atual: ganha a atual
    const marca = normalizarMarca({ estado, contaFalta: e.tipoAula === 'pratica', data: e.data || '', titulo: '' });
    if (!marca) return;
    destino(e.cadeiraId).marcas[chave] = marca;
    nMarcas += 1;
  });

  sumarios.forEach((s) => {
    const chave = s?.id || (s?.aulaId && s?.data ? `${s.aulaId}_${s.data}` : null);
    const pontos = Array.isArray(s?.bullets) ? s.bullets.map((b) => String(b).trim()).filter(Boolean) : [];
    if (!chave || !s.cadeiraId || pontos.length === 0) return;
    if (atuais[s.cadeiraId]?.notasAulas?.[chave]) return;
    destino(s.cadeiraId).notasAulas[chave] = {
      sumario: pontos.map((p) => `• ${p}`).join('\n').slice(0, 1500),
      nota: '', tpc: '', duvida: '',
      em: emMs(s.atualizadoEm) || Date.now(),
      data: /^\d{4}-\d{2}-\d{2}$/.test(s.data || '') ? s.data : '',
      titulo: '',
      cadeiraId: s.cadeiraId,
    };
    nSumarios += 1;
  });

  return { porCadeira, marcas: nMarcas, sumarios: nSumarios };
}
