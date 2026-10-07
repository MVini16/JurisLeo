// preferências da app (brincadeiras e folha das notas novas) — ficam só neste telemóvel, em localstorage,
// para não mexer na estrutura do firestore. tudo ligado por omissão; a leonor muda nas definições

const CHAVE = 'jurisleo-brincadeiras';
const PADRAO = {
  barney: true,
  provocacoes: true,
  frequenciaMin: 10,
  folhaNotas: 'pautado',
  estudoVisual: 'feed',
  animacoes: 'elegante',
  hojeVisual: 'stories',
  jogosSkin: 'tribunal',
  jogosSom: true,
  // boneco do vini: aparece por omissão, "as vezes" puxa conversa, e o contacto do vini fica só neste telemóvel
  boneco: true,
  bonecoAspeto: 'A',
  bonecoPosicao: 'esquerda',
  bonecoConversa: 'as-vezes',
  bonecoContacto: '',
  // partilhar com o vini: desligado por omissão, ela liga o que quiser e manda o resumo quando quiser
  partilhaEstudo: false,
  partilhaJogos: false,
  partilhaEstado: false,
};

// quem quiser reagir a mudanças (o boneco, as definições) subscreve aqui
const ouvintes = new Set();
export function subscrever(ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

// o mesmo objeto enquanto o texto guardado não mudar, para o useSyncExternalStore não entrar em ciclo
let ultimoTexto = null;
let ultimoObjeto = { ...PADRAO };
export function instantaneoPreferencias() {
  let texto = '';
  try { texto = localStorage.getItem(CHAVE) || ''; } catch { /* sem localstorage */ }
  if (texto !== ultimoTexto) {
    ultimoTexto = texto;
    ultimoObjeto = lerPreferencias();
  }
  return ultimoObjeto;
}

export function lerPreferencias() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CHAVE) || '{}');
    return { ...PADRAO, ...guardado };
  } catch {
    return { ...PADRAO };
  }
}

export function guardarPreferencias(parcial) {
  const novas = { ...lerPreferencias(), ...parcial };
  try { localStorage.setItem(CHAVE, JSON.stringify(novas)); } catch { /* sem localstorage, fica só na sessão */ }
  ouvintes.forEach((o) => o());
  return novas;
}

// momento da última vez que cada brincadeira apareceu (sessionStorage: recomeça a cada abertura da app)
export function lerUltimo(chave) {
  try { return Number(sessionStorage.getItem(`jurisleo-brincadeira-${chave}`)) || 0; } catch { return 0; }
}

export function guardarUltimo(chave, agora) {
  try { sessionStorage.setItem(`jurisleo-brincadeira-${chave}`, String(agora)); } catch { /* ignora */ }
}
