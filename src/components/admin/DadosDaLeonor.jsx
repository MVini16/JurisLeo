// consola do vini: os dados da conta da leonor, lidos diretamente (só leitura, ver firestore.rules).
// decidido com o vini a 07-10-2026; a leonor é avisada em Definições, Os meus dados
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { UID_LEONOR } from '../../data/contas.js';
import { recolherDadosParaExportar, descarregarTexto } from '../../services/exportar.js';
import { listarCofre, lerDoCofre } from '../../services/cofreConta.js';
import { descreverResumo } from '../../services/cofre.js';
import { painelDaLeonor } from '../../services/painelVini.js';

const SEMAFORO = { verde: '🟢', amarelo: '🟡', vermelho: '🔴' };

function haQuanto(ms) {
  if (!ms) return 'nunca';
  const min = Math.round((Date.now() - ms) / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `há ${h} h`;
  return new Date(ms).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
}

// datas do firestore em texto legível, para o ficheiro descarregado
function legivel(_chave, valor) {
  if (valor && typeof valor === 'object' && typeof valor.toDate === 'function') return valor.toDate().toISOString();
  return valor;
}

export default function DadosDaLeonor() {
  const [estado, setEstado] = useState({ fase: 'a-carregar' });
  const [versao, setVersao] = useState(0);
  const souOVini = getAuth().currentUser?.uid !== UID_LEONOR;

  useEffect(() => {
    let vivo = true;
    Promise.all([recolherDadosParaExportar(UID_LEONOR, { doServidor: true }), listarCofre(UID_LEONOR)])
      .then(([dados, cofre]) => { if (vivo) setEstado({ fase: 'pronto', dados, painel: painelDaLeonor(dados), cofre }); })
      .catch((e) => { if (vivo) setEstado({ fase: 'erro', erro: e?.code || e?.message || 'erro' }); });
    return () => { vivo = false; };
  }, [versao]);

  function descarregarTudo() {
    if (estado.dados) descarregarTexto(JSON.stringify(estado.dados, legivel, 2), `jurisleo-leonor-${new Date().toISOString().slice(0, 10)}.json`);
  }
  async function descarregarCopia(c) {
    const dados = await lerDoCofre(UID_LEONOR, c.id);
    descarregarTexto(JSON.stringify(dados, legivel, 2), `jurisleo-leonor-cofre-${c.id}.json`);
  }

  if (estado.fase === 'a-carregar') return <section className="admin-vazio">A ler os dados da Nô...</section>;
  if (estado.fase === 'erro') {
    return (
      <section className="admin-vazio" role="alert">
        Não consegui ler os dados dela ({estado.erro}). {estado.erro === 'permission-denied'
          ? 'Ou as regras novas ainda não foram publicadas, ou não entraste com a tua conta (m4r...@gmail.com).'
          : 'Vê se tens rede e tenta outra vez.'}
        <div><button type="button" className="admin-apagar" onClick={() => setVersao((v) => v + 1)}>Tentar outra vez</button></div>
      </section>
    );
  }

  const { painel: p, cofre } = estado;
  const ultimoCofre = cofre[0];

  return (
    <section className="admin-dados" aria-label="Dados da Leonor">
      <div className="admin-dados__topo">
        <h2>Dados da Nô {souOVini ? '' : '(estás na conta dela)'}</h2>
        <div className="admin-colar__linha">
          <button type="button" className="admin-apagar" onClick={() => setVersao((v) => v + 1)}>Atualizar</button>
          <button type="button" className="admin-apagar" onClick={descarregarTudo}>Descarregar tudo (JSON)</button>
        </div>
      </div>

      <div className="admin-cartoes">
        <div className="admin-cartao"><small>Cópia do telemóvel</small><b>{haQuanto(p.ultimaCopiaLocal)}</b></div>
        <div className="admin-cartao"><small>Cofre</small><b>{cofre.length ? `${cofre.length} cópias, última ${haQuanto(ultimoCofre?.em?.toMillis?.())}` : 'ainda nenhuma'}</b></div>
        <div className="admin-cartao"><small>Jogos</small><b>{p.jogos ? `${p.jogos.nivel} · ${p.jogos.xp} XP · ${p.jogos.jogadas} jogadas` : 'sem dados de jogos'}</b></div>
        <div className="admin-cartao"><small>Notas · tarefas · flashcards</small><b>{p.contagens.notas} · {p.contagens.tarefas} · {p.contagens.flashcards}</b></div>
        <div className="admin-cartao"><small>Aulas da versão antiga</small><b>{p.migracao ? `trazidas: ${p.migracao.marcas} aulas, ${p.migracao.sumarios} sumários` : 'ainda não correu'}</b></div>
      </div>

      <div className="admin-tabela-caixa">
        <table className="admin-tabela">
          <thead><tr><th>Cadeira</th><th>Aulas marcadas</th><th>Fui</th><th>Práticas dadas</th><th>Faltas inj.</th><th>Faltas just.</th><th>Sumários</th><th>Estado</th></tr></thead>
          <tbody>
            {p.cadeiras.map((c) => (
              <tr key={c.id} title={c.explicacao}>
                <td>{c.abrev}</td><td>{c.marcadas}</td><td>{c.presentes}</td><td>{c.lecionadas}</td><td>{c.injustificadas}</td><td>{c.justificadas}</td><td>{c.sumarios}</td><td>{SEMAFORO[c.semaforo] || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-duas">
        <article className="admin-detalhe">
          <h2>Aulas mais recentes</h2>
          {p.recentes.length === 0 ? <p className="admin-campo">Ainda nenhuma aula marcada.</p> : (
            <ul className="admin-lista-simples">{p.recentes.map((r) => <li key={r.chave}><b>{r.data}</b> {r.cadeira}: {r.estado}</li>)}</ul>
          )}
          {p.tarefasPorFazer.length > 0 && (<>
            <h2>Tarefas por fazer</h2>
            <ul className="admin-lista-simples">{p.tarefasPorFazer.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </>)}
        </article>
        <article className="admin-detalhe">
          <h2>Cofre (cópias diárias)</h2>
          {cofre.length === 0 ? <p className="admin-campo">Ainda sem cópias: a primeira faz-se quando ela abrir a app com a versão nova.</p> : (
            <ul className="admin-lista-simples">
              {cofre.map((c) => (
                <li key={c.id}>
                  <b>{c.id}</b> {descreverResumo(c.resumo)}{' '}
                  <button type="button" className="admin-link" onClick={() => descarregarCopia(c)}>descarregar</button>
                </li>
              ))}
            </ul>
          )}
          <h2>Escolhas guardadas</h2>
          {p.escolhas.length === 0 ? <p className="admin-campo">Nenhuma.</p> : (
            <ul className="admin-lista-simples">{p.escolhas.map((e) => <li key={e.chave}>{e.chave} <small>{haQuanto(e.em)}</small></li>)}</ul>
          )}
        </article>
      </div>
    </section>
  );
}
