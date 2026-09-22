import { describe, it, expect } from 'vitest';
import { proximaFrequencia, diasRestantes, dataLimiteMateria, materiaAteData } from './frequencia.js';

describe('proximaFrequencia', () => {
  it('devolve null sem eventos do tipo frequencia', () => {
    const eventos = [{ id: 'a', tipo: 'aula', data: new Date(2026, 10, 5) }];
    expect(proximaFrequencia(eventos, new Date(2026, 10, 1))).toBeNull();
  });

  it('ignora frequências que já passaram', () => {
    const eventos = [{ id: 'a', tipo: 'frequencia', data: new Date(2026, 10, 1) }];
    expect(proximaFrequencia(eventos, new Date(2026, 10, 5))).toBeNull();
  });

  it('escolhe a mais próxima entre várias futuras', () => {
    const eventos = [
      { id: 'longe', tipo: 'frequencia', data: new Date(2026, 11, 20) },
      { id: 'perto', tipo: 'frequencia', data: new Date(2026, 11, 5) },
      { id: 'outro-tipo', tipo: 'aula', data: new Date(2026, 11, 3) },
    ];
    const resultado = proximaFrequencia(eventos, new Date(2026, 11, 1));
    expect(resultado.id).toBe('perto');
  });

  it('conta uma frequência hoje como futura', () => {
    const hoje = new Date(2026, 10, 5, 9, 0);
    const eventos = [{ id: 'a', tipo: 'frequencia', data: new Date(2026, 10, 5, 14, 0) }];
    expect(proximaFrequencia(eventos, hoje)?.id).toBe('a');
  });
});

describe('diasRestantes', () => {
  it('calcula os dias inteiros até à data, arredondando para cima', () => {
    const hoje = new Date(2026, 10, 1, 8, 0);
    const data = new Date(2026, 10, 5, 9, 0);
    expect(diasRestantes(data, hoje)).toBe(5);
  });

  it('nunca devolve negativo para uma data já passada', () => {
    const hoje = new Date(2026, 10, 10);
    const data = new Date(2026, 10, 1);
    expect(diasRestantes(data, hoje)).toBe(0);
  });

  it('devolve 0 para hoje mesmo', () => {
    const hoje = new Date(2026, 10, 5, 10, 0);
    expect(diasRestantes(hoje, hoje)).toBe(0);
  });
});

describe('dataLimiteMateria', () => {
  it('recua 6 dias corridos a partir da frequência', () => {
    const frequencia = new Date(2026, 11, 18);
    const limite = dataLimiteMateria(frequencia);
    expect(limite.getFullYear()).toBe(2026);
    expect(limite.getMonth()).toBe(11);
    expect(limite.getDate()).toBe(12);
  });

  it('atravessa a fronteira do mês corretamente', () => {
    const frequencia = new Date(2026, 11, 3);
    const limite = dataLimiteMateria(frequencia);
    expect(limite.getMonth()).toBe(10);
    expect(limite.getDate()).toBe(27);
  });
});

describe('materiaAteData', () => {
  const sumarios = [
    { id: 'aula1', cadeiraId: 'obrigacoes-1', data: '2026-11-10', bullets: ['Contratos: formação', 'Boa fé pré-contratual'] },
    { id: 'aula2', cadeiraId: 'obrigacoes-1', data: '2026-11-17', bullets: ['Culpa in contrahendo'] },
    { id: 'aula3', cadeiraId: 'obrigacoes-1', data: '2026-11-25', bullets: ['Não deve entrar — depois do corte'] },
    { id: 'aula4', cadeiraId: 'familia', data: '2026-11-10', bullets: ['Não é desta cadeira'] },
  ];

  it('só inclui pontos da cadeira certa, até à data limite, ordenados por data', () => {
    const limite = new Date(2026, 10, 18); // 18 de novembro
    const pontos = materiaAteData(sumarios, 'obrigacoes-1', limite);
    expect(pontos.map((p) => p.texto)).toEqual([
      'Contratos: formação',
      'Boa fé pré-contratual',
      'Culpa in contrahendo',
    ]);
  });

  it('cada ponto tem uma chave estável por ocorrência e índice', () => {
    const limite = new Date(2026, 10, 30);
    const pontos = materiaAteData(sumarios, 'obrigacoes-1', limite);
    expect(pontos.find((p) => p.texto === 'Boa fé pré-contratual').chave).toBe('aula1_1');
  });

  it('devolve lista vazia sem sumários dentro do prazo', () => {
    const limite = new Date(2026, 9, 1);
    expect(materiaAteData(sumarios, 'obrigacoes-1', limite)).toEqual([]);
  });
});
