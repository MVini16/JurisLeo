// a grelha do ecrã de início, como o ecrã principal do iphone:
// toque longo entra em edição, os widgets tremem, − tira, o botão dourado muda o tamanho
// e arrasta-se para mudar a ordem (dnd-kit). as mudanças animam com gsap flip.
import { useLayoutEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WIDGETS } from '../../data/widgets.js';
import { tirarWidget, mudarTamanho, moverWidget } from '../../services/ecra.js';
import { COMPONENTES_WIDGETS } from './registo.js';
import { gsap, Flip, movimentoPermitido } from './movimento.js';
import './Ecra.css';

const CATALOGO = new Map(WIDGETS.map((w) => [w.id, w]));
const TOQUE_LONGO_MS = 500;

// sem deslocar os outros durante o arrasto: com tamanhos diferentes isso salta muito;
// quando ela larga, o flip leva cada widget ao sítio novo
const semDeslocar = () => null;

function ItemWidget({ widget, indice, emEdicao, contexto, onTirar, onTamanho, onToqueLongo }) {
  const info = CATALOGO.get(widget.id);
  const Componente = COMPONENTES_WIDGETS[widget.id];
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: widget.id, disabled: !emEdicao });
  const toque = useRef(null);
  const dentro = useRef(null);

  // toque longo fora de edição: meio segundo parado entra no modo de edição
  function aoPousar(e) {
    if (emEdicao) return;
    const x = e.clientX;
    const y = e.clientY;
    const cancelar = () => { clearTimeout(toque.current?.t); toque.current = null; };
    toque.current = {
      x, y, cancelar,
      t: setTimeout(() => { toque.current = null; onToqueLongo(); }, TOQUE_LONGO_MS),
    };
  }
  function aoMexer(e) {
    if (toque.current && Math.hypot(e.clientX - toque.current.x, e.clientY - toque.current.y) > 10) toque.current.cancelar();
  }
  const aoLevantar = () => toque.current?.cancelar();

  // animação de saída: encolhe e desaparece, e só depois o widget sai do ecrã
  function tirar(e) {
    e.stopPropagation();
    if (movimentoPermitido() && dentro.current) {
      gsap.to(dentro.current, { scale: 0.4, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => onTirar(indice) });
    } else {
      onTirar(indice);
    }
  }

  return (
    <div
      ref={setNodeRef}
      data-flip-id={widget.id}
      className={`ecra-w ecra-w--${widget.tamanho} ${isDragging ? 'a-arrastar' : ''}`}
      style={{ transform: CSS.Translate.toString(transform) }}
      onPointerDown={aoPousar}
      onPointerMove={aoMexer}
      onPointerUp={aoLevantar}
      onPointerCancel={aoLevantar}
      onPointerLeave={aoLevantar}
      {...(emEdicao ? { ...attributes, ...listeners, 'aria-label': `${info.nome}, arrastar para mudar a ordem` } : {})}
    >
      <div className="ecra-w__dentro" ref={dentro}>
        {emEdicao && (
          <>
            <button type="button" className="ecra-w__botao ecra-w__tirar" onPointerDown={(e) => e.stopPropagation()} onClick={tirar} aria-label={`Tirar ${info.nome}`}>−</button>
            {info.tamanhos.length > 1 && (
              <button type="button" className="ecra-w__botao ecra-w__tamanho" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onTamanho(indice); }} aria-label={`Mudar o tamanho de ${info.nome}`}>
                {widget.tamanho === 'largo' ? '▭' : '▢'}
              </button>
            )}
          </>
        )}
        <div className="ecra-w__conteudo" data-vazio={`${info.icone} ${info.nome} · aparece quando houver o que mostrar`}>
          {Componente && <Componente tamanho={widget.tamanho} contexto={contexto} />}
        </div>
      </div>
    </div>
  );
}

export default function GrelhaEcra({ ecra, onMudar, contexto, emEdicao, onEntrarEdicao, comFlipRef }) {
  const raiz = useRef(null);
  const estadoFlip = useRef(null);
  const acabouDeEntrar = useRef(false);

  // grava a mudança e guarda onde estava cada widget, para o flip animar a partir daí
  function mudarComFlip(novo) {
    if (movimentoPermitido() && raiz.current) estadoFlip.current = Flip.getState(raiz.current.querySelectorAll('.ecra-w'));
    onMudar(novo);
  }
  // o dashboard também usa isto (juntar widgets, mudar a estrutura)
  useLayoutEffect(() => {
    if (comFlipRef) comFlipRef.current = mudarComFlip;
  });

  // depois de o react redesenhar, leva cada widget do sítio antigo para o novo
  useLayoutEffect(() => {
    const estado = estadoFlip.current;
    if (!estado || !raiz.current) return;
    estadoFlip.current = null;
    Flip.from(estado, {
      targets: raiz.current.querySelectorAll('.ecra-w'),
      duration: 0.45,
      ease: 'power3.inOut',
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }),
    });
  }, [ecra]);

  // entrada: os widgets sobem em cascata, com um pouco de mola
  useGSAP(() => {
    if (!movimentoPermitido()) return;
    gsap.from('.ecra-w', { y: 28, opacity: 0, scale: 0.96, duration: 0.6, stagger: 0.06, ease: 'back.out(1.4)', clearProps: 'transform,opacity' });
  }, { scope: raiz });

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function aoLargar({ active, over }) {
    if (!over || active.id === over.id) return;
    const de = ecra.widgets.findIndex((w) => w.id === active.id);
    const para = ecra.widgets.findIndex((w) => w.id === over.id);
    mudarComFlip(moverWidget(ecra, de, para));
  }

  function entrar() {
    acabouDeEntrar.current = true;
    onEntrarEdicao();
  }

  // o toque que abriu a edição não pode também abrir o link do widget
  function aoClicar(e) {
    if (acabouDeEntrar.current || emEdicao) {
      if (!e.target.closest('.ecra-w__botao')) { e.preventDefault(); e.stopPropagation(); }
      acabouDeEntrar.current = false;
    }
  }

  return (
    <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={aoLargar}>
      <SortableContext items={ecra.widgets.map((w) => w.id)} strategy={semDeslocar}>
        <div ref={raiz} className={`ecra-grelha ecra-grelha--${ecra.estrutura} ${emEdicao ? 'em-edicao' : ''}`} onClickCapture={aoClicar}>
          {ecra.widgets.map((w, i) => (
            <ItemWidget
              key={w.id}
              widget={w}
              indice={i}
              emEdicao={emEdicao}
              contexto={contexto}
              onTirar={(indice) => mudarComFlip(tirarWidget(ecra, indice))}
              onTamanho={(indice) => mudarComFlip(mudarTamanho(ecra, indice))}
              onToqueLongo={entrar}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
