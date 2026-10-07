// a camada de desenho por cima da folha. duas telas: a de baixo tem os traços guardados e só é
// redesenhada quando algo muda; a de cima mostra o traço que está a ser feito, sem mexer nas outras.
// funciona com o dedo, o rato e a caneta (apple pencil); "só caneta" deixa o dedo a fazer scroll
import { useEffect, useRef, useState } from 'react';
import { LARGURA_LOGICA, LARGURAS, novoTraco, tracosTocados } from '../../services/desenho.js';
import { lerCoresDaCamada, desenharLinha, desenharTodos } from './desenharTracos.js';

const RAIO_BORRACHA_PX = 14;

export default function CamadaDesenho({ tracos, ativo, ferramenta, aoAdicionar, aoApagar }) {
  const caixa = useRef(null);
  const base = useRef(null);
  const vivo = useRef(null);
  const pontosAgora = useRef(null);
  const coresAgora = useRef(null);
  const apagadosAgora = useRef(new Set());
  const aBorrar = useRef(false);
  const [medida, setMedida] = useState({ largura: 0, altura: 0 });
  const [versaoTema, setVersaoTema] = useState(0);
  // traços tocados pela borracha durante o gesto: somem logo, e só depois se grava (num único desfazer)
  const [apagados, setApagados] = useState(() => new Set());
  const escala = medida.largura / LARGURA_LOGICA;

  useEffect(() => {
    const elemento = caixa.current;
    const observador = new ResizeObserver(() => setMedida({ largura: elemento.clientWidth, altura: elemento.clientHeight }));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  // a app muda de tema pondo uma classe no html: as cores dos traços têm de acompanhar
  useEffect(() => {
    const observador = new MutationObserver(() => setVersaoTema((v) => v + 1));
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!medida.largura) return;
    const dpr = window.devicePixelRatio || 1;
    // mudar o tamanho de uma tela limpa-a: é isso que apaga também o traço em curso, já guardado
    for (const tela of [base.current, vivo.current]) {
      tela.width = Math.round(medida.largura * dpr);
      tela.height = Math.round(medida.altura * dpr);
    }
    const ctx = base.current.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    desenharTodos(ctx, tracos, escala, lerCoresDaCamada(caixa.current), apagados);
  }, [medida, tracos, apagados, versaoTema, escala]);

  function ponto(evento) {
    const retangulo = vivo.current.getBoundingClientRect();
    return { x: (evento.clientX - retangulo.left) / escala, y: (evento.clientY - retangulo.top) / escala };
  }

  function borrar(onde) {
    const novos = tracosTocados(tracos, onde, RAIO_BORRACHA_PX / escala).filter((i) => !apagadosAgora.current.has(i));
    if (novos.length === 0) return;
    novos.forEach((i) => apagadosAgora.current.add(i));
    setApagados(new Set(apagadosAgora.current));
  }

  function aoPremir(evento) {
    if (!ativo || escala === 0) return;
    if (ferramenta.soCaneta && evento.pointerType === 'touch') return;
    evento.preventDefault();
    vivo.current.setPointerCapture(evento.pointerId);
    if (ferramenta.tipo === 'borracha') {
      apagadosAgora.current = new Set();
      aBorrar.current = true;
      borrar(ponto(evento));
    } else {
      coresAgora.current = lerCoresDaCamada(caixa.current);
      pontosAgora.current = [ponto(evento)];
    }
  }

  function aoMover(evento) {
    // o telemóvel junta vários movimentos num só evento: sem isto as linhas ficavam aos bicos
    const eventos = evento.nativeEvent.getCoalescedEvents?.() ?? [evento.nativeEvent];
    if (ferramenta.tipo === 'borracha') {
      if (aBorrar.current) eventos.forEach((e) => borrar(ponto(e)));
      return;
    }
    const pontos = pontosAgora.current;
    if (!pontos) return;
    eventos.forEach((e) => {
      const novo = ponto(e);
      const ultimo = pontos[pontos.length - 1];
      if (novo.x !== ultimo.x || novo.y !== ultimo.y) pontos.push(novo);
    });
    const dpr = window.devicePixelRatio || 1;
    const ctx = vivo.current.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, medida.largura, medida.altura);
    desenharLinha(ctx, pontos, {
      marcador: ferramenta.tipo === 'marcador',
      cor: coresAgora.current[ferramenta.cor],
      largura: LARGURAS[ferramenta.tipo][ferramenta.espessura - 1],
    }, escala);
  }

  function aoSoltar() {
    if (ferramenta.tipo === 'borracha') {
      aBorrar.current = false;
      const indices = [...apagadosAgora.current];
      apagadosAgora.current = new Set();
      setApagados(new Set());
      if (indices.length > 0) aoApagar(indices);
      return;
    }
    const pontos = pontosAgora.current;
    pontosAgora.current = null;
    if (pontos) aoAdicionar(novoTraco({ ferramenta: ferramenta.tipo, cor: ferramenta.cor, espessura: ferramenta.espessura, pontos }));
  }

  function aoCancelar() {
    pontosAgora.current = null;
    aBorrar.current = false;
    apagadosAgora.current = new Set();
    setApagados(new Set());
    vivo.current.getContext('2d').clearRect(0, 0, vivo.current.width, vivo.current.height);
  }

  return (
    <div
      ref={caixa}
      className={`er-desenho ${ativo ? 'er-desenho--ativo' : ''} ${ferramenta.soCaneta ? 'er-desenho--so-caneta' : ''}`}
    >
      <canvas ref={base} className="er-desenho__tela" aria-hidden="true" />
      <canvas
        ref={vivo}
        className="er-desenho__tela er-desenho__vivo"
        aria-label="Zona de desenho"
        onPointerDown={aoPremir}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoCancelar}
      />
    </div>
  );
}
