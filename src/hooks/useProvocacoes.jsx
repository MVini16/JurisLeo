// mensagens do vini enquanto a leonor escreve: `aoEscrever()` em cada tecla, `{elemento}` no jsx.
// só conta tempo de escrita a sério (parou há mais de 20s, não conta) e respeita o que ela escolheu no perfil
import { useCallback, useEffect, useRef, useState } from 'react';
import ProvocacaoVini from '../components/ProvocacaoVini.jsx';
import { PROVOCACOES, FORMATOS_PROVOCACAO } from '../data/provocacoes.js';
import { acumularEscrita, escolherSemRepetir } from '../services/brincadeiras.js';
import { lerPreferencias } from '../services/preferenciasBrincadeiras.js';

const PASSO_MS = 15000;

export function useProvocacoes() {
  const [atual, setAtual] = useState(null);
  const ultimaTecla = useRef(null);
  const ativoMs = useRef(0);
  const ultimaMensagem = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      const prefs = lerPreferencias();
      if (!prefs.provocacoes) return;

      ativoMs.current = acumularEscrita({ ativoMs: ativoMs.current, ultimaTecla: ultimaTecla.current, agora: Date.now(), passoMs: PASSO_MS });
      if (ativoMs.current < prefs.frequenciaMin * 60 * 1000) return;

      ativoMs.current = 0;
      const mensagem = escolherSemRepetir(PROVOCACOES, ultimaMensagem.current);
      ultimaMensagem.current = mensagem;
      const formato = FORMATOS_PROVOCACAO[Math.floor(Math.random() * FORMATOS_PROVOCACAO.length)];
      setAtual({ chave: Date.now(), mensagem, formato });
    }, PASSO_MS);
    return () => clearInterval(id);
  }, []);

  const aoEscrever = useCallback(() => { ultimaTecla.current = Date.now(); }, []);
  const fechar = useCallback(() => setAtual(null), []);

  const elemento = atual ? <ProvocacaoVini key={atual.chave} formato={atual.formato} mensagem={atual.mensagem} onTerminar={fechar} /> : null;

  return { elemento, aoEscrever };
}
