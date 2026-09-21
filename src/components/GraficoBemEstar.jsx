// gráfico das três linhas (humor, energia, motivação) em SVG desenhado à mão, sem bibliotecas.
// é o mesmo componente no perfil dela e na consola dele: não há nada que ele veja e ela não.
import './BemEstar.css';

const LARGURA = 300;
const ALTURA = 112;
const MARGEM = 10;

const LINHAS = [
  { id: 'humor', nome: 'Humor', cor: 'var(--acento)' },
  { id: 'energia', nome: 'Energia', cor: 'var(--info)' },
  { id: 'motivacao', nome: 'Motivação', cor: 'var(--sucesso)' },
];

// uma linha por campo; um dia sem registo interrompe-a em vez de a ligar por cima do buraco
function caminho(serie, campo, x, y) {
  let d = '';
  let anterior = false;
  serie.forEach((p, i) => {
    if (p[campo] == null) { anterior = false; return; }
    d += `${anterior ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p[campo]).toFixed(1)} `;
    anterior = true;
  });
  return d.trim();
}

export default function GraficoBemEstar({ serie }) {
  const n = serie.length;
  const x = (i) => (n === 1 ? LARGURA / 2 : MARGEM + (i * (LARGURA - 2 * MARGEM)) / (n - 1));
  const y = (v) => MARGEM + ((5 - v) * (ALTURA - 2 * MARGEM)) / 4;
  const comPontos = n <= 31;
  const registados = serie.filter((p) => p.humor != null || p.energia != null || p.motivacao != null).length;

  return (
    <figure className="bem-grafico">
      <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={`Humor, energia e motivação nos últimos ${n} dias. ${registados} dias com registo.`}>
        {[1, 2, 3, 4, 5].map((v) => <line key={v} className="bem-grafico__guia" x1={MARGEM} x2={LARGURA - MARGEM} y1={y(v)} y2={y(v)} />)}
        {LINHAS.map((l) => (
          <g key={l.id} style={{ '--cor-linha': l.cor }}>
            <path className="bem-grafico__linha" d={caminho(serie, l.id, x, y)} />
            {comPontos && serie.map((p, i) => (p[l.id] != null ? <circle key={p.chave} className="bem-grafico__ponto" cx={x(i)} cy={y(p[l.id])} r="2.6" /> : null))}
          </g>
        ))}
        {serie.map((p, i) => (p.apagado ? <text key={p.chave} className="bem-grafico__apagado" x={x(i)} y={ALTURA - 1} textAnchor="middle">×</text> : null))}
      </svg>
      <figcaption className="bem-grafico__legenda">
        {LINHAS.map((l) => <span key={l.id} style={{ '--cor-linha': l.cor }}><i />{l.nome}</span>)}
        {serie.some((p) => p.apagado) && <span className="bem-grafico__apagado-legenda">× dia apagado</span>}
      </figcaption>
    </figure>
  );
}
