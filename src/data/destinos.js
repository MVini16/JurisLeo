// todas as páginas da app, por zonas: serve à barra lateral do computador, ao menu "Mais" do telemóvel e à paleta de comandos (Ctrl+K)
export const GRUPOS_DESTINOS = [
  { titulo: 'Hoje', itens: [
    { rota: '/dashboard', icone: 'inicio', rotulo: 'Início' },
    { rota: '/feed', icone: 'feed', rotulo: 'Feed' },
    { rota: '/calendario', icone: 'calendario', rotulo: 'Calendário' },
    { rota: '/horario', icone: 'relogio', rotulo: 'Horário' },
    { rota: '/tarefas', icone: 'sabia', rotulo: 'Tarefas' },
  ] },
  { titulo: 'Faculdade', itens: [
    { rota: '/cadeiras', icone: 'livro', rotulo: 'Cadeiras' },
    { rota: '/faltas', icone: 'escudo', rotulo: 'Faltas' },
    { rota: '/sumarios', icone: 'lista', rotulo: 'Sumários' },
  ] },
  { titulo: 'Estudar', itens: [
    { rota: '/anotacoes', icone: 'pena', rotulo: 'Cadernos' },
    { rota: '/flashcards', icone: 'cartas', rotulo: 'Flashcards' },
    { rota: '/estudo', icone: 'cronometro', rotulo: 'Estudo' },
    { rota: '/casos', icone: 'balanca', rotulo: 'Casos' },
    { rota: '/glossario', icone: 'livro', rotulo: 'Glossário' },
    { rota: '/artigos', icone: 'pergaminho', rotulo: 'Artigos' },
    { rota: '/leituras', icone: 'chama', rotulo: 'Leituras' },
    { rota: '/pesquisa', icone: 'lupa', rotulo: 'Pesquisa' },
    { rota: '/jogos', icone: 'dado', rotulo: 'Jogos' },
  ] },
  { titulo: 'Eu', itens: [
    { rota: '/perfil', icone: 'pessoa', rotulo: 'Definições' },
    { rota: '/ajuda', icone: 'ajuda', rotulo: 'Ajuda' },
  ] },
];

export const TODOS_DESTINOS = GRUPOS_DESTINOS.flatMap((g) => g.itens.map((i) => ({ ...i, grupo: g.titulo })));

// filtra por texto (sem acentos nem maiúsculas) para a paleta de comandos
export function filtrarDestinos(texto, destinos = TODOS_DESTINOS) {
  const norm = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const q = norm(texto).trim();
  if (!q) return destinos;
  return destinos.filter((d) => norm(d.rotulo).includes(q) || norm(d.grupo).includes(q));
}
