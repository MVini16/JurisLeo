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

// as plataformas que o tutorial sabe explicar, pela ordem em que aparecem no ecrã
export const PLATAFORMAS_TUTORIAL = [
  { id: 'ios', nome: 'iPhone' },
  { id: 'android', nome: 'Android' },
  { id: 'outra', nome: 'Computador' },
];

const COPIA = { titulo: 'Guarda uma cópia', texto: 'Antes de apagares nada: abre a app, toca em Perfil, depois em Os meus dados e em "Copiar os dados deste telemóvel". Abre as Mensagens, escreve para ti própria e cola o texto lá. Fica guardado.' };
const LOGIN = { titulo: 'Entra com a tua conta', texto: 'Abre o ícone novo e faz login com o teu email e password. Só precisas de o fazer esta vez: depois a app lembra-se de ti.' };
const REPOR = { titulo: 'Repõe a cópia', texto: 'Perfil, Os meus dados, "Repor uma cópia". Cola o texto que guardaste nas Mensagens e toca em Repor. Fecha a app e abre-a outra vez para veres tudo.' };

// o caminho rápido resolve quase sempre; o completo só se a versão antiga teimar. cada plataforma tem os seus passos
export function passosDoTutorial(plataforma, endereco) {
  const rapido = {
    ios: [
      { titulo: 'Abre as janelas abertas', texto: 'No iPhone com Face ID: põe o dedo na linha de baixo do ecrã, desliza para cima até ao meio do ecrã e solta. No iPhone com botão central: carrega duas vezes no botão.' },
      { titulo: 'Fecha o JurisLeo', texto: 'Procura o cartão do JurisLeo e empurra-o para cima, até desaparecer.' },
      { titulo: 'Abre-o outra vez', texto: 'Toca no ícone do JurisLeo no ecrã principal e espera uns segundos. A versão nova descarrega sozinha em segundo plano, se tiveres rede.' },
      { titulo: 'Repete uma segunda vez', texto: 'Fecha e abre de novo, como nos passos de cima. É quase sempre à segunda vez que a versão nova aparece.' },
    ],
    android: [
      { titulo: 'Fecha o JurisLeo', texto: 'Toca no botão das janelas abertas (ou desliza do fundo para cima e pára a meio) e empurra o JurisLeo para cima.' },
      { titulo: 'Abre-o outra vez', texto: 'Toca no ícone no ecrã principal. A versão nova descarrega sozinha em segundo plano.' },
      { titulo: 'Repete uma segunda vez', texto: 'Fecha e abre de novo. É quase sempre à segunda vez que a versão nova aparece.' },
    ],
    outra: [
      { titulo: 'Atualiza a página', texto: 'No navegador, carrega em Ctrl+Shift+R (ou Cmd+Shift+R num Mac). Isto ignora a cópia guardada e vai buscar tudo outra vez.' },
      { titulo: 'Se a usas como app instalada', texto: 'Fecha a janela do JurisLeo por completo e volta a abri-la a partir do ícone. Repete uma segunda vez se a versão antiga continuar.' },
    ],
  };
  const completo = {
    ios: [
      COPIA,
      { titulo: 'Apaga o ícone antigo', texto: 'No ecrã principal, mantém o dedo em cima do ícone do JurisLeo até os ícones tremerem. Toca em "Remover app" e depois em "Apagar". Se aparecer a pergunta, escolhe apagar a app (não só tirar do ecrã).' },
      { titulo: 'Abre o Safari', texto: `Tem de ser o Safari, não outro navegador. Escreve o endereço ${endereco} na barra e espera que a página carregue toda.` },
      { titulo: 'Toca em Partilhar', texto: 'É o quadrado com uma seta para cima, na barra de baixo (ou ao lado do endereço, se o iPhone estiver deitado).' },
      { titulo: 'Adicionar ao ecrã principal', texto: 'Desce na lista até encontrares "Adicionar ao ecrã principal", toca nela e depois em "Adicionar", em cima à direita. Se vires "Abrir como app web", deixa ligado.' },
      { titulo: 'Abre pelo ícone novo', texto: 'Volta ao ecrã principal e abre o JurisLeo pelo ícone que acabou de aparecer. Não uses o Safari daqui para a frente.' },
      LOGIN,
      REPOR,
      { titulo: 'Notificações (opcional)', texto: 'Se quiseres um aviso quando houver uma versão nova: Perfil, Os meus dados, "Avisos de versão nova", "Ligar as notificações" e toca em Permitir. Só funciona com a app aberta pelo ícone do ecrã principal.' },
    ],
    android: [
      COPIA,
      { titulo: 'Abre o Chrome', texto: `Escreve o endereço ${endereco} e espera que a página carregue toda.` },
      { titulo: 'Abre o menu', texto: 'Toca nos três pontinhos, em cima à direita.' },
      { titulo: 'Instalar a app', texto: 'Escolhe "Instalar app" (ou "Adicionar ao ecrã principal") e confirma.' },
      LOGIN,
      REPOR,
    ],
    outra: [
      COPIA,
      { titulo: 'Abre o navegador', texto: `Escreve o endereço ${endereco} e espera que a página carregue toda.` },
      { titulo: 'Atualiza a página', texto: 'Carrega em Ctrl+Shift+R (ou Cmd+Shift+R num Mac) para ir buscar a versão nova.' },
      { titulo: 'Se a página continuar igual', texto: 'Carrega em F12, abre o separador "Aplicação" (ou "Armazenamento"), escolhe "Service Workers" e toca em "Cancelar registo". Depois, em "Armazenamento da cache", apaga as entradas e recarrega a página.' },
      { titulo: 'Para a instalares como app (opcional)', texto: 'No Chrome ou no Edge, o ícone de instalar aparece no fim da barra de endereço. No Firefox, usa a página normal.' },
      LOGIN,
    ],
  };
  const id = completo[plataforma] ? plataforma : 'outra';
  return { rapido: rapido[id], completo: completo[id] };
}

// o que se perde se ela apagar o ícone antigo e instalar de novo: só o que está guardado no próprio telemóvel
export const AVISO_DE_REINSTALAR = 'Instalar de novo cria uma app limpa: o que só está guardado neste telemóvel (recordes e selos dos jogos, escolhas de aparência, série de estudo) perde-se, a não ser que faças a cópia no primeiro passo. As notas, tarefas e flashcards ficam na tua conta e voltam todos.';
