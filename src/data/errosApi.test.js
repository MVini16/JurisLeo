import { describe, it, expect } from 'vitest';
import { ERROS_API, mensagemDeErro } from './errosApi.js';

describe('mensagemDeErro', () => {
  it('todos os erros têm título, texto e explicação', () => {
    for (const erro of Object.values(ERROS_API)) {
      expect(erro.titulo).toBeTruthy();
      expect(erro.texto).toBeTruthy();
      expect(erro.explicacao).toBeTruthy();
    }
  });

  it('limite com hora mostra a hora em HH:MM', () => {
    const m = mensagemDeErro('limite', new Date(2026, 8, 24, 9, 5));
    expect(m.texto).toBe('Este serviço pediu um descanso. Podes voltar a tentar às 09:05.');
  });

  it('limite sem hora não deixa o {hora} à vista', () => {
    expect(mensagemDeErro('limite').texto).not.toContain('{hora}');
    expect(mensagemDeErro('limite', new Date('lixo')).texto).not.toContain('{hora}');
  });

  it('erro desconhecido cai no serviço em baixo', () => {
    expect(mensagemDeErro('qualquerCoisa').titulo).toBe(ERROS_API.servicoEmBaixo.titulo);
  });
});
