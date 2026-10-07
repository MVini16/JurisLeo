import { describe, it, expect, vi } from 'vitest';
import { partilharTexto, entregarFicheiro } from './partilha.js';

const abort = () => Object.assign(new Error('cancelado'), { name: 'AbortError' });

describe('partilharTexto', () => {
  it('usa o menu de partilha do telemóvel', async () => {
    const share = vi.fn().mockResolvedValue();
    expect(await partilharTexto({ titulo: 'T', texto: 'corpo' }, { navigator: { share } })).toBe('partilhado');
    expect(share).toHaveBeenCalledWith({ title: 'T', text: 'corpo' });
  });

  it('fechar o menu não é um erro', async () => {
    const share = vi.fn().mockRejectedValue(abort());
    expect(await partilharTexto({ titulo: 'T', texto: 'x' }, { navigator: { share } })).toBe('cancelado');
  });

  it('sem menu de partilha copia o texto', async () => {
    const writeText = vi.fn().mockResolvedValue();
    expect(await partilharTexto({ titulo: 'T', texto: 'corpo' }, { navigator: { clipboard: { writeText } } })).toBe('copiado');
    expect(writeText).toHaveBeenCalledWith('corpo');
  });

  it('se o menu falhar por outro motivo, copia em vez de desistir', async () => {
    const share = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    const writeText = vi.fn().mockResolvedValue();
    expect(await partilharTexto({ titulo: 'T', texto: 'x' }, { navigator: { share, clipboard: { writeText } } })).toBe('copiado');
  });

  it('se nada funcionar, diz que falhou', async () => {
    expect(await partilharTexto({ titulo: 'T', texto: 'x' }, { navigator: {} })).toBe('falhou');
  });
});

describe('entregarFicheiro', () => {
  const blob = new Blob(['conteudo']);
  const dados = { blob, nome: 'Notas.docx', mime: 'application/x' };

  function ambienteDeDescarga() {
    const ligacao = { click: vi.fn() };
    return {
      ligacao,
      document: { createElement: () => ligacao, body: { appendChild: vi.fn(), removeChild: vi.fn() } },
      URL: { createObjectURL: vi.fn(() => 'blob:fake'), revokeObjectURL: vi.fn() },
    };
  }

  it('partilha o ficheiro quando o telemóvel deixa', async () => {
    const share = vi.fn().mockResolvedValue();
    const resultado = await entregarFicheiro(dados, { ...ambienteDeDescarga(), navigator: { canShare: () => true, share } });
    expect(resultado).toBe('partilhado');
    expect(share.mock.calls[0][0].files[0].name).toBe('Notas.docx');
  });

  it('descarrega quando o aparelho não partilha ficheiros', async () => {
    const amb = ambienteDeDescarga();
    expect(await entregarFicheiro(dados, { ...amb, navigator: { canShare: () => false } })).toBe('descarregado');
    expect(amb.ligacao.download).toBe('Notas.docx');
    expect(amb.ligacao.click).toHaveBeenCalled();
  });

  it('descarrega quando o menu recusa o ficheiro', async () => {
    const amb = ambienteDeDescarga();
    const share = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    expect(await entregarFicheiro(dados, { ...amb, navigator: { canShare: () => true, share } })).toBe('descarregado');
    expect(amb.ligacao.click).toHaveBeenCalled();
  });

  it('fechar o menu cancela sem descarregar', async () => {
    const amb = ambienteDeDescarga();
    const share = vi.fn().mockRejectedValue(abort());
    expect(await entregarFicheiro(dados, { ...amb, navigator: { canShare: () => true, share } })).toBe('cancelado');
    expect(amb.ligacao.click).not.toHaveBeenCalled();
  });
});
