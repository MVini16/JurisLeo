// "avisos de versão nova": a leonor liga as notificações do telemóvel e manda o código ao vini.
// nada vai para o firebase; só funciona se ela tocar em "permitir" (no iphone, com a app no ecrã principal)
import { useState } from 'react';
import { CHAVE_PUBLICA_PUSH } from '../../data/push.js';
import { chaveParaBytes, estadoDasNotificacoes, textoDaSubscricao } from '../../services/notificacoes.js';
import { partilharTexto } from '../../services/partilha.js';
import { GrupoDefinicoes, LinhaDefinicao } from './PecasDefinicoes.jsx';

function lerAmbiente() {
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  return {
    temServiceWorker: 'serviceWorker' in navigator,
    temPush: 'PushManager' in window,
    temNotificacoes: 'Notification' in window,
    ios,
    instalada: window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true,
    permissao: 'Notification' in window ? Notification.permission : 'denied',
    temChave: !!CHAVE_PUBLICA_PUSH,
  };
}

const MENSAGENS = {
  'instalar-primeiro': 'No iPhone, as notificações só funcionam com o JurisLeo no ecrã principal. Abre-o a partir do ícone e volta aqui.',
  recusado: 'Disseste que não às notificações. Para mudares, vai às Definições do telemóvel, Notificações, JurisLeo.',
  'sem-suporte': 'Este telemóvel ou navegador não deixa ligar notificações. Continuas a ver o aviso dentro da app.',
};

export default function AvisosDeVersao({ indice = 0 }) {
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState('');
  if (!CHAVE_PUBLICA_PUSH) return null;

  async function ligar() {
    setAviso('');
    const estado = estadoDasNotificacoes(lerAmbiente());
    if (estado !== 'ok') { setAviso(MENSAGENS[estado]); return; }
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== 'granted') { setAviso(MENSAGENS.recusado); return; }
      const registo = await navigator.serviceWorker.ready;
      const sub = (await registo.pushManager.getSubscription())
        ?? await registo.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chaveParaBytes(CHAVE_PUBLICA_PUSH) });
      const t = textoDaSubscricao(sub);
      if (!t) { setAviso('Não consegui ligar. Tenta outra vez daqui a pouco.'); return; }
      setTexto(t);
      setAviso('Ligado neste telemóvel. Falta mandares o código ao Vini, no botão de baixo.');
    } catch {
      setAviso('Não consegui ligar. Tenta outra vez daqui a pouco.');
    }
  }

  async function enviar() {
    const r = await partilharTexto({ titulo: 'Notificações do JurisLeo', texto });
    setAviso(r === 'copiado' ? 'Copiei o código. Cola-o numa mensagem para o Vini.' : r === 'partilhado' ? 'Pronto, escolheste para onde mandar.' : r === 'cancelado' ? 'Não enviei nada.' : 'Não consegui enviar nem copiar. Tenta outra vez.');
  }

  return (
    <GrupoDefinicoes
      titulo="Avisos de versão nova" indice={indice}
      nota="Quando o Vini publicar uma versão nova, o telemóvel avisa-te. Só funciona se deixares, e podes desligar nas Definições do telemóvel. O código que mandas ao Vini serve só para isto."
    >
      <LinhaDefinicao icone="base" tipo="acao" rotulo="Ligar as notificações" descricao="O telemóvel vai pedir autorização" aoClicar={ligar} />
      {texto && <LinhaDefinicao icone="base" tipo="acao" rotulo="Mandar o código ao Vini" descricao="Escolhes para onde mandar" aoClicar={enviar} />}
      {aviso && <p className="def-grupo__nota" role="status">{aviso}</p>}
    </GrupoDefinicoes>
  );
}
