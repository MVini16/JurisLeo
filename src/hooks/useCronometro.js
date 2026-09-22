// cronómetro de estudo — conta segundos activos, ignora o tempo em pausa
import { useState, useRef, useEffect, useCallback } from 'react';

export function useCronometro() {
  const [segundos, setSegundos] = useState(0);
  const [aCorrer, setACorrer] = useState(false);
  const [pausasFeitas, setPausasFeitas] = useState(0);
  const inicioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (aCorrer) {
      intervalRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [aCorrer]);

  // opcoes.retomarDe: { inicio, segundos, pausasFeitas } — para continuar uma sessão que ficou a meio
  const iniciar = useCallback((opcoes) => {
    if (opcoes?.retomarDe) {
      inicioRef.current = opcoes.retomarDe.inicio;
      setSegundos(opcoes.retomarDe.segundos);
      setPausasFeitas(opcoes.retomarDe.pausasFeitas);
    } else if (!inicioRef.current) {
      inicioRef.current = new Date();
    }
    setACorrer(true);
  }, []);

  const pausar = useCallback(() => {
    setACorrer(false);
    setPausasFeitas((p) => p + 1);
  }, []);

  const retomar = useCallback(() => setACorrer(true), []);

  // termina a sessão e devolve o resumo; reinicia o cronómetro para a próxima sessão
  const terminar = useCallback(() => {
    const resumo = {
      inicio: inicioRef.current,
      fim: new Date(),
      minutos: Math.max(1, Math.round(segundos / 60)),
      pausasFeitas,
    };
    setACorrer(false);
    setSegundos(0);
    setPausasFeitas(0);
    inicioRef.current = null;
    return resumo;
  }, [segundos, pausasFeitas]);

  return { segundos, aCorrer, pausasFeitas, iniciar, pausar, retomar, terminar };
}
