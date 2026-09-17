// horário semanal real do 1.º semestre
import { useState, useEffect } from 'react';
import { useTheme } from '../context/useTheme.js';
import { horarioS1, temposLetivos, cadeirasS1 } from '../data/dadosLeonor.js';
import './Horario.css';

const DIAS = [
  { n: 1, label: 'Segunda' },
  { n: 2, label: 'Terça' },
  { n: 3, label: 'Quarta' },
  { n: 4, label: 'Quinta' },
  { n: 5, label: 'Sexta' },
];

function getCadeira(id) {
  return cadeirasS1.find((c) => c.id === id);
}

// devolve a hora atual em minutos desde a meia-noite
function minutosAgora(data) {
  return data.getHours() * 60 + data.getMinutes();
}

function paraMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export default function Horario() {
  const { darkMode } = useTheme();
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const diaSemanaAtual = agora.getDay();
  const minutosAtuais = minutosAgora(agora);

  return (
    <div className={`horario-pagina ${darkMode ? 'dark' : ''}`}>
      <header className="horario-header">
        <h1 className="horario-titulo">Horário</h1>
        <span className="horario-subtitulo">1.º semestre · Turma A, subturma 7</span>
      </header>

      <div className="horario-grid">
        <div className="horario-grid__cabecalho">
          <div className="horario-grid__canto" />
          {DIAS.map((dia) => (
            <div key={dia.n} className={`horario-grid__dia ${dia.n === diaSemanaAtual ? 'hoje' : ''}`}>
              {dia.label}
            </div>
          ))}
        </div>

        {temposLetivos.map((tempo) => {
          const inicioMin = paraMinutos(tempo.inicio);
          const fimMin = paraMinutos(tempo.fim);
          const estaAContecer = minutosAtuais >= inicioMin && minutosAtuais < fimMin;

          return (
            <div key={tempo.id} className="horario-grid__linha">
              <div className="horario-grid__tempo">
                <span className="horario-grid__hora">{tempo.inicio}</span>
                <span className="horario-grid__hora-fim">{tempo.fim}</span>
              </div>
              {DIAS.map((dia) => {
                const aula = horarioS1.find((a) => a.diaSemana === dia.n && a.tempo === tempo.id);
                const cadeira = aula && getCadeira(aula.cadeiraId);
                const emCurso = estaAContecer && dia.n === diaSemanaAtual;
                return (
                  <div key={dia.n} className={`horario-grid__celula ${dia.n === diaSemanaAtual ? 'hoje' : ''}`}>
                    {cadeira && (
                      <div className={`horario-aula ${emCurso ? 'em-curso' : ''}`} style={{ '--cor': cadeira.cor }}>
                        <span className="horario-aula__abrev">{cadeira.abrev}</span>
                        <span className="horario-aula__tipo">{aula.tipo === 'pratica' ? 'Prática' : 'Teórica'}</span>
                        <span className="horario-aula__sala">{aula.sala}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="horario-nota">
        A semana está cheia — as únicas janelas de estudo são de manhã e depois das 18h.
      </p>
    </div>
  );
}
