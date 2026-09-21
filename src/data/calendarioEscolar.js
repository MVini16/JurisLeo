// datas oficiais do ano letivo 2026/2027, despacho 54/2026 do diretor da fdul
// as épocas de exames são indicativas e podem mudar — confirmar sempre no site da faculdade
import { chaveData } from './feriados.js';

export const ANO_LETIVO = '2026/2027';

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

// nomes das épocas, para mostrar na faixa de fundo do calendário
const NOMES_EPOCA = {
  provasAvaliacaoContinua: 'Provas de avaliação contínua',
  escritosEpocaNormal: 'Exames escritos — época normal',
  escritosCoincidencia: 'Exames escritos — coincidências',
  oraisEpocaNormal: 'Orais — época normal',
  recurso: 'Época de recurso',
  recursoCoincidencia: 'Recurso — coincidências',
};

function paraChave(data) {
  return typeof data === 'string' ? data : chaveData(data);
}

function dentro(chave, periodo) {
  return !!periodo && chave >= periodo.inicio && chave <= periodo.fim;
}

// todas as épocas (avaliação contínua e exames) que cobrem este dia — pode ser mais do que uma,
// já que as coincidências de escritos e as orais da época normal se sobrepõem. só serve para
// marcações de fundo discretas na célula do calendário, nunca vira evento por si.
export function epocasDoDia(data) {
  const chave = paraChave(data);
  const resultado = [];
  for (const semestre of calendarioEscolar.semestres) {
    if (dentro(chave, semestre.provasAvaliacaoContinua)) {
      resultado.push({ id: 'provasAvaliacaoContinua', nome: NOMES_EPOCA.provasAvaliacaoContinua, semestre: semestre.numero, previsivel: false });
    }
    for (const id of ['escritosEpocaNormal', 'escritosCoincidencia', 'oraisEpocaNormal', 'recurso', 'recursoCoincidencia']) {
      if (dentro(chave, semestre.exames[id])) {
        resultado.push({ id, nome: NOMES_EPOCA[id], semestre: semestre.numero, previsivel: !!semestre.exames[id].previsivel });
      }
    }
  }
  return resultado;
}

// só a época normal (escritos + orais) — é a que conta para a regra dos dias consecutivos (art. 39.º)
export function naEpocaNormal(data) {
  return epocasDoDia(data).some((e) => e.id === 'escritosEpocaNormal' || e.id === 'oraisEpocaNormal');
}
