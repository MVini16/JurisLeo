// "Como tens estado": o histórico dela, com o mesmo gráfico que o Vini vê. pode editar e apagar qualquer dia.
import { useMemo, useState } from 'react';
import { useBemEstar } from '../hooks/useBemEstar.js';
import GraficoBemEstar from './GraficoBemEstar.jsx';
import FormBemEstar from './FormBemEstar.jsx';
import Carregando from './animacoes/Carregando.jsx';
import { serieParaGrafico, sequenciaRegisto, alertaPersistencia } from '../services/bemEstar.js';
import { CAMPOS_PRINCIPAIS } from '../data/bemEstar.js';
import { dataDeChave, dataCurta } from '../services/datas.js';
import './BemEstar.css';

const PERIODOS = [7, 30, 90];
const NOME_CAMPO = { humor: 'humor', energia: 'energia', motivacao: 'motivação' };

function iconeDe(campo, valor) {
  return CAMPOS_PRINCIPAIS.find((c) => c.id === campo)?.niveis.find((n) => n.valor === valor)?.icone || '·';
}

export default function PerfilBemEstar() {
  const { registos, camposAtivos, loading, guardar, apagar } = useBemEstar();
  const [dias, setDias] = useState(30);
  const [edicao, setEdicao] = useState(null); // { chave, janela }
  const [apagarPendente, setApagarPendente] = useState(null);

  const dados = useMemo(() => {
    const hoje = new Date();
    return {
      serie: serieParaGrafico(registos, dias, hoje),
      sequencia: sequenciaRegisto(registos, hoje),
      alerta: alertaPersistencia(registos, hoje),
      recentes: serieParaGrafico(registos, 7, hoje).reverse().filter((p) => registos[p.chave]),
    };
  }, [registos, dias]);

  if (loading) return <Carregando texto="A carregar..." />;

  if (edicao) {
    const janela = edicao.janela;
    return (
      <section className="pe bem-perfil">
        <h2 className="pe-titulo">Editar · {dataCurta(dataDeChave(edicao.chave))}, {janela === 'manha' ? 'manhã' : 'noite'}</h2>
        <FormBemEstar
          janela={janela}
          inicial={registos[edicao.chave]?.[janela]}
          camposAtivos={camposAtivos}
          rotuloGuardar="Guardar alterações"
          onGuardar={async (d) => { await guardar(edicao.chave, janela, d); setEdicao(null); }}
          onCancelar={() => setEdicao(null)}
        />
      </section>
    );
  }

  const semRegistos = Object.keys(registos).length === 0;

  return (
    <section className="pe bem-perfil">
      <h2 className="pe-titulo">Como tens estado</h2>

      {semRegistos ? (
        <p className="bem-nota">Quando contares como estás no ecrã de início, o histórico aparece aqui. O Vini vê o mesmo gráfico.</p>
      ) : (
        <>
          <p className="pe-resumo">
            {dados.sequencia > 0 ? <>Contaste como estás <b>{dados.sequencia} {dados.sequencia === 1 ? 'dia seguido' : 'dias seguidos'}</b>. </> : <>Hoje ainda não contaste. </>}
            {dados.alerta && <>O Vini foi avisado que a semana está a ser dura ({NOME_CAMPO[dados.alerta.campo]} em baixo há {dados.alerta.dias} dias).</>}
          </p>

          <div className="bem-periodos" role="group" aria-label="Período do gráfico">
            {PERIODOS.map((p) => <button key={p} type="button" className={`bem-chip ${dias === p ? 'ativo' : ''}`} onClick={() => setDias(p)}>{p} dias</button>)}
          </div>
          <GraficoBemEstar serie={dados.serie} />

          <h3 className="pe-sub">Últimos dias</h3>
          <ul className="bem-historico">
            {dados.recentes.map((p) => {
              const r = registos[p.chave];
              return (
                <li key={p.chave} className="bem-dia">
                  <span className="bem-dia__data">{dataCurta(dataDeChave(p.chave))}</span>
                  {r.apagado ? (
                    <span className="bem-dia__apagado">dia apagado</span>
                  ) : (
                    <>
                      <span className="bem-dia__valores" aria-label={`humor ${p.humor}, energia ${p.energia}, motivação ${p.motivacao}`}>
                        {iconeDe('humor', p.humor)} {iconeDe('energia', p.energia)} {iconeDe('motivacao', p.motivacao)}
                      </span>
                      <span className="bem-dia__acoes">
                        {r.manha && <button type="button" className="bem-link" onClick={() => setEdicao({ chave: p.chave, janela: 'manha' })}>Editar manhã</button>}
                        {r.noite && <button type="button" className="bem-link" onClick={() => setEdicao({ chave: p.chave, janela: 'noite' })}>Editar noite</button>}
                        <button type="button" className="bem-link bem-link--perigo" onClick={async () => {
                          if (apagarPendente !== p.chave) { setApagarPendente(p.chave); return; }
                          await apagar(p.chave);
                          setApagarPendente(null);
                        }}>{apagarPendente === p.chave ? 'Toca outra vez para apagar' : 'Apagar'}</button>
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
