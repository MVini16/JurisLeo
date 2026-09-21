// ler texto em voz alta com a voz do próprio telemóvel (web speech api) — sem servidores nem chaves
export function vozDisponivel() {
  return typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance !== 'undefined';
}

// para o que estiver a ler e lê o texto novo, em português de Portugal
export function lerEmVozAlta(texto) {
  if (!vozDisponivel() || !String(texto ?? '').trim()) return false;
  globalThis.speechSynthesis.cancel();
  const fala = new globalThis.SpeechSynthesisUtterance(String(texto));
  fala.lang = 'pt-PT';
  fala.rate = 0.95;
  globalThis.speechSynthesis.speak(fala);
  return true;
}

export function pararVoz() {
  if (vozDisponivel()) globalThis.speechSynthesis.cancel();
}
