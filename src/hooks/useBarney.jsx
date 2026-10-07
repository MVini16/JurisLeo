// liga a piada do barney a uma página: `disparar('notaAlta')` quando o momento acontece,
// `tocar` num elemento para o segredo dos 3 toques, e `{elemento}` no jsx da página
import { useCallback, useRef, useState } from 'react';
import Barney from '../components/Barney.jsx';
import { LOCAIS_BARNEY } from '../data/easterEggs.js';
import { podeDisparar, registarToque } from '../services/brincadeiras.js';
import { lerPreferencias, lerUltimo, guardarUltimo } from '../services/preferenciasBrincadeiras.js';

export function useBarney() {
  const [ativo, setAtivo] = useState(null);
  const estadoToques = useRef({ toques: [] });

  const fechar = useCallback(() => setAtivo(null), []);

  const disparar = useCallback((local) => {
    const cfg = LOCAIS_BARNEY[local];
    if (!cfg) return false;
    const agora = Date.now();
    const permitido = podeDisparar({
      ativo: lerPreferencias().barney,
      agora,
      ultimoGlobal: lerUltimo('global'),
      ultimoLocal: lerUltimo(local),
      cooldownLocalMs: cfg.cooldownMs,
      probabilidade: cfg.probabilidade,
      garantido: cfg.garantido,
    });
    if (!permitido) return false;
    guardarUltimo('global', agora);
    guardarUltimo(local, agora);
    setAtivo({ variante: cfg.variante, chave: agora });
    return true;
  }, []);

  // o segredo: 3 toques seguidos num elemento (título do dashboard, avatar do perfil)
  const tocar = useCallback(() => {
    const novo = registarToque(estadoToques.current, Date.now());
    estadoToques.current = { toques: novo.toques };
    if (novo.completo) disparar('segredo');
  }, [disparar]);

  const elemento = ativo ? <Barney key={ativo.chave} variante={ativo.variante} onTerminar={fechar} /> : null;

  return { elemento, disparar, tocar };
}
