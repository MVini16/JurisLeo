// tutorial rápido que aparece na primeira vez que se entra no dashboard
import { useState } from 'react';
import './Tutorial.css';

const PASSOS = [
  {
    icone: '🏠',
    titulo: 'O teu Dashboard',
    texto: 'Sempre que abrires a app, vais cair aqui. Mostra a aula que tens agora ou a seguir, e a contagem para a próxima frequência.',
  },
  {
    icone: '➕',
    titulo: 'O botão + é o teu atalho',
    texto: 'Toca nele para lançares uma nota, registares uma falta, criares uma anotação ou um caso prático — tudo em dois toques, sem andares à procura.',
  },
  {
    icone: '⚖️',
    titulo: 'Cadeiras',
    texto: 'Aqui vês o estado de cada cadeira: a nota calculada automaticamente segundo o regulamento, e quantas faltas ainda podes dar antes de correres risco.',
  },
  {
    icone: '📅',
    titulo: 'Horário',
    texto: 'A tua semana toda, com a aula que está a acontecer agora destacada — para nunca teres dúvidas de onde tens de estar.',
  },
  {
    icone: '📝',
    titulo: 'Anotações e Casos',
    texto: 'Regista o que deu em cada aula, e resolve casos práticos com a estrutura de sempre: factos, questão, enquadramento, subsunção, conclusão.',
  },
  {
    icone: '👤',
    titulo: 'Perfil',
    texto: 'É lá que mudas o tema, ou terminas sessão, sempre que precisares.',
  },
];

export default function Tutorial({ onTerminar }) {
  const [passo, setPasso] = useState(0);
  const ultimo = passo === PASSOS.length - 1;
  const atual = PASSOS[passo];

  function seguinte() {
    if (ultimo) onTerminar();
    else setPasso((p) => p + 1);
  }

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <button className="tutorial-saltar" onClick={onTerminar}>Saltar</button>

        <div className="tutorial-icone">{atual.icone}</div>
        <h2 className="tutorial-titulo">{atual.titulo}</h2>
        <p className="tutorial-texto">{atual.texto}</p>

        <div className="tutorial-pontos">
          {PASSOS.map((_, i) => (
            <span key={i} className={`tutorial-ponto ${i === passo ? 'ativo' : ''}`} />
          ))}
        </div>

        <div className="tutorial-botoes">
          {passo > 0 && (
            <button className="tutorial-btn-secundario" onClick={() => setPasso((p) => p - 1)}>← Voltar</button>
          )}
          <button className="tutorial-btn-principal" onClick={seguinte}>
            {ultimo ? 'Percebido! 🚀' : 'Seguinte →'}
          </button>
        </div>
      </div>
    </div>
  );
}
