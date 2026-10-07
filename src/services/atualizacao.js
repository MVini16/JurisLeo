// as contas do aviso "há uma versão nova": comparar versões, adiar e escolher o tutorial certo para o telemóvel.
// lógica pura (sem react nem rede), para testar com vitest. a versão da app vem de data/novidades.js e o servidor
// publica a mais recente em /versao.json (escrito no build, ver vite.config.js)

export const ADIAR_MS = 6 * 60 * 60 * 1000; // "mais tarde" volta a perguntar daí a 6 horas
export const VERIFICAR_CADA_MS = 30 * 60 * 1000; // enquanto a app está aberta, vê de 30 em 30 minutos

// só avisa se o servidor tiver uma versão e ela for diferente da que está a correr
export function precisaDeAtualizar({ local, servidor }) {
  return !!servidor && !!local && servidor !== local;
}

export function estaAdiado(adiadoAte, agora) {
  return !!adiadoAte && agora < adiadoAte;
}

// ao abrir pela primeira vez não há "última versão vista": guarda-se a atual e não se mostra nada.
// depois de atualizar (vista diferente da atual) mostram-se as novidades uma vez
export function deveMostrarNovidades({ vista, atual }) {
  return !!vista && vista !== atual;
}

// o ficheiro /versao.json pode vir estragado ou ser uma página de erro: só aceita o formato esperado
export function lerVersaoDoServidor(corpo) {
  if (!corpo || typeof corpo !== 'object' || typeof corpo.versao !== 'string' || !corpo.versao) return null;
  const itens = Array.isArray(corpo.itens) ? corpo.itens.filter((i) => typeof i === 'string') : [];
  return { versao: corpo.versao, titulo: typeof corpo.titulo === 'string' ? corpo.titulo : '', itens };
}

// 'ios' (iPhone e iPad, incluindo iPadOS que se diz Mac), 'android' ou 'outra'
export function detetarPlataforma(userAgent = '', pontosDeToque = 0) {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Macintosh/i.test(userAgent) && pontosDeToque > 1) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'outra';
}

// o caminho rápido resolve quase sempre; o completo só se a versão antiga teimar
export function passosDoTutorial(plataforma, endereco) {
  const rapido = [
    { titulo: 'Fecha o JurisLeo', texto: 'Desliza do fundo do ecrã para cima, até a app mostrar as janelas abertas, e empurra o JurisLeo para cima.' },
    { titulo: 'Abre-o outra vez', texto: 'Toca no ícone no ecrã principal. A versão nova descarrega sozinha em segundo plano.' },
    { titulo: 'Fecha e abre de novo', texto: 'Repete os dois passos acima uma segunda vez. É quase sempre à segunda que a versão nova aparece.' },
  ];
  const completo = {
    ios: [
      { titulo: 'Guarda uma cópia', texto: 'Antes de apagares nada: Definições, Os meus dados, "Copiar os dados deste telemóvel". Cola o texto numa mensagem para ti.' },
      { titulo: 'Abre o Safari', texto: `Escreve o endereço ${endereco} e espera que a página carregue toda.` },
      { titulo: 'Toca em Partilhar', texto: 'É o quadrado com uma seta para cima, em baixo no centro do ecrã.' },
      { titulo: 'Adicionar ao ecrã principal', texto: 'Desce na lista, toca em "Adicionar ao ecrã principal" e depois em "Adicionar".' },
      { titulo: 'Entra com a tua conta', texto: 'Abre o ícone novo e faz login outra vez. Os teus dados da conta estão todos lá.' },
      { titulo: 'Repõe a cópia', texto: 'Definições, Os meus dados, "Repor uma cópia". Cola o texto e toca em Repor.' },
    ],
    android: [
      { titulo: 'Guarda uma cópia', texto: 'Antes de apagares nada: Definições, Os meus dados, "Copiar os dados deste telemóvel". Cola o texto numa mensagem para ti.' },
      { titulo: 'Abre o Chrome', texto: `Escreve o endereço ${endereco} e espera que a página carregue toda.` },
      { titulo: 'Abre o menu', texto: 'Toca nos três pontinhos, em cima à direita.' },
      { titulo: 'Instalar a app', texto: 'Escolhe "Instalar app" (ou "Adicionar ao ecrã principal") e confirma.' },
      { titulo: 'Entra com a tua conta', texto: 'Abre o ícone novo e faz login outra vez. Os teus dados da conta estão todos lá.' },
      { titulo: 'Repõe a cópia', texto: 'Definições, Os meus dados, "Repor uma cópia". Cola o texto e toca em Repor.' },
    ],
    outra: [
      { titulo: 'Abre o navegador', texto: `Escreve o endereço ${endereco}.` },
      { titulo: 'Atualiza a página', texto: 'Carrega em Ctrl+Shift+R (ou Cmd+Shift+R no Mac) para ir buscar a versão nova.' },
    ],
  };
  return { rapido, completo: completo[plataforma] ?? completo.outra };
}

// o que se perde se ela apagar o ícone antigo e instalar de novo: só o que está guardado no próprio telemóvel
export const AVISO_DE_REINSTALAR = 'Instalar de novo cria uma app limpa: o que só está guardado neste telemóvel (recordes e selos dos jogos, escolhas de aparência, série de estudo) perde-se, a não ser que faças a cópia no primeiro passo. As notas, tarefas e flashcards ficam na tua conta e voltam todos.';
