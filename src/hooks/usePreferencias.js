// as preferências da app como estado de react: muda em todo o lado assim que ela mexe numa definição
import { useSyncExternalStore } from 'react';
import { subscrever, instantaneoPreferencias } from '../services/preferenciasBrincadeiras.js';

export function usePreferencias() {
  return useSyncExternalStore(subscrever, instantaneoPreferencias, instantaneoPreferencias);
}
