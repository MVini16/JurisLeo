// a toga que se completa: marcos do semestre desbloqueiam peças — capelo, beca, fita, medalha
import { useHistoricoEstudo } from '../hooks/useHistoricoEstudo.js';
import { useCasos } from '../hooks/useCasos.js';
import { useCadeirasAprovadas } from '../hooks/useCadeirasAprovadas.js';
import { minutosPorDia, sequenciaAtual } from '../services/estatisticasEstudo.js';
import { pecasDesbloqueadas, PECAS_TOGA } from '../services/toga.js';
import './PerfilToga.css';

export default function PerfilToga() {
  const { sessoes, loading } = useHistoricoEstudo(120);
  const { casos } = useCasos();
  const { aprovadas } = useCadeirasAprovadas();

  if (loading) return null;

  const porDia = minutosPorDia(sessoes);
  const sequenciaDias = sequenciaAtual(porDia, new Date()).dias;
  const casosResolvidos = casos.filter((c) => c.estado === 'resolvido' || c.estado === 'corrigido').length;

  const pecas = pecasDesbloqueadas({
    totalSessoes: sessoes.length,
    sequenciaDias,
    casosResolvidos,
    cadeirasAprovadas: aprovadas,
  });

  const numDesbloqueadas = Object.values(pecas).filter(Boolean).length;

  return (
    <section className="pt">
      <h2 className="pt-titulo">A tua toga ({numDesbloqueadas}/{PECAS_TOGA.length})</h2>
      <div className="pt-pecas">
        {PECAS_TOGA.map((p) => (
          <div key={p.chave} className={`pt-peca ${pecas[p.chave] ? 'desbloqueada' : ''}`}>
            <span className="pt-peca__icone">{pecas[p.chave] ? p.icone : '🔒'}</span>
            <span className="pt-peca__nome">{p.nome}</span>
            <span className="pt-peca__descricao">{p.descricao}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
