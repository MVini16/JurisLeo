import { describe, it, expect } from 'vitest';
import { chaveParaBytes, estadoDasNotificacoes, textoDaSubscricao, lerSubscricao, CABECALHO_NOTIFICACOES } from './notificacoes.js';

const tudo = { temServiceWorker: true, temPush: true, temNotificacoes: true, ios: false, instalada: false, permissao: 'default', temChave: true };

describe('notificações de versão nova', () => {
  it('converte a chave pública para bytes', () => {
    expect(Array.from(chaveParaBytes('AQID'))).toEqual([1, 2, 3]);
    expect(Array.from(chaveParaBytes('-_8'))).toEqual([251, 255]);
  });

  it('no iPhone só se a app estiver no ecrã principal', () => {
    expect(estadoDasNotificacoes({ ...tudo, ios: true, instalada: false })).toBe('instalar-primeiro');
    expect(estadoDasNotificacoes({ ...tudo, ios: true, instalada: true })).toBe('ok');
    expect(estadoDasNotificacoes(tudo)).toBe('ok');
  });

  it('diz quando não dá', () => {
    expect(estadoDasNotificacoes({ ...tudo, temChave: false })).toBe('sem-suporte');
    expect(estadoDasNotificacoes({ ...tudo, temPush: false })).toBe('sem-suporte');
    expect(estadoDasNotificacoes({ ...tudo, permissao: 'denied' })).toBe('recusado');
  });

  it('o texto vai e volta, e só aceita códigos bem feitos', () => {
    const sub = { endpoint: 'https://push.example/abc', keys: { p256dh: 'P', auth: 'A' }, extra: 'ignorado' };
    const texto = textoDaSubscricao(sub);
    expect(texto.startsWith(CABECALHO_NOTIFICACOES)).toBe(true);
    expect(lerSubscricao(`Olá!\n${texto}`)).toEqual({ endpoint: sub.endpoint, keys: { p256dh: 'P', auth: 'A' } });
    expect(textoDaSubscricao({ endpoint: 'x' })).toBeNull();
    expect(lerSubscricao('nada')).toBeNull();
    expect(lerSubscricao(`${CABECALHO_NOTIFICACOES}\n{"endpoint":"http://mau","keys":{"p256dh":"P","auth":"A"}}`)).toBeNull();
    expect(lerSubscricao(`${CABECALHO_NOTIFICACOES}\nnão é json`)).toBeNull();
  });
});
