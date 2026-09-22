// plano de estudo da semana: a partir das próximas provas, propõe uma cadeira por dia
// até domingo. ela aceita, muda ou ignora — nunca é obrigatório.
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { usePlanoEstudo } from '../hooks/usePlanoEstudo.js';
import { propostaDaSemana, proximaCadeira } from '../services/planoEstudo.js';
import { coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import Carregando from '../components/animacoes/Carregando.jsx';
import './PlanoEstudo.css';

export default function PlanoEstudo() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { eventos, escolhas, loading, guardarEscolha } = usePlanoEstudo();

  if (loading) return <div className="pd-pagina"><Carregando texto="A carregar..." tipo="templo" /></div>;

  const proposta = propostaDaSemana(eventos, new Date());

  return (
    <div className={`pd-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />
      <h1 className="pd-titulo">Plano de estudo da semana</h1>
      <p className="pd-sub">A partir das tuas próximas provas. Aceitas, mudas ou ignoras — é só uma proposta.</p>

      {proposta.length === 0 ? (
        <EstadoVazio
          titulo="Sem provas marcadas, sem plano para propor."
          texto="Assim que marcares uma frequência ou exame no calendário, aparece aqui uma proposta para a semana."
          acao={{ texto: 'Abrir o calendário', fn: () => navigate('/calendario') }}
        />
      ) : (
        <ul className="pd-lista">
          {proposta.map((dia) => {
            const escolha = escolhas[dia.chave];
            const ignorado = escolha?.estado === 'ignorado';
            const cadeiraId = escolha?.estado === 'mudado' ? escolha.cadeiraId : dia.cadeiraId;
            const aceite = escolha?.estado === 'aceite';

            return (
              <li key={dia.chave} className={`pd-dia ${ignorado ? 'ignorado' : ''}`} style={{ '--cor': coresCadeiras[cadeiraId] || '#b8963e' }}>
                <div className="pd-dia__topo">
                  <span className="pd-dia__nome">{dia.diaSemana}</span>
                  {!ignorado && <span className="pd-dia__cadeira">{abrevCadeiras[cadeiraId]}</span>}
                </div>

                {ignorado ? (
                  <div className="pd-dia__ignorado">
                    <span>Ignorado.</span>
                    <button onClick={() => guardarEscolha(dia.chave, null)}>Repor</button>
                  </div>
                ) : (
                  <>
                    <p className="pd-dia__motivo">{dia.motivo}</p>
                    <div className="pd-dia__acoes">
                      <button
                        className={`pd-btn ${aceite ? 'ativo' : ''}`}
                        onClick={() => { guardarEscolha(dia.chave, { estado: 'aceite', cadeiraId }); navigate('/estudo', { state: { cadeiraId } }); }}
                      >
                        {aceite ? '✓ Aceite' : 'Aceitar'}
                      </button>
                      <button className="pd-btn" onClick={() => guardarEscolha(dia.chave, { estado: 'mudado', cadeiraId: proximaCadeira(cadeiraId, eventos, new Date()) })}>
                        Mudar
                      </button>
                      <button className="pd-btn pd-btn--fraco" onClick={() => guardarEscolha(dia.chave, { estado: 'ignorado' })}>
                        Ignorar
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
