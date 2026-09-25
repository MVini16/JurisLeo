// liga cada id do catálogo (data/widgets.js) ao componente que o desenha
import { WidgetAula, WidgetCarteira, WidgetAquecimento, WidgetJanelas } from './WidgetsAulas.jsx';
import { WidgetFrequencias, WidgetOQueJaFiz, WidgetFlashcards, WidgetSequencia, WidgetDominio, WidgetNesteDia, WidgetLeituras } from './WidgetsEstudo.jsx';
import { WidgetTempo, WidgetTarefas, WidgetCaixa, WidgetFerramentas, WidgetBemEstar, WidgetMissoes, WidgetHorasPorRegistar, WidgetBalancoDomingo } from './WidgetsOutros.jsx';

export const COMPONENTES_WIDGETS = {
  aula: WidgetAula,
  frequencias: WidgetFrequencias,
  tempo: WidgetTempo,
  aquecimento: WidgetAquecimento,
  carteira: WidgetCarteira,
  tarefas: WidgetTarefas,
  oQueJaFiz: WidgetOQueJaFiz,
  flashcards: WidgetFlashcards,
  sequencia: WidgetSequencia,
  dominio: WidgetDominio,
  janelas: WidgetJanelas,
  caixa: WidgetCaixa,
  nesteDia: WidgetNesteDia,
  leituras: WidgetLeituras,
  ferramentas: WidgetFerramentas,
  bemEstar: WidgetBemEstar,
  missoes: WidgetMissoes,
  horasPorRegistar: WidgetHorasPorRegistar,
  balancoDomingo: WidgetBalancoDomingo,
};
