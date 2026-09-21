// datas oficiais do ano letivo 2026/2027 da fdul
// fonte: despacho 54/2026 do diretor da fdul, calendário escolar da licenciatura 2026/2027
// (docs/SPEC.md, secção 5.1, verificado em 16-09-2026)
// as épocas de exames são indicativas e podem mudar

export const ANO_LETIVO = '2026/2027';

// texto obrigatório junto de qualquer ecrã que mostre estas datas
export const AVISO_DATAS_INDICATIVAS = 'as datas das épocas de exames são indicativas, confirma no site da faculdade';

export const calendarioEscolar = {
  inicioAnoLetivo: '2026-09-07',
  fimAnoLetivo: '2027-07-30',
  semanaIntegracao: { inicio: '2026-09-01', fim: '2026-09-04' },
  ferias: {
    natal: { inicio: '2026-12-21', fim: '2027-01-03' },
    pascoa: { inicio: '2027-03-22', fim: '2027-03-29' },
  },
  semestres: [
    {
      numero: 1,
      inicio: '2026-09-07',
      fim: '2027-02-19',
      aulas: { inicio: '2026-09-07', fim: '2026-12-18' },
      provasAvaliacaoContinua: { inicio: '2026-11-30', fim: '2026-12-18' },
      exames: {
        escritosEpocaNormal: { inicio: '2027-01-04', fim: '2027-01-19' },
        escritosCoincidencia: { inicio: '2027-01-21', fim: '2027-01-27', previsivel: true },
        oraisEpocaNormal: { inicio: '2027-01-22', fim: '2027-02-12' },
        recurso: { inicio: '2027-02-15', fim: '2027-02-19' },
        recursoCoincidencia: { inicio: '2027-02-22', fim: '2027-02-25', previsivel: true },
      },
    },
    {
      numero: 2,
      inicio: '2027-02-22',
      fim: '2027-07-30',
      aulas: { inicio: '2027-02-22', fim: '2027-05-28' },
      provasAvaliacaoContinua: { inicio: '2027-05-10', fim: '2027-05-28' },
      exames: {
        escritosEpocaNormal: { inicio: '2027-06-07', fim: '2027-06-25' },
        escritosCoincidencia: { inicio: '2027-06-28', fim: '2027-07-02', previsivel: true },
        oraisEpocaNormal: { inicio: '2027-06-28', fim: '2027-07-16' },
        recurso: { inicio: '2027-07-19', fim: '2027-07-23' },
        recursoCoincidencia: { inicio: '2027-07-26', fim: '2027-07-30', previsivel: true },
      },
    },
  ],
};

// nomes que a Leonor vê para cada época
const NOMES_EPOCA = {
  provasAvaliacaoContinua: 'Provas de avaliação contínua',
  escritosEpocaNormal: 'Exames escritos (época normal)',
  escritosCoincidencia: 'Exames escritos (coincidências)',
  oraisEpocaNormal: 'Provas orais (época normal)',
  recurso: 'Exames de recurso',
  recursoCoincidencia: 'Recurso (coincidências)',
};

// as chaves 'aaaa-mm-dd' comparam-se bem como texto
function dentro(chave, intervalo) {
  return chave >= intervalo.inicio && chave <= intervalo.fim;
}

// épocas em que um dia cai, para desenhar a faixa de fundo do calendário
// devolve [{ id, nome, semestre, previsivel }]; um dia pode estar em mais do que uma
export function epocasDoDia(chave) {
  const epocas = [];
  for (const sem of calendarioEscolar.semestres) {
    if (dentro(chave, sem.provasAvaliacaoContinua)) {
      epocas.push({ id: 'provasAvaliacaoContinua', nome: NOMES_EPOCA.provasAvaliacaoContinua, semestre: sem.numero, previsivel: false });
    }
    for (const [id, intervalo] of Object.entries(sem.exames)) {
      if (dentro(chave, intervalo)) {
        epocas.push({ id, nome: NOMES_EPOCA[id], semestre: sem.numero, previsivel: !!intervalo.previsivel });
      }
    }
  }
  return epocas;
}

// época normal = exames escritos ou orais da época normal
// é a leitura do regulamento (secção 5.3: "na época normal há coincidência se houver exame
// no mesmo dia ou em dia consecutivo") — a confirmar com a leonor
export function naEpocaNormal(chave) {
  return epocasDoDia(chave).some((e) => e.id === 'escritosEpocaNormal' || e.id === 'oraisEpocaNormal');
}
