// afinações para o iphone (safari). corre antes de tudo o resto:
// 1. marca a página com a classe "ios" (o css troca efeitos que o safari desenha mal ou devagar)
// 2. tira o desfoque (blur) das animações gsap: no iphone cada letra desfocada é uma imagem nova a cada frame,
//    e é isso que engasga o prólogo. as entradas continuam (opacidade, posição, escala), só sem o desfoque
// 3. o céu que se inclina: com o giroscópio, as estrelas, a aurora e o título mexem-se quando ela inclina o telemóvel.
//    no iphone isto precisa de autorização, que só se pode pedir depois de um toque (ver mais.js, botão "inclina o telemóvel")
// para testar noutro telemóvel ou no computador: ?ios no fim do link
/* global gsap */
(function () {
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) || /[?&]ios\b/.test(window.location.search);
  if (ios) document.documentElement.classList.add('ios');

  // ---------- sem desfoque nas animações (só no iphone) ----------
  function semDesfoque(v) {
    if (!v || typeof v !== 'object' || typeof v.filter !== 'string' || v.filter.indexOf('blur') === -1) return v;
    var n = {};
    for (var k in v) n[k] = v[k];
    var resto = v.filter.replace(/blur\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    if (resto) n.filter = resto; else delete n.filter;
    return n;
  }
  function embrulhar(alvo, nome) {
    var original = alvo && alvo[nome];
    if (typeof original !== 'function') return;
    alvo[nome] = function () {
      var args = [].slice.call(arguments);
      for (var i = 1; i < args.length; i++) args[i] = semDesfoque(args[i]);
      return original.apply(this, args);
    };
  }
  if (ios && window.gsap) {
    ['to', 'from', 'fromTo', 'set'].forEach(function (m) {
      embrulhar(gsap, m);
      embrulhar(gsap.core.Timeline.prototype, m);
    });
  }

  // ---------- o céu que se inclina ----------
  // x e y vão de -0.5 a 0.5 (como o rato no computador). o "zero" é a forma como ela segura o telemóvel,
  // e vai-se ajustando devagar, para que pousar o telemóvel ou deitar-se não deixe o céu torto
  var I = {
    disponivel: typeof window.DeviceOrientationEvent !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    precisaPedir: typeof window.DeviceOrientationEvent !== 'undefined' && typeof window.DeviceOrientationEvent.requestPermission === 'function',
    ativo: false,
    x: 0,
    y: 0,
  };
  window.INCLINACAO = I;
  if (!I.disponivel) return;

  var baseB = null; var baseG = null; var alvoX = 0; var alvoY = 0; var recebeu = false;
  function limitar(v) { return Math.max(-0.5, Math.min(0.5, v)); }
  function aoInclinar(e) {
    if (e.beta == null || e.gamma == null) return;
    recebeu = true;
    var b = e.beta; var g = e.gamma;
    // telemóvel deitado (paisagem): os eixos trocam
    var ang = (window.screen.orientation && window.screen.orientation.angle) || window.orientation || 0;
    if (ang === 90) { var t = b; b = -g; g = t; } else if (ang === -90 || ang === 270) { var t2 = b; b = g; g = -t2; }
    if (baseB == null) { baseB = b; baseG = g; }
    baseB += (b - baseB) * 0.004; baseG += (g - baseG) * 0.004;
    alvoX = limitar((g - baseG) / 50);
    alvoY = limitar((b - baseB) / 50);
  }

  // o que se mexe com a inclinação: o fundo de luz vai para um lado e o título para o outro, e parece haver profundidade
  var camadas = [];
  function juntarCamadas() {
    camadas = [
      { el: document.querySelector('.luzes'), prof: -38 },
      { el: document.getElementById('tituloBloco'), prof: 16 },
      { el: document.querySelector('.cortina__miolo'), prof: 10 },
    ].filter(function (c) { return c.el; });
  }
  function frame() {
    if (!I.ativo) return;
    I.x += (alvoX - I.x) * 0.08;
    I.y += (alvoY - I.y) * 0.08;
    if (!document.body.classList.contains('calmo')) {
      camadas.forEach(function (c) { c.el.style.translate = (I.x * c.prof).toFixed(2) + 'px ' + (I.y * c.prof).toFixed(2) + 'px'; });
    }
    requestAnimationFrame(frame);
  }
  function ligar() {
    if (I.ativo) return;
    I.ativo = true;
    baseB = null;
    window.addEventListener('deviceorientation', aoInclinar, { passive: true });
    juntarCamadas();
    requestAnimationFrame(frame);
  }
  I.desligar = function () {
    I.ativo = false;
    window.removeEventListener('deviceorientation', aoInclinar);
    camadas.forEach(function (c) { c.el.style.translate = ''; });
    I.x = 0; I.y = 0;
  };
  // pedir autorização (iphone) e ligar. devolve uma promessa com true se ficou ligado
  I.pedir = function () {
    if (!I.precisaPedir) { ligar(); return Promise.resolve(true); }
    return window.DeviceOrientationEvent.requestPermission().then(function (r) {
      if (r === 'granted') { ligar(); return true; }
      return false;
    }).catch(function () { return false; });
  };
  // confirma, passado um bocado, se chegaram mesmo dados (há telemóveis sem giroscópio)
  I.funciona = function (ms) {
    return new Promise(function (r) { setTimeout(function () { r(recebeu); }, ms || 900); });
  };
  // no android não é preciso pedir: liga-se sozinho
  if (!I.precisaPedir) ligar();
})();
