// cronómetro de estudo — conta segundos activos, ignora o tempo em pausa
// o tempo vem do relógio (marcas de início), não de somar +1 a cada segundo:
// com o iphone bloqueado o safari pára os temporizadores e a soma perdia minutos
import { useState, useRef, useEffect, useCallback } from 'react';

export function useCronometro() {
  // segundos de troços anteriores (antes das pausas) e início do troço atual (ms, ou null em pausa)
  const [acumulado, setAcumulado] = useState(0);
  const [inicioTroco, setInicioTroco] = useState(null);
  const [agora, setAgora] = useState(() => Date.now());
  const [pausasFeitas, setPausasFeitas] = useState(0);
  const inicioRef = useRef(null);

  const aCorrer = inicioTroco !== null;
  const segundos = acumulado + (aCorrer ? Math.max(0, Math.floor((agora - inicioTroco) / 1000)) : 0);

  // o intervalo só serve para redesenhar; ao voltar à app acerta logo o relógio
  useEffect(() => {
    if (!aCorrer) return;
    const acertar = () => setAgora(Date.now());
    const id = setInterval(acertar, 1000);
    document.addEventListener('visibilitychange', acertar);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', acertar);
    };
  }, [aCorrer]);

  // opcoes.retomarDe: { inicio, segundos, pausasFeitas } — para continuar uma sessão que ficou a meio
  const iniciar = useCallback((opcoes) => {
    if (opcoes?.retomarDe) {
      inicioRef.current = opcoes.retomarDe.inicio;
      setAcumulado(opcoes.retomarDe.segundos);
      setPausasFeitas(opcoes.retomarDe.pausasFeitas);
    } else if (!inicioRef.current) {
      inicioRef.current = new Date();
    }
    const t = Date.now();
    setAgora(t);
    setInicioTroco((atual) => atual ?? t);
  }, []);

  const pausar = useCallback(() => {
    if (inicioTroco === null) return;
    const t = Date.now();
    setAcumulado((a) => a + Math.max(0, Math.floor((t - inicioTroco) / 1000)));
    setInicioTroco(null);
    setAgora(t);
    setPausasFeitas((p) => p + 1);
  }, [inicioTroco]);

  const retomar = useCallback(() => {
    const t = Date.now();
    setAgora(t);
    setInicioTroco((atual) => atual ?? t);
  }, []);

  // termina a sessão e devolve o resumo; reinicia o cronómetro para a próxima sessão
  const terminar = useCallback(() => {
    const t = Date.now();
    const total = acumulado + (inicioTroco !== null ? Math.max(0, Math.floor((t - inicioTroco) / 1000)) : 0);
    const resumo = {
      inicio: inicioRef.current,
      fim: new Date(t),
      minutos: Math.max(1, Math.round(total / 60)),
      pausasFeitas,
    };
    setInicioTroco(null);
    setAcumulado(0);
    setPausasFeitas(0);
    inicioRef.current = null;
    return resumo;
  }, [acumulado, inicioTroco, pausasFeitas]);

  return { segundos, aCorrer, pausasFeitas, iniciar, pausar, retomar, terminar };
}
