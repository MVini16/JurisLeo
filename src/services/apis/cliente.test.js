import { describe, it, expect, vi } from 'vitest';
import { pedir, lerRetryAfter, ESPERA_REPETICAO_MS } from './cliente.js';

// resposta falsa com o mínimo que o cliente usa
function resposta(status, corpo = {}, cabecalhos = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (nome) => cabecalhos[nome] ?? null },
    json: async () => {
      if (corpo instanceof Error) throw corpo;
      return corpo;
    },
    text: async () => String(corpo),
  };
}

const AGORA = new Date(2026, 8, 24, 10, 0, 0).getTime();

function deps(fetch, extra = {}) {
  return { fetch, esperar: vi.fn(async () => {}), online: () => true, agora: () => AGORA, ...extra };
}

describe('lerRetryAfter', () => {
  it('em segundos soma ao agora', () => {
    expect(lerRetryAfter('120', AGORA).getTime()).toBe(AGORA + 120000);
  });

  it('como data http lê a data', () => {
    expect(lerRetryAfter('Wed, 24 Sep 2026 10:00:00 GMT').toISOString()).toBe('2026-09-24T10:00:00.000Z');
  });

  it('vazio ou lixo dá null', () => {
    expect(lerRetryAfter(null)).toBeNull();
    expect(lerRetryAfter('')).toBeNull();
    expect(lerRetryAfter('amanhã')).toBeNull();
  });
});

describe('pedir', () => {
  it('sucesso devolve os dados', async () => {
    const fetch = vi.fn(async () => resposta(200, { tMax: 24 }));
    expect(await pedir('https://x', {}, deps(fetch))).toEqual({ ok: true, dados: { tMax: 24 }, erro: null, tentarDepois: null });
  });

  it('formato texto lê como texto', async () => {
    const fetch = vi.fn(async () => resposta(200, 'olá'));
    expect((await pedir('https://x', { formato: 'texto' }, deps(fetch))).dados).toBe('olá');
  });

  it('não passa o "formato" ao fetch, mas passa o resto e o signal', async () => {
    const fetch = vi.fn(async () => resposta(200));
    await pedir('https://x', { formato: 'json', method: 'POST' }, deps(fetch));
    const opcoes = fetch.mock.calls[0][1];
    expect(opcoes.method).toBe('POST');
    expect(opcoes.formato).toBeUndefined();
    expect(opcoes.signal).toBeDefined();
  });

  it('sem rede nem tenta', async () => {
    const fetch = vi.fn();
    const r = await pedir('https://x', {}, deps(fetch, { online: () => false }));
    expect(r.erro).toBe('semLigacao');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('429 nunca repete e devolve a hora do retry-after', async () => {
    const fetch = vi.fn(async () => resposta(429, {}, { 'Retry-After': '60' }));
    const r = await pedir('https://x', {}, deps(fetch));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(r.erro).toBe('limite');
    expect(r.tentarDepois.getTime()).toBe(AGORA + 60000);
  });

  it('5xx repete uma vez ao fim de 1 segundo e aceita a segunda', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(resposta(503))
      .mockResolvedValueOnce(resposta(200, { ok: 1 }));
    const d = deps(fetch);
    const r = await pedir('https://x', {}, d);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(d.esperar).toHaveBeenCalledWith(ESPERA_REPETICAO_MS);
    expect(r.ok).toBe(true);
  });

  it('5xx duas vezes é serviço em baixo, sem terceira tentativa', async () => {
    const fetch = vi.fn(async () => resposta(500));
    const r = await pedir('https://x', {}, deps(fetch));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(r.erro).toBe('servicoEmBaixo');
  });

  it('falha de rede duas vezes com a rede já em baixo é sem ligação', async () => {
    const fetch = vi.fn(async () => { throw new TypeError('Failed to fetch'); });
    let chamadas = 0;
    const online = () => (chamadas++ === 0);
    const r = await pedir('https://x', {}, deps(fetch, { online }));
    expect(r.erro).toBe('semLigacao');
  });

  it('timeout aborta o pedido e conta como falha repetível', async () => {
    // fetch que só termina quando o signal aborta, como o de verdade
    const fetch = vi.fn((url, { signal }) => new Promise((_, rejeitar) => {
      signal.addEventListener('abort', () => rejeitar(Object.assign(new Error('abort'), { name: 'AbortError' })));
    }));
    const r = await pedir('https://x', {}, deps(fetch, { timeoutMs: 5 }));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(r.erro).toBe('servicoEmBaixo');
  });

  it('json estragado é resposta inválida, sem repetir', async () => {
    const fetch = vi.fn(async () => resposta(200, new SyntaxError('json')));
    const r = await pedir('https://x', {}, deps(fetch));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(r.erro).toBe('respostaInvalida');
  });

  it('404 é "não encontrado", sem repetir', async () => {
    const fetch = vi.fn(async () => resposta(404));
    const r = await pedir('https://x', {}, deps(fetch));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(r.erro).toBe('naoEncontrado');
  });

  it('outro 4xx é resposta inválida, sem repetir', async () => {
    const fetch = vi.fn(async () => resposta(400));
    const r = await pedir('https://x', {}, deps(fetch));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(r.erro).toBe('respostaInvalida');
  });
});
