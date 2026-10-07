// os pacotes de animação da app: cada um muda a entrada das páginas, o desfile das listas e o toque nos botões.
// o css (styles/animacoes.css) lê o atributo data-anim do <html>; aqui só ficam a lista e a ligação ao atributo
import { instantaneoPreferencias, subscrever } from './preferenciasBrincadeiras.js';

export const PACOTES_ANIMACAO = [
  { id: 'subtil', nome: 'Subtil', descricao: 'Aparecer suave, quase sem dar por isso.' },
  { id: 'elegante', nome: 'Elegante', descricao: 'Desliza de baixo com um leve desfocado.' },
  { id: 'juridico', nome: 'Jurídico', descricao: 'Entra como um carimbo a assentar no papel.' },
  { id: 'vivo', nome: 'Vivo', descricao: 'Ressalta e salta, cheio de energia.' },
  { id: 'nenhum', nome: 'Sem animações', descricao: 'Tudo aparece de uma vez.' },
];
export const PACOTE_INICIAL = 'elegante';

export function pacoteValido(id) {
  return PACOTES_ANIMACAO.some((p) => p.id === id) ? id : PACOTE_INICIAL;
}

// põe o pacote escolhido no <html> e mantém-no atualizado quando ela muda a definição
export function iniciarAnimacoes(raiz = document.documentElement) {
  const aplicar = () => { raiz.dataset.anim = pacoteValido(instantaneoPreferencias().animacoes); };
  aplicar();
  return subscrever(aplicar);
}
