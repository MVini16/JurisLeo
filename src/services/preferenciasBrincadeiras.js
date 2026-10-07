// preferências das brincadeiras (barney e provocações) — ficam só neste telemóvel, em localstorage,
// para não mexer na estrutura do firestore. tudo ligado por omissão; a leonor desliga no perfil

const CHAVE = 'jurisleo-brincadeiras';
const PADRAO = { barney: true, provocacoes: true, frequenciaMin: 10 };

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
  return novas;
}

// momento da última vez que cada brincadeira apareceu (sessionStorage: recomeça a cada abertura da app)
export function lerUltimo(chave) {
  try { return Number(sessionStorage.getItem(`jurisleo-brincadeira-${chave}`)) || 0; } catch { return 0; }
}

export function guardarUltimo(chave, agora) {
  try { sessionStorage.setItem(`jurisleo-brincadeira-${chave}`, String(agora)); } catch { /* ignora */ }
}
