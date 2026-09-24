// ler texto em voz alta com a voz do próprio telemóvel (web speech api) — sem servidores nem chaves
export function vozDisponivel() {
  return typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance !== 'undefined';
}

// uma frase ainda comprida demais vai palavra a palavra, até encher cada pedaço
function partirPedaco(pedaco, maximo) {
  if (pedaco.length <= maximo) return [pedaco];
  const partes = [];
  let atual = '';
  const palavras = pedaco.split(' ');
  for (const palavra of palavras) {
    const junto = atual ? `${atual} ${palavra}` : palavra;
    if (junto.length > maximo && atual) {
      partes.push(atual);
      atual = palavra;
    } else {
      atual = junto;
    }
  }
  if (atual) partes.push(atual);
  return partes;
}

// no iphone uma fala comprida corta a meio — por isso lê-se frase a frase.
// só parte quando a seguir ao ponto vem maiúscula, para "art. 234.º" ficar inteiro
export function partirEmFrases(texto, maximo = 200) {
  const limpo = String(texto ?? '').replace(/\s+/g, ' ').trim();
  if (!limpo) return [];
  return limpo
    .split(/(?<=[.!?…])\s+(?=[A-ZÀ-Ý«"(])/)
    .flatMap((frase) => partirPedaco(frase, maximo));
}

// prefere uma voz de portugal; se não houver, qualquer português; senão fica a do sistema
export function escolherVoz(vozes) {
  const lista = Array.from(vozes ?? []);
  const lingua = (v) => String(v.lang ?? '').toLowerCase().replace('_', '-');
  return lista.find((v) => lingua(v) === 'pt-pt')
    ?? lista.find((v) => lingua(v).startsWith('pt'))
    ?? null;
}

// para o que estiver a ler e lê o texto novo, em português de Portugal
export function lerEmVozAlta(texto) {
  if (!vozDisponivel()) return false;
  const frases = partirEmFrases(texto);
  if (frases.length === 0) return false;
  const sintese = globalThis.speechSynthesis;
  sintese.cancel();
  // no iphone a lista de vozes pode ainda vir vazia — aí basta o lang
  const voz = escolherVoz(sintese.getVoices?.());
  // o speechSynthesis põe as falas em fila sozinho, e o cancel() limpa a fila toda
  for (const frase of frases) {
    const fala = new globalThis.SpeechSynthesisUtterance(frase);
    fala.lang = 'pt-PT';
    fala.rate = 0.95;
    if (voz) fala.voice = voz;
    sintese.speak(fala);
  }
  return true;
}

export function pararVoz() {
  if (vozDisponivel()) globalThis.speechSynthesis.cancel();
}
