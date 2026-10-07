// "os teus dados estão seguros": mostra se está tudo guardado na conta, a lista das cópias do cofre
// (uma por dia, as últimas 14) com o botão para repor, e o aviso de que o vini consegue ver estes dados
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { waitForPendingWrites } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { guardarNoCofre, listarCofre, reporDoCofre } from '../../services/cofreConta.js';
import { descreverResumo, diaDe } from '../../services/cofre.js';
import { GrupoDefinicoes, LinhaDefinicao, ConfirmarDefinicao } from './PecasDefinicoes.jsx';

const MOTIVOS = { diaria: 'Cópia do dia', manual: 'Guardada por ti', 'antes-de-repor': 'Antes de repores uma cópia', 'antes-da-migracao': 'Antes de trazer as aulas antigas' };

function quando(c) {
  const d = c.em?.toDate?.();
  if (!d) return c.dia || c.id;
  return d.toLocaleString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// "tudo guardado" quando o firestore confirma que não há nada por enviar; sem rede diz que fica no telemóvel
function useEstadoGuardado() {
  const [estado, setEstado] = useState('a-ver');
  useEffect(() => {
    let vivo = true;
    async function ver() {
      if (!navigator.onLine) { setEstado('sem-rede'); return; }
      setEstado((e) => (e === 'guardado' ? e : 'a-enviar'));
      const limite = new Promise((r) => setTimeout(() => r('demora'), 15000));
      const r = await Promise.race([waitForPendingWrites(db).then(() => 'ok'), limite]).catch(() => 'demora');
      if (vivo) setEstado(r === 'ok' ? 'guardado' : 'a-enviar');
    }
    ver();
    const t = setInterval(ver, 10000);
    window.addEventListener('online', ver);
    window.addEventListener('offline', ver);
    return () => { vivo = false; clearInterval(t); window.removeEventListener('online', ver); window.removeEventListener('offline', ver); };
  }, []);
  return estado;
}

const TEXTO_ESTADO = {
  'a-ver': ['A confirmar...', 'A ver se está tudo na tua conta'],
  guardado: ['Tudo guardado na tua conta', 'Mesmo que apagues a app ou mudes de telemóvel, está tudo lá'],
  'a-enviar': ['A enviar para a tua conta...', 'Deixa a app aberta uns segundos, com rede'],
  'sem-rede': ['Sem rede', 'O que fizeres fica no telemóvel e vai para a conta quando a rede voltar. Não apagues a app até lá'],
};

export default function CofreDados({ indice = 0 }) {
  const estado = useEstadoGuardado();
  const [copias, setCopias] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');
  const [aRepor, setARepor] = useState(null);
  const uid = getAuth().currentUser?.uid;

  // muda depois de guardar ou repor, para a lista se ler outra vez
  const [versao, setVersao] = useState(0);
  const carregar = () => setVersao((v) => v + 1);
  useEffect(() => {
    if (!uid) return undefined;
    let vivo = true;
    listarCofre(uid).then((c) => { if (vivo) setCopias(c); }).catch(() => { if (vivo) setCopias([]); });
    return () => { vivo = false; };
  }, [uid, versao]);

  async function guardarAgora() {
    if (!uid) return;
    setOcupado(true); setAviso('');
    try {
      await guardarNoCofre(uid, { id: `${diaDe(new Date())}-manual-${Date.now()}`, porCima: true, motivo: 'manual' });
      setAviso('Cópia guardada na tua conta.');
      await carregar();
    } catch {
      setAviso('Não consegui guardar agora. Precisas de rede. Tenta outra vez daqui a pouco.');
    } finally { setOcupado(false); }
  }

  async function repor() {
    const c = aRepor;
    setARepor(null);
    if (!uid || !c) return;
    setOcupado(true); setAviso('');
    try {
      await reporDoCofre(uid, c.id);
      setAviso('Cópia reposta. Fecha a app e abre-a outra vez para veres tudo.');
      await carregar();
    } catch {
      setAviso('Não consegui repor. Precisas de rede. Tenta outra vez.');
    } finally { setOcupado(false); }
  }

  const [titulo, descricao] = TEXTO_ESTADO[estado];

  return (
    <>
      <GrupoDefinicoes
        titulo="Os teus dados estão seguros" indice={indice}
        nota="Uma vez por dia a app guarda sozinha uma cópia de tudo (aulas, faltas, notas, sumários, tarefas, jogos e escolhas) na tua conta. Ficam as últimas 14. O Vini consegue ver estes dados na consola dele, para te ajudar se alguma coisa desaparecer."
      >
        <LinhaDefinicao icone="base" tipo="info" rotulo={titulo} descricao={descricao} />
        <LinhaDefinicao icone="base" tipo="acao" rotulo="Guardar uma cópia agora" descricao="Antes de mudares alguma coisa grande" ocupado={ocupado} aoClicar={guardarAgora} />
        {aviso && <p className="def-grupo__nota" role="status">{aviso}</p>}
      </GrupoDefinicoes>

      {copias && copias.length > 0 && (
        <GrupoDefinicoes titulo="Cópias guardadas" indice={indice + 1} nota="Repor volta a pôr tudo como estava nesse dia. Antes de repor, a app guarda o estado de agora, para poderes voltar atrás.">
          {copias.map((c) => (
            <LinhaDefinicao
              key={c.id}
              tipo="acao"
              rotulo={`${MOTIVOS[c.motivo] || 'Cópia'} · ${quando(c)}`}
              descricao={descreverResumo(c.resumo)}
              valor="Repor"
              desativado={ocupado}
              aoClicar={() => setARepor(c)}
            />
          ))}
        </GrupoDefinicoes>
      )}

      {aRepor && (
        <ConfirmarDefinicao
          titulo="Repor esta cópia?"
          texto={`Vai pôr tudo como estava em ${quando(aRepor)}: ${descreverResumo(aRepor.resumo)}. O que criaste depois não se apaga. Antes, a app guarda o estado de agora.`}
          rotuloConfirmar="Repor"
          aoConfirmar={repor}
          aoCancelar={() => setARepor(null)}
        />
      )}
    </>
  );
}
