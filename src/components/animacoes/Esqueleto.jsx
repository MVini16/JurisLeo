// esqueleto a brilhar: mostra a forma do que vai chegar, em vez de um texto "a carregar"
export default function Esqueleto({ linhas = 3 }) {
  return (
    <div className="esqueleto" role="status" aria-label="A carregar">
      {Array.from({ length: linhas }).map((_, i) => <span key={i} className="esqueleto__bloco" />)}
    </div>
  );
}
