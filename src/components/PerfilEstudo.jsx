// o estudo dela no perfil: uma frase com o essencial, o mapa de calor e as horas por cadeira
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistoricoEstudo } from '../hooks/useHistoricoEstudo.js';
import { minutosPorDia, sequenciaAtual, mapaDeCalor, minutosDaSemana, minutosPorCadeira, textoDuracao } from '../services/estatisticasEstudo.js';
import { coresCadeiras, nomeCurtoCadeira } from '../data/dadosLeonor.js';
import Carregando from './animacoes/Carregando.jsx';
import './PerfilEstudo.css';

const SEMANAS = 12;
const DIAS_SEMANA = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

// só desenha: recebe os dados já calculados
export function PerfilEstudoVista({ dados, onComecar }) {
  const maximo = dados.porCadeira[0]?.minutos || 1;
  const { dias } = dados.sequencia;

  return (
    <section className="pe">
      <h2 className="pe-titulo">O teu estudo</h2>

      {dados.total === 0 ? (
        <div className="pe-vazio">
          <p>Ainda não estudaste com o cronómetro. Cada sessão que registares aparece aqui.</p>
          <button type="button" className="pe-botao" onClick={onComecar}>Começar uma sessão</button>
        </div>
      ) : (
        <>
          <p className="pe-resumo">
            {dias > 0
              ? <>Estás com <b>{dias} {dias === 1 ? 'dia seguido' : 'dias seguidos'}</b> a estudar. </>
              : <>Hoje é um bom dia para começar uma sequência. </>}
            {dados.semana > 0
              ? <>Esta semana já vais em <b>{textoDuracao(dados.semana)}</b>.</>
              : <>Esta semana ainda não estudaste.</>}
          </p>
          <p className="pe-nota">Um dia de descanso por semana não quebra a sequência.</p>

          <h3 className="pe-sub">Dia a dia</h3>
          <div className="pe-calor" role="img" aria-label={`Mapa de estudo das últimas ${SEMANAS} semanas`}>
            <div className="pe-dias" aria-hidden="true">{DIAS_SEMANA.map((d, i) => <span key={i}>{d}</span>)}</div>
            <div className="pe-grelha">
              {dados.calor.flat().map((dia) => (
                <i
                  key={dia.chave}
                  className={`pe-dia nivel-${dia.nivel} ${dia.futuro ? 'futuro' : ''}`}
                  title={dia.minutos ? `${dia.chave}: ${textoDuracao(dia.minutos)}` : dia.chave}
                />
              ))}
            </div>
          </div>
          <div className="pe-legenda" aria-hidden="true">
            <span>menos</span>{[0, 1, 2, 3, 4].map((n) => <i key={n} className={`pe-dia nivel-${n}`} />)}<span>mais</span>
          </div>

          <h3 className="pe-sub">Por cadeira, nas últimas {SEMANAS} semanas</h3>
          <ul className="pe-cadeiras">
            {dados.porCadeira.map((c) => (
              <li key={c.cadeiraId}>
                <span className="pe-cadeira-nome">{c.cadeiraId === 'semCadeira' ? 'Sem cadeira' : nomeCurtoCadeira(c.cadeiraId)}</span>
                <span className="pe-cadeira-barra">
                  <i style={{ transform: `scaleX(${c.minutos / maximo})`, background: coresCadeiras[c.cadeiraId] || 'var(--gold)' }} />
                </span>
                <span className="pe-cadeira-tempo">{textoDuracao(c.minutos)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default function PerfilEstudo() {
  const navigate = useNavigate();
  const { sessoes, loading } = useHistoricoEstudo(SEMANAS * 7 + 7);

  const dados = useMemo(() => {
    const hoje = new Date();
    const porDia = minutosPorDia(sessoes);
    const desde = new Date(hoje);
    desde.setDate(desde.getDate() - SEMANAS * 7);
    const porCadeira = minutosPorCadeira(sessoes, desde);
    return {
      sequencia: sequenciaAtual(porDia, hoje),
      semana: minutosDaSemana(porDia, hoje),
      calor: mapaDeCalor(porDia, hoje, SEMANAS),
      porCadeira,
      total: porCadeira.reduce((soma, c) => soma + c.minutos, 0),
    };
  }, [sessoes]);

  if (loading) return <Carregando texto="A carregar o teu estudo..." />;
  return <PerfilEstudoVista dados={dados} onComecar={() => navigate('/estudo')} />;
}
