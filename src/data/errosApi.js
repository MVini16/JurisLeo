// o que a leonor vê quando um serviço de fora (tempo, dicionário, correção...) falha
// titulo + texto aparecem logo; a explicacao é para o botão "explicar", sem pressa nem jargão
// {hora} é trocado pela hora a que pode voltar a tentar

export const ERROS_API = {
  semLigacao: {
    titulo: 'Sem internet por agora',
    texto: 'Não faz mal. Mostro-te o que já tinha guardado.',
    explicacao:
      'O telemóvel não está ligado à internet, ou a rede está muito fraca. Tudo o que é teu (notas, faltas, tarefas) continua aqui e a app funciona na mesma. Só o que vem de fora, como o tempo, fica com a última versão que guardei. Quando a rede voltar, atualizo sozinha.',
  },
  limite: {
    titulo: 'Uma pausa curtinha',
    texto: 'Este serviço pediu um descanso. Podes voltar a tentar às {hora}.',
    textoSemHora: 'Este serviço pediu um descanso. Tenta outra vez daqui a pouco.',
    explicacao:
      'Alguns serviços que a app usa são gratuitos e, em troca, só deixam fazer um certo número de pedidos por minuto ou por dia. Chegámos a esse limite. Não estragaste nada: é só esperar um bocadinho e volta tudo ao normal.',
  },
  servicoEmBaixo: {
    titulo: 'O serviço está a descansar',
    texto: 'Não está a responder agora. Tenta outra vez daqui a pouco.',
    explicacao:
      'Esta parte da app depende de um serviço de fora (por exemplo, o do tempo). Esse serviço não respondeu a tempo, o que acontece de vez em quando. O problema é do lado deles, não do teu telemóvel. Se eu tinha alguma coisa guardada, mostro-ta entretanto.',
  },
  respostaInvalida: {
    titulo: 'Algo veio trocado',
    texto: 'A resposta chegou baralhada. Tenta outra vez, que costuma resolver.',
    explicacao:
      'O serviço respondeu, mas de uma forma que a app não conseguiu ler. Normalmente é um erro passageiro do lado deles. Se continuar a acontecer, conta ao Vini, que ele vê o que mudou.',
  },
};

// devolve { titulo, texto, explicacao } prontos a mostrar; um erro desconhecido cai no "serviço em baixo"
export function mensagemDeErro(erro, tentarDepois = null) {
  const base = ERROS_API[erro] ?? ERROS_API.servicoEmBaixo;
  let texto = base.texto;
  if (erro === 'limite') {
    const hora = tentarDepois instanceof Date && !Number.isNaN(tentarDepois.getTime())
      ? `${String(tentarDepois.getHours()).padStart(2, '0')}:${String(tentarDepois.getMinutes()).padStart(2, '0')}`
      : null;
    texto = hora ? base.texto.replace('{hora}', hora) : base.textoSemHora;
  }
  return { titulo: base.titulo, texto, explicacao: base.explicacao };
}
