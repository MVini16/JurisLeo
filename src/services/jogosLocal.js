// recordes, nível, selos e conquistas dos minijogos: só neste telemóvel (localStorage), nada vai para o firebase
import { registarRecorde } from './jogos.js';
import { aplicarJogada, perfilVazio } from './jogosMeta.js';
import { diaDe } from './modoEstudo.js';
import { registarEstudoDeHoje } from './estudoLocal.js';

const CHAVE = 'jurisleo-jogos';
const CHAVE_PERFIL = 'jurisleo-jogos-perfil';

export function lerRecordes() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch { return {}; }
}

export function lerPerfilJogos() {
  try { return { ...perfilVazio(), ...(JSON.parse(localStorage.getItem(CHAVE_PERFIL)) || {}) }; } catch { return perfilVazio(); }
}

function guardar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* sem localstorage, esquece */ }
}

// quando uma jogada acaba: guarda o recorde e o perfil e devolve tudo o que o ecrã do fim precisa de mostrar.
// `diario` é a audiência do dia (o recorde dela fica à parte, em "diario")
export function terminarJogada(jogo, { pontos, perfeita = false, diario = false }) {
  const chave = diario ? 'diario' : jogo;
  const antes = lerRecordes();
  const melhorAntes = antes[chave]?.melhor ?? 0;
  const { registo, novoRecorde } = registarRecorde(antes, chave, pontos);
  guardar(CHAVE, registo);
  // jogar conta como estudar: mantém a série de dias seguidos
  registarEstudoDeHoje();
  const meta = aplicarJogada(lerPerfilJogos(), { pontos, perfeita, novoRecorde, diario, hoje: diaDe(Date.now()) });
  guardar(CHAVE_PERFIL, meta.perfil);
  return { ...meta, pontos, perfeita, novoRecorde, melhor: registo[chave].melhor, melhorAntes };
}

export function audienciaDeHojeFeita() {
  return lerPerfilJogos().ultimaAudiencia === diaDe(Date.now());
}
