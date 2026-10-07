// sons dos jogos feitos na hora com o Web Audio (sem ficheiros). só tocam se a preferência estiver ligada.
// em iPhone, o botão de silêncio cala-os, e ela pode desligá-los em Definições > Brincadeiras
import { lerPreferencias } from './preferenciasBrincadeiras.js';

let contexto = null;

function ctx() {
  if (contexto) return contexto;
  try {
    const Classe = window.AudioContext || window.webkitAudioContext;
    contexto = Classe ? new Classe() : null;
  } catch { contexto = null; }
  return contexto;
}

function nota(c, { freq, inicio = 0, dur = 0.15, tipo = 'sine', vol = 0.18, ate = null }) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, c.currentTime + inicio);
  if (ate) o.frequency.exponentialRampToValueAtTime(ate, c.currentTime + inicio + dur);
  g.gain.setValueAtTime(0.0001, c.currentTime + inicio);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + inicio + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + inicio);
  o.stop(c.currentTime + inicio + dur + 0.02);
}

const SONS = {
  certo: (c) => { nota(c, { freq: 660, dur: 0.12 }); nota(c, { freq: 880, inicio: 0.09, dur: 0.18 }); },
  errado: (c) => { nota(c, { freq: 200, dur: 0.28, tipo: 'sawtooth', vol: 0.12, ate: 110 }); },
  combo: (c) => { [523, 659, 784, 1047].forEach((f, i) => nota(c, { freq: f, inicio: i * 0.07, dur: 0.14 })); },
  carimbo: (c) => { nota(c, { freq: 140, dur: 0.18, tipo: 'square', vol: 0.2, ate: 60 }); },
  martelo: (c) => { nota(c, { freq: 180, dur: 0.12, tipo: 'square', vol: 0.22, ate: 70 }); nota(c, { freq: 150, inicio: 0.16, dur: 0.16, tipo: 'square', vol: 0.22, ate: 60 }); },
  suspense: (c) => { [196, 196, 196].forEach((f, i) => nota(c, { freq: f, inicio: i * 0.35, dur: 0.3, tipo: 'triangle', vol: 0.12 })); },
  tic: (c) => { nota(c, { freq: 1200, dur: 0.04, vol: 0.06 }); },
  nivel: (c) => { [392, 523, 659, 784, 1047].forEach((f, i) => nota(c, { freq: f, inicio: i * 0.1, dur: 0.22 })); },
  selo: (c) => { [880, 1175, 1568].forEach((f, i) => nota(c, { freq: f, inicio: i * 0.09, dur: 0.3, vol: 0.14 })); },
  caixa: (c) => { nota(c, { freq: 330, dur: 0.1 }); nota(c, { freq: 440, inicio: 0.1, dur: 0.1 }); nota(c, { freq: 660, inicio: 0.2, dur: 0.25 }); },
};

export function tocarSom(tipo) {
  if (!lerPreferencias().jogosSom) return;
  const c = ctx();
  if (!c || !SONS[tipo]) return;
  try {
    if (c.state === 'suspended') c.resume();
    SONS[tipo](c);
  } catch { /* sem som */ }
}
