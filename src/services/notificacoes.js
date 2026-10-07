// notificações de versão nova — lógica pura, sem react nem firebase, para testar sem browser.
// a leonor liga-as nas definições; o código do telemóvel dela vai ao vini como texto (nunca para o firebase)

export const CABECALHO_NOTIFICACOES = 'Notificações do JurisLeo';

// a chave pública vem em base64 "url-safe"; o browser quer bytes
export function chaveParaBytes(chave) {
  const base64 = String(chave).replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(String(chave).length / 4) * 4, '=');
  const binario = atob(base64);
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

// o que o telemóvel permite: 'ok', 'instalar-primeiro' (no iphone só funciona com a app no ecrã principal),
// 'recusado' (ela disse que não) ou 'sem-suporte'. `ambiente` é um resumo do browser, para se poder testar
export function estadoDasNotificacoes({ temServiceWorker, temPush, temNotificacoes, ios, instalada, permissao, temChave }) {
  if (!temChave) return 'sem-suporte';
  if (ios && !instalada) return 'instalar-primeiro';
  if (!temServiceWorker || !temPush || !temNotificacoes) return 'sem-suporte';
  if (permissao === 'denied') return 'recusado';
  return 'ok';
}

// o texto que ela manda ao vini: uma linha de cabeçalho e o código do telemóvel dela
export function textoDaSubscricao(sub) {
  const json = typeof sub?.toJSON === 'function' ? sub.toJSON() : sub;
  if (!json?.endpoint || !json?.keys?.p256dh || !json?.keys?.auth) return null;
  return `${CABECALHO_NOTIFICACOES}\n${JSON.stringify({ endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } })}`;
}

// o vini cola o texto na consola: devolve o código limpo, ou null se não for um código válido
export function lerSubscricao(texto) {
  const linhas = String(texto ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const i = linhas.indexOf(CABECALHO_NOTIFICACOES);
  if (i === -1 || !linhas[i + 1]) return null;
  try {
    const sub = JSON.parse(linhas[i + 1]);
    if (typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint)) return null;
    if (!sub.keys?.p256dh || !sub.keys?.auth) return null;
    return { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } };
  } catch { return null; }
}
