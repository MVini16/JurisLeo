// estado da revisão de texto (languagetool) de um campo: rever, trocar, ignorar e desfazer
// o texto continua a ser dono do formulário: este hook recebe-o e devolve-o por setTexto
// campo (opcional): num editor com formatação, substituir(inicio, fim, troca) e desfazer() mudam só o
// trecho certo, em vez de reescrever o texto todo (o que apagava a formatação)
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { reverTexto, aplicarSugestao, errosAindaValidos, filtrarConhecidas } from '../services/apis/languagetool.js';

export function useRevisaoTexto(texto, setTexto, conhecidas = [], campo = null) {
  // estado: 'parado' | 'aRever' | 'pronto' | 'erro'
  const [revisao, setRevisao] = useState({ estado: 'parado', erros: [], erro: null, tentarDepois: null });
  // o que havia antes da última troca, para o "desfazer"
  const [antesDaTroca, setAntesDaTroca] = useState(null);
  // depois de um "limite", o botão fica desativado até esta data
  const [bloqueadoAte, setBloqueadoAte] = useState(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; };
  }, []);

  // quando passa a hora do limite, o botão volta sozinho
  useEffect(() => {
    if (!bloqueadoAte) return;
    const t = setTimeout(() => setBloqueadoAte(null), Math.max(0, bloqueadoAte.getTime() - Date.now()));
    return () => clearTimeout(t);
  }, [bloqueadoAte]);

  const rever = useCallback(async (selecao = null) => {
    setRevisao({ estado: 'aRever', erros: [], erro: null, tentarDepois: null });
    setAntesDaTroca(null);
    const r = await reverTexto(texto, { selecao });
    if (!montado.current) return;
    if (r.ok) {
      setRevisao({ estado: 'pronto', erros: r.erros, erro: null, tentarDepois: null });
    } else {
      setRevisao({ estado: 'erro', erros: [], erro: r.erro, tentarDepois: r.tentarDepois });
      if (r.erro === 'limite' && r.tentarDepois) setBloqueadoAte(r.tentarDepois);
    }
  }, [texto]);

  const trocar = useCallback((erro, troca) => {
    setAntesDaTroca({ texto, erros: revisao.erros });
    // aplicarSugestao continua a acertar as posições dos erros seguintes, nos dois casos
    const r = aplicarSugestao(texto, revisao.erros, erro, troca);
    if (campo?.substituir) campo.substituir(erro.inicio, erro.inicio + erro.tamanho, troca);
    else setTexto(r.texto);
    setRevisao((atual) => ({ ...atual, erros: r.erros }));
  }, [texto, revisao.erros, setTexto, campo]);

  const ignorar = useCallback((erro) => {
    setRevisao((atual) => ({ ...atual, erros: atual.erros.filter((e) => e.id !== erro.id) }));
  }, []);

  const desfazer = useCallback(() => {
    if (!antesDaTroca) return;
    if (campo?.desfazer) campo.desfazer();
    else setTexto(antesDaTroca.texto);
    setRevisao((atual) => ({ ...atual, erros: antesDaTroca.erros }));
    setAntesDaTroca(null);
  }, [antesDaTroca, setTexto, campo]);

  const limparDesfazer = useCallback(() => setAntesDaTroca(null), []);

  // o que se mostra: só erros que ainda batem certo com o texto, sem as palavras que ela conhece
  const validos = useMemo(() => errosAindaValidos(texto, revisao.erros), [texto, revisao.erros]);
  const visiveis = useMemo(() => filtrarConhecidas(validos, conhecidas), [validos, conhecidas]);

  return {
    estado: revisao.estado,
    erros: visiveis,
    erro: revisao.erro,
    tentarDepois: revisao.tentarDepois,
    // ela escreveu por cima de algum erro depois de rever
    textoMudou: validos.length < revisao.erros.length,
    bloqueado: Boolean(bloqueadoAte),
    podeDesfazer: Boolean(antesDaTroca),
    rever, trocar, ignorar, desfazer, limparDesfazer,
  };
}
