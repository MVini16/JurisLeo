// recebe as notificações push no service worker (importado pelo sw.js que o vite-plugin-pwa gera).
// o texto vem do deploy automático ou do lembrete da noite; se vier vazio ou estragado, mostra um aviso genérico
self.addEventListener('push', (evento) => {
  const dados = (() => { try { return evento.data ? evento.data.json() : {}; } catch { return {}; } })();
  const titulo = typeof dados.titulo === 'string' && dados.titulo ? dados.titulo : 'JurisLeo';
  const corpo = typeof dados.corpo === 'string' && dados.corpo ? dados.corpo : 'Há uma versão nova do JurisLeo. Abre a app para a atualizares.';
  const tag = typeof dados.tag === 'string' && dados.tag ? dados.tag : 'versao-nova';
  // só caminhos da própria app (começam por /), para uma notificação nunca levar a outro sítio
  const url = typeof dados.url === 'string' && /^\/[a-z0-9/_-]*$/i.test(dados.url) ? dados.url : '/';
  evento.waitUntil(self.registration.showNotification(titulo, { body: corpo, icon: '/icon-192.png', badge: '/icon-192.png', tag, data: { url } }));
});

// tocar na notificação abre a app na página certa (ou volta a ela, se já estiver aberta)
self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const url = evento.notification.data?.url || '/';
  evento.waitUntil((async () => {
    const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (janelas.length > 0) {
      try { await janelas[0].navigate(url); } catch { /* sem navigate, só foca */ }
      await janelas[0].focus();
      return;
    }
    await self.clients.openWindow(url);
  })());
});
