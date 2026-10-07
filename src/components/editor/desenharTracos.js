// desenha traços num canvas. usado pela camada de desenho do editor e, na exportação, para
// gerar a imagem do desenho que vai para o word
import { pontosDoTraco, larguraDoTraco, alturaDoDesenho, comandosDoTraco, LARGURA_LOGICA } from '../../services/desenho.js';

const OPACIDADE_MARCADOR = 0.35;

// as cores vêm do index.css, lidas no elemento (por isso seguem o tema claro/escuro)
export function lerCoresDaCamada(elemento) {
  const estilo = getComputedStyle(elemento);
  const cor = (variavel) => estilo.getPropertyValue(variavel).trim();
  return {
    // a tinta vem de uma variável (muda logo com o tema) e não da cor do texto (que tem uma transição)
    tinta: cor('--nota-cor-tinta'),
    azul: cor('--nota-cor-azul'),
    vinho: cor('--nota-cor-vinho'),
    verde: cor('--nota-cor-verde'),
    ouro: cor('--nota-cor-ouro'),
    roxo: cor('--nota-cor-roxo'),
  };
}

// as cores do papel (tema claro), para imagens que vão para fora da app
export function lerCoresDoPapel() {
  const sonda = document.createElement('div');
  sonda.className = 'tema-papel';
  sonda.style.display = 'none';
  document.body.appendChild(sonda);
  const cores = lerCoresDaCamada(sonda);
  document.body.removeChild(sonda);
  return cores;
}

// uma linha pelos pontos: curvas suaves, mas os cantos ficam cantos (ver comandosDoTraco)
export function desenharLinha(ctx, pontos, { marcador, cor, largura }, escala) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = marcador ? OPACIDADE_MARCADOR : 1;
  ctx.strokeStyle = cor;
  ctx.fillStyle = cor;
  ctx.lineWidth = Math.max(1, largura * escala);

  const [primeiro, segundo] = pontos;
  const pontinho = pontos.length === 2 && primeiro.x === segundo.x && primeiro.y === segundo.y;
  ctx.beginPath();
  if (pontinho) {
    ctx.arc(primeiro.x * escala, primeiro.y * escala, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    for (const c of comandosDoTraco(pontos)) {
      if (c.t === 'M') ctx.moveTo(c.x * escala, c.y * escala);
      else if (c.t === 'L') ctx.lineTo(c.x * escala, c.y * escala);
      else ctx.quadraticCurveTo(c.cx * escala, c.cy * escala, c.x * escala, c.y * escala);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export function desenharTodos(ctx, tracos, escala, cores, ignorados = new Set()) {
  tracos.forEach((traco, i) => {
    if (ignorados.has(i)) return;
    desenharLinha(ctx, pontosDoTraco(traco), { marcador: traco.f === 'm', cor: cores[traco.k], largura: larguraDoTraco(traco) }, escala);
  });
}

// o desenho todo como imagem PNG (fundo transparente), para meter no word
export async function renderizarDesenhoPng(tracos, cores, larguraPx = 1400) {
  const escala = larguraPx / LARGURA_LOGICA;
  const altura = Math.max(1, Math.ceil(alturaDoDesenho(tracos) * escala));
  const canvas = document.createElement('canvas');
  canvas.width = larguraPx;
  canvas.height = altura;
  desenharTodos(canvas.getContext('2d'), tracos, escala, cores);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return { dados: new Uint8Array(await blob.arrayBuffer()), largura: larguraPx, altura };
}
