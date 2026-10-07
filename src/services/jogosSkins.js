// os estilos visuais dos jogos (só mudam cores e formas, as regras são iguais)
export const SKINS_JOGOS = [
  { id: 'tribunal', nome: 'Tribunal', descricao: 'Vinho e ouro, com letra de lei.' },
  { id: 'arcade', nome: 'Arcade', descricao: 'Néon, letra de máquina e brilhos.' },
  { id: 'papel', nome: 'Papel', descricao: 'Folha pautada, como um caderno.' },
  { id: 'story', nome: 'Story', descricao: 'A cor de cada jogo, com vidro fosco.' },
];
export const SKIN_INICIAL = 'tribunal';

export function skinValida(id) {
  return SKINS_JOGOS.some((s) => s.id === id) ? id : SKIN_INICIAL;
}
