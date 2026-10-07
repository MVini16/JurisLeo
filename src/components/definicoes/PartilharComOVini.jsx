// "partilhar com o vini": a leonor liga o que quer que ele veja e manda o resumo quando quiser.
// nada é enviado sozinho e nada vai para o firebase: o resumo é um texto que ela manda por mensagem
import { useState } from 'react';
import { usePreferencias } from '../../hooks/usePreferencias.js';
import { guardarPreferencias } from '../../services/preferenciasBrincadeiras.js';
import { lerDiasDeEstudo, lerRespondidasDeHoje } from '../../services/estudoLocal.js';
import { useTarefas } from '../../hooks/useTarefas.js';
import { lerPerfilJogos, lerRecordes } from '../../services/jogosLocal.js';
import { diaDe, serieDeDias } from '../../services/modoEstudo.js';
import { partilharTexto } from '../../services/partilha.js';
import { useFaltasTodas } from '../../hooks/useFaltasTodas.js';
import { contarTarefas, estudoDaSemana, melhorSerie, montarResumo } from '../../services/resumoParaVini.js';
import { ESTADOS } from '../../data/boneco.js';
import { GrupoDefinicoes, LinhaDefinicao } from './PecasDefinicoes.jsx';

const AVISOS = {
  partilhado: 'Pronto, escolheste para onde mandar.',
  copiado: 'Copiei o resumo. Cola-o numa mensagem para o Vini.',
  cancelado: 'Não enviei nada.',
  falhou: 'Não consegui enviar nem copiar. Tenta outra vez.',
};

export default function PartilharComOVini({ indice = 0 }) {
  const prefs = usePreferencias();
  const { tarefas } = useTarefas();
  const faltas = useFaltasTodas(!!prefs.partilhaFaltas);
  const [estado, setEstado] = useState('');
  const [aviso, setAviso] = useState('');
  const [previa, setPrevia] = useState('');

  const escolhas = { estudo: prefs.partilhaEstudo, jogos: prefs.partilhaJogos, estado: prefs.partilhaEstado, tarefas: prefs.partilhaTarefas, faltas: prefs.partilhaFaltas };
  const algumLigado = escolhas.estudo || escolhas.jogos || escolhas.estado || escolhas.tarefas || escolhas.faltas;

  // o texto vê-se antes de sair, para ela saber exatamente o que o Vini vai receber
  function prepararTexto() {
    const hoje = diaDe(Date.now());
    const dias = lerDiasDeEstudo();
    return montarResumo({
      quando: Date.now(),
      escolhas,
      dados: {
        serie: serieDeDias(dias, hoje),
        diasNaSemana: estudoDaSemana(dias, hoje),
        melhorSerie: melhorSerie(dias),
        cartoesHoje: lerRespondidasDeHoje(hoje),
        perfilJogos: lerPerfilJogos(),
        recordes: lerRecordes(),
        tarefas: contarTarefas(tarefas, hoje),
        faltas,
        estado: ESTADOS.find((e) => e.id === estado)?.rotulo ?? '',
      },
    });
  }

  async function enviar() {
    const texto = previa || prepararTexto();
    const r = await partilharTexto({ titulo: 'Resumo do JurisLeo', texto });
    setAviso(AVISOS[r]);
    if (r === 'partilhado' || r === 'copiado') setPrevia('');
  }

  const interruptor = (chave, rotulo, descricao) => (
    <LinhaDefinicao
      icone="base" tipo="interruptor" rotulo={rotulo} descricao={descricao}
      ligado={prefs[chave]}
      aoClicar={() => { setPrevia(''); setAviso(''); guardarPreferencias({ [chave]: !prefs[chave] }); }}
    />
  );

  return (
    <GrupoDefinicoes
      titulo="Partilhar com o Vini" indice={indice}
      nota="Isto é um resumo que mandas tu, com o que escolheres (por exemplo, como estás). À parte disto, o Vini consegue ver os dados da tua conta (aulas, faltas, sumários, jogos e escolhas) para te ajudar se alguma coisa desaparecer, como diz em cima."
    >
      {interruptor('partilhaEstudo', 'O meu estudo', 'Dias seguidos, melhor série, dias da semana e flashcards de hoje')}
      {interruptor('partilhaJogos', 'Os meus jogos', 'Nível, XP, selos, jogadas e recordes')}
      {interruptor('partilhaTarefas', 'As minhas tarefas', 'Quantas tenho por fazer, atrasadas e feitas')}
      {interruptor('partilhaFaltas', 'As minhas faltas', 'Por cadeira: aulas dadas, faltas injustificadas e justificadas e o estado')}
      {interruptor('partilhaEstado', 'Como estou', 'Escolho eu como me sinto')}
      {prefs.partilhaEstado && ESTADOS.map((e) => (
        <LinhaDefinicao
          key={e.id} icone="base" tipo="opcao" rotulo={e.rotulo} marcada={estado === e.id}
          aoClicar={() => { setPrevia(''); setEstado(estado === e.id ? '' : e.id); }}
        />
      ))}
      {algumLigado && (
        <>
          <LinhaDefinicao icone="base" tipo="acao" rotulo="Ver o que vou enviar" descricao="Mostra o texto antes de sair" aoClicar={() => { setPrevia(prepararTexto()); setAviso(''); }} />
          <LinhaDefinicao icone="base" tipo="acao" rotulo="Enviar ao Vini" descricao="Escolhes para onde mandar" aoClicar={enviar} />
        </>
      )}
      {previa && <pre className="def-campo-grande" aria-label="O que vai ser enviado" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{previa}</pre>}
      {aviso && <p className="def-grupo__nota" role="status">{aviso}</p>}
    </GrupoDefinicoes>
  );
}
