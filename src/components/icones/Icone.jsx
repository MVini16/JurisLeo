// conjunto de ícones próprio do JurisLeo: traço fino, com um detalhe a dourado em cada um e uma animação própria.
// `ativo` desenha o ícone com um traço e faz um pequeno salto; `viva` deixa a animação própria a correr sempre (ex.: a chama da série)
import './Icone.css';

const DESENHOS = {
  // casa com uma janela-coração
  inicio: (<>
    <path className="ic__tr" d="M4 11.2 12 4l8 7.2V19a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19z" />
    <path className="ic__ac ic__bate" d="M12 16.6c-2-1.3-3-2.2-3-3.4a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 1.2-1 2.1-3 3.4z" />
  </>),
  // o feed: um ecrã vertical com uma faísca
  feed: (<>
    <rect className="ic__tr" x="6.5" y="3" width="11" height="18" rx="3.2" />
    <path className="ic__ac ic__gira" d="M12 8.2l1.1 2.7 2.7 1.1-2.7 1.1L12 15.8l-1.1-2.7L8.2 12l2.7-1.1z" />
  </>),
  // cartas empilhadas
  cartas: (<>
    <rect className="ic__tr ic__atras" x="7.5" y="3.5" width="12" height="15" rx="2.4" transform="rotate(8 13.5 11)" />
    <rect className="ic__tr" x="4.5" y="5.5" width="12" height="15" rx="2.4" />
    <path className="ic__ac" d="M8 11.5h5M8 14.5h3" />
  </>),
  // calendário com selo
  calendario: (<>
    <rect className="ic__tr" x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path className="ic__tr" d="M3.5 10h17M8 3v4M16 3v4" />
    <path className="ic__ac ic__visto" d="m8.8 15.2 2.2 2.2 4.2-4.4" />
  </>),
  // três pontos que se afastam
  mais: (<>
    <circle className="ic__ac ic__p1" cx="5.5" cy="12" r="1.7" />
    <circle className="ic__tr ic__p2" cx="12" cy="12" r="1.7" />
    <circle className="ic__ac ic__p3" cx="18.5" cy="12" r="1.7" />
  </>),
  // marcador com coração
  guardar: (<>
    <path className="ic__tr" d="M7 3.5h10A1.5 1.5 0 0 1 18.5 5v15.5L12 16.8 5.5 20.5V5A1.5 1.5 0 0 1 7 3.5z" />
    <path className="ic__ac ic__enche" d="M12 13.2c-1.6-1-2.4-1.8-2.4-2.8a1.3 1.3 0 0 1 2.4-.7 1.3 1.3 0 0 1 2.4.7c0 1-.8 1.8-2.4 2.8z" />
  </>),
  // seta que sai de uma caixa
  abrir: (<>
    <path className="ic__tr" d="M13 4.5h6.5V11M19.5 4.5 11 13" />
    <path className="ic__ac" d="M17.5 14.5v3.7a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 18.2V8.3a1.8 1.8 0 0 1 1.8-1.8h3.7" />
  </>),
  // visto grande
  sabia: (<>
    <circle className="ic__tr" cx="12" cy="12" r="8.6" />
    <path className="ic__ac ic__visto" d="m8 12.4 2.8 2.8L16.2 9.4" />
  </>),
  // cruz
  naosabia: (<>
    <circle className="ic__tr" cx="12" cy="12" r="8.6" />
    <path className="ic__ac ic__visto" d="m9 9 6 6M15 9l-6 6" />
  </>),
  // chama da série
  chama: (<>
    <path className="ic__tr ic__oscila" d="M12 3c.6 3 3.6 4.6 3.6 8.4A3.6 3.6 0 0 1 12 15a3.6 3.6 0 0 1-3.6-3.6c0-1.3.5-2.2 1.2-3C10 10 11 10 11.4 9 11.7 7.2 11.2 4.8 12 3z" transform="translate(0 2.5)" />
    <path className="ic__ac ic__oscila" d="M12 19.400c-1.2 0-2-.8-2-1.9 0-1 .8-1.4 1.2-2.2.3.6 1 .8 1.3 1.5.2.4.4.7.4 1.1 0 .8-.4 1.5-.9 1.500z" transform="translate(0 .4)" />
  </>),
  // balança (casos)
  balanca: (<>
    <path className="ic__tr" d="M12 4v16M7 20h10M5 7.5h14" />
    <path className="ic__ac ic__pende" d="M5 7.5 2.8 13a2.8 2.8 0 0 0 4.4 0zM19 7.5 16.8 13a2.8 2.8 0 0 0 4.4 0z" />
  </>),
  // livro com marcador (glossário)
  livro: (<>
    <path className="ic__tr" d="M4.5 5.500A2 2 0 0 1 6.5 3.500H19v16H6.500a2 2 0 0 0-2 2z" />
    <path className="ic__ac" d="M8.5 8.500h6.500M8.5 11.500h4" />
  </>),
  // pena (notas)
  pena: (<>
    <path className="ic__tr" d="M20 4.200c-6.5.2-11 3.8-11.8 10.300L6 17.500l2.5-.5c6-.8 10-4.8 11.5-12.800z" />
    <path className="ic__ac ic__escreve" d="M4 20.500c1.2-2.5 2.5-4.3 4.6-6" />
  </>),
  // escudo com visto (faltas)
  escudo: (<>
    <path className="ic__tr" d="M12 3.2 19 6v5.500c0 4.3-2.8 7.6-7 9.3-4.2-1.7-7-5-7-9.300V6z" />
    <path className="ic__ac ic__visto" d="m8.8 12 2.3 2.3 4.2-4.4" />
  </>),
  // dado (jogos)
  dado: (<>
    <rect className="ic__tr ic__roda" x="4.5" y="4.5" width="15" height="15" rx="3.8" />
    <circle className="ic__ac" cx="9" cy="9" r="1.1" /><circle className="ic__ac" cx="15" cy="15" r="1.1" /><circle className="ic__ac" cx="12" cy="12" r="1.1" />
  </>),
  // relógio (tarefas e prazos)
  relogio: (<>
    <circle className="ic__tr" cx="12" cy="12" r="8.6" />
    <path className="ic__ac ic__ponteiro" d="M12 7.500V12l3 1.8" />
  </>),
  // alvo (frequência)
  alvo: (<>
    <circle className="ic__tr" cx="12" cy="12" r="8.6" />
    <circle className="ic__tr" cx="12" cy="12" r="4.6" />
    <circle className="ic__ac ic__bate" cx="12" cy="12" r="1.4" />
  </>),
  // lupa (pesquisa)
  lupa: (<>
    <circle className="ic__tr" cx="10.5" cy="10.5" r="6.2" />
    <path className="ic__ac ic__pende" d="m15.2 15.2 4.8 4.8" />
  </>),
  // pergaminho com parágrafo (artigos de lei)
  pergaminho: (<>
    <path className="ic__tr" d="M7 4h11a1.5 1.5 0 0 1 1.5 1.500V17a3 3 0 0 1-3 3H6.500a3 3 0 0 0 3-3V5.500A1.5 1.5 0 0 0 8 4" />
    <path className="ic__ac" d="M12.5 8.500a2 2 0 1 0 0 3h1a2 2 0 1 1-2.5 2.5" />
  </>),
  // cronómetro (estudo)
  cronometro: (<>
    <circle className="ic__tr" cx="12" cy="13.5" r="7.2" />
    <path className="ic__tr" d="M9.5 3h5M12 3v3" />
    <path className="ic__ac ic__ponteiro" d="M12 13.500V9.8" />
  </>),
  // lista com marcadores (sumários)
  lista: (<>
    <path className="ic__tr" d="M9 7h10.500M9 12h10.500M9 17h10.5" />
    <circle className="ic__ac" cx="4.8" cy="7" r="1.1" /><circle className="ic__ac" cx="4.8" cy="12" r="1.1" /><circle className="ic__ac" cx="4.8" cy="17" r="1.1" />
  </>),
  // ponto de interrogação num balão (ajuda)
  ajuda: (<>
    <path className="ic__tr" d="M5 5.500A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.500v8a2.5 2.5 0 0 1-2.5 2.500H11l-4 4v-4H7.500A2.5 2.5 0 0 1 5 13.500z" />
    <path className="ic__ac ic__bate" d="M10.2 8.600a1.9 1.9 0 1 1 2.6 1.800c-.5.3-.8.7-.8 1.300M12 13.500v.1" />
  </>),
  // pessoa (eu e definições)
  pessoa: (<>
    <circle className="ic__tr" cx="12" cy="8.5" r="3.7" />
    <path className="ic__ac" d="M4.8 20c.8-3.6 3.7-5.5 7.2-5.500s6.4 1.9 7.2 5.5" />
  </>),
  // cartões do jogo (jurista)
  coroa: (<>
    <path className="ic__tr" d="M4 17.5 3 8l5 3.500L12 5l4 6.500L21 8l-1 9.500z" />
    <path className="ic__ac ic__bate" d="M5 20.500h14" />
  </>),
  // sol/lua (modo)
  modo: (<>
    <path className="ic__tr" d="M20 14.500A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.500z" />
    <path className="ic__ac ic__gira" d="M17 4.200v2.600M15.7 5.500h2.6" />
  </>),
};

export default function Icone({ nome, tamanho = 24, ativo = false, viva = false, titulo, className = '' }) {
  const desenho = DESENHOS[nome];
  if (!desenho) return null;
  return (
    <svg
      className={`ic ${ativo ? 'ic--ativo' : ''} ${viva ? 'ic--viva' : ''} ${className}`}
      width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none"
      strokeLinecap="round" strokeLinejoin="round"
      role={titulo ? 'img' : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true}
    >
      {desenho}
    </svg>
  );
}
