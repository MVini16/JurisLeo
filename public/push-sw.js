// recebe as notificações push no service worker (importado pelo sw.js que o vite-plugin-pwa gera).
// o texto vem do deploy automático; se vier vazio ou estragado, mostra um aviso genérico
self.addEventListener('push', (evento) => {
  const dados = (() => { try { return evento.data ? evento.data.json() : {}; } catch { return {}; } })();
  const titulo = typeof dados.titulo === 'string' && dados.titulo ? dados.titulo : 'JurisLeo';
  const corpo = typeof dados.corpo === 'string' && dados.corpo ? dados.corpo : 'Há uma versão nova do JurisLeo. Abre a app para a atualizares.';
  evento.waitUntil(self.registration.showNotification(titulo, { body: corpo, icon: '/icon.svg', badge: '/icon.svg', tag: 'versao-nova' }));
});

// tocar na notificação abre a app (ou volta a ela, se já estiver aberta)
self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  evento.waitUntil((async () => {
    const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (janelas.length > 0) { await janelas[0].focus(); return; }
    await self.clients.openWindow('/');
  })());
});
