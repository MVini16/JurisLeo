// os selos da coleção dos jogos: máximas jurídicas latinas com o significado. cada jogo pode dar um selo novo;
// juntar todos é o objetivo de longo prazo. raridade: comum, raro ou lendario (muda só a cor e a probabilidade)
export const SELOS = [
  { id: 'pacta', latim: 'Pacta sunt servanda', significado: 'Os acordos devem ser cumpridos.', raridade: 'comum' },
  { id: 'ignorantia', latim: 'Ignorantia legis non excusat', significado: 'A ignorância da lei não justifica o seu incumprimento.', raridade: 'comum' },
  { id: 'audiatur', latim: 'Audiatur et altera pars', significado: 'Ouça-se também a outra parte.', raridade: 'comum' },
  { id: 'iura', latim: 'Iura novit curia', significado: 'O tribunal conhece o direito.', raridade: 'comum' },
  { id: 'posterior', latim: 'Lex posterior derogat priori', significado: 'A lei posterior revoga a anterior.', raridade: 'comum' },
  { id: 'specialis', latim: 'Lex specialis derogat legi generali', significado: 'A lei especial prevalece sobre a geral.', raridade: 'comum' },
  { id: 'ubi', latim: 'Ubi societas, ibi ius', significado: 'Onde há sociedade, há direito.', raridade: 'comum' },
  { id: 'dura', latim: 'Dura lex, sed lex', significado: 'A lei é dura, mas é a lei.', raridade: 'comum' },
  { id: 'impossibilia', latim: 'Ad impossibilia nemo tenetur', significado: 'Ninguém é obrigado ao impossível.', raridade: 'comum' },
  { id: 'erga', latim: 'Erga omnes', significado: 'Em relação a todos.', raridade: 'comum' },
  { id: 'inter', latim: 'Inter partes', significado: 'Entre as partes.', raridade: 'comum' },
  { id: 'bonafide', latim: 'Bona fide', significado: 'De boa-fé.', raridade: 'comum' },
  { id: 'dubio', latim: 'In dubio pro reo', significado: 'Na dúvida, decide-se a favor do arguido.', raridade: 'raro' },
  { id: 'nulla', latim: 'Nulla poena sine lege', significado: 'Não há pena sem lei.', raridade: 'raro' },
  { id: 'bis', latim: 'Ne bis in idem', significado: 'Ninguém pode ser julgado duas vezes pelo mesmo facto.', raridade: 'raro' },
  { id: 'rebus', latim: 'Rebus sic stantibus', significado: 'Estando as coisas assim: os contratos valem enquanto as circunstâncias se mantiverem.', raridade: 'raro' },
  { id: 'factum', latim: 'Venire contra factum proprium', significado: 'Ninguém pode agir contra o seu próprio comportamento anterior.', raridade: 'raro' },
  { id: 'cogens', latim: 'Ius cogens', significado: 'Direito imperativo: as normas que nenhum Estado pode afastar por acordo.', raridade: 'raro' },
  { id: 'habeas', latim: 'Habeas corpus', significado: 'Providência contra a prisão ilegal.', raridade: 'lendario' },
  { id: 'judicata', latim: 'Res judicata pro veritate habetur', significado: 'A coisa julgada tem-se por verdade.', raridade: 'lendario' },
];

export const RARIDADES = {
  comum: { rotulo: 'Comum', peso: 70 },
  raro: { rotulo: 'Raro', peso: 25 },
  lendario: { rotulo: 'Lendário', peso: 5 },
};
