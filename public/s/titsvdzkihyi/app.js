// a experiência: monta a página a partir de conteudo.js e anima com gsap + scrolltrigger.
// só se animam transform e opacity (leves no iphone). com "reduzir movimento" ligado, tudo aparece parado e legível
/* global gsap, ScrollTrigger */
(function () {
  var C = window.CONTEUDO;
  var parado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  gsap.registerPlugin(ScrollTrigger);

  // ---------- montar o conteúdo ----------
  $('abertura').textContent = C.abertura;
  var h1 = $('nome');
  h1.setAttribute('aria-label', C.nome);
  C.nome.split('').forEach(function (l) { var s = el('span', 'letra', l); s.setAttribute('aria-hidden', 'true'); h1.appendChild(s); });

  function paragrafos(destino, linhas) {
    linhas.forEach(function (linha) {
      var p = el('p');
      linha.split(' ').forEach(function (w, i, todas) {
        p.appendChild(el('span', 'palavra', w));
        if (i < todas.length - 1) p.appendChild(document.createTextNode(' '));
      });
      destino.appendChild(p);
    });
  }
  paragrafos($('dificilTexto'), C.dificil);
  paragrafos($('interludioTexto'), C.interludio);
  paragrafos($('finalTexto'), C.final);
  $('assinatura').textContent = C.assinatura;
  $('cartaTitulo').textContent = C.cartaTitulo || '';
  (C.carta || []).forEach(function (par) { $('cartaLonga').appendChild(el('p', null, par)); });

  var caixaMomentos = $('momentos');
  C.momentos.forEach(function (m) {
    var s = el('section', 'momento');
    var quadro = el('div', 'momento__quadro');
    if (m.foto) {
      var img = el('img');
      img.src = m.foto; img.alt = m.titulo; img.loading = 'lazy'; img.decoding = 'async';
      quadro.appendChild(img);
    }
    var leg = el('div', 'momento__legenda');
    if (m.data) leg.appendChild(el('p', 'momento__data', m.data));
    leg.appendChild(el('h2', 'momento__titulo', m.titulo));
    leg.appendChild(el('p', 'momento__texto', m.texto));
    s.appendChild(quadro); s.appendChild(leg);
    caixaMomentos.appendChild(s);
  });

  // ---------- cartas "abre quando" ----------
  var CHAVE = 'surpresa-cartas';
  var abertas = [];
  try { abertas = JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { abertas = []; }
  function contar() {
    $('contadorCartas').textContent = 'Abriste ' + abertas.length + ' de ' + C.cartas.length;
  }
  C.cartas.forEach(function (c, i) {
    var li = el('li', 'carta');
    var cab = el('button', 'carta__cab');
    cab.type = 'button';
    cab.setAttribute('aria-expanded', 'false');
    cab.appendChild(el('span', null, c.rotulo));
    cab.appendChild(el('span', 'carta__selo', '♥'));
    var corpo = el('div', 'carta__corpo');
    corpo.appendChild(el('p', 'carta__texto', c.texto));
    li.appendChild(cab); li.appendChild(corpo);
    $('listaCartas').appendChild(li);
    cab.addEventListener('click', function () {
      var abrir = li.getAttribute('data-aberta') !== 'true';
      li.setAttribute('data-aberta', abrir ? 'true' : 'false');
      cab.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      gsap.to(corpo, { height: abrir ? 'auto' : 0, duration: parado ? 0 : 0.6, ease: 'power2.inOut', onComplete: function () { ScrollTrigger.refresh(); } });
      if (abrir && abertas.indexOf(i) === -1) {
        abertas.push(i);
        try { localStorage.setItem(CHAVE, JSON.stringify(abertas)); } catch { /* sem armazenamento, esquece */ }
        contar();
      }
    });
  });
  contar();

  C.razoes.forEach(function (r) { $('listaRazoes').appendChild(el('li', null, r)); });

  // ---------- estrelas ----------
  var tela = $('estrelas');
  var ctx = tela.getContext('2d');
  var estrelas = [];
  var rolar = 0;
  function medir() {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    tela.width = window.innerWidth * d; tela.height = window.innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    var n = window.innerWidth < 700 ? 70 : 140;
    estrelas = [];
    for (var i = 0; i < n; i++) estrelas.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 1.3 + .3, f: Math.random() * 6, p: Math.random() * .6 + .1 });
  }
  function desenhar(t) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = 0; i < estrelas.length; i++) {
      var s = estrelas[i];
      var y = (s.y - rolar * s.p * .15 + window.innerHeight * 10) % window.innerHeight;
      var brilho = parado ? .6 : .35 + .35 * Math.sin(t / 1100 + s.f);
      ctx.fillStyle = 'rgba(243,233,223,' + brilho.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.2832); ctx.fill();
    }
    if (!parado && document.visibilityState === 'visible') requestAnimationFrame(desenhar);
  }
  medir(); window.addEventListener('resize', medir);
  window.addEventListener('scroll', function () { rolar = window.scrollY; }, { passive: true });
  requestAnimationFrame(desenhar);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && !parado) requestAnimationFrame(desenhar); });

  // ---------- animações de scroll ----------
  function animar() {
    if (parado) { gsap.set('.palavra', { opacity: 1 }); return; }

    // barra de progresso
    var barra = $('barra'); barra.style.width = '100%'; barra.style.transform = 'scaleX(0)';
    ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: function (self) { barra.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')'; } });

    // textos que se acendem palavra a palavra
    ['dificilTexto', 'interludioTexto', 'finalTexto'].forEach(function (id) {
      var pais = $(id).querySelectorAll('p');
      pais.forEach(function (p) {
        gsap.to(p.querySelectorAll('.palavra'), {
          opacity: 1, ease: 'none', stagger: 0.12,
          scrollTrigger: { trigger: p, start: 'top 88%', end: 'top 45%', scrub: 0.6 },
        });
      });
    });

    // momentos: entram de formas diferentes, ficam, e saem ao subir
    var variantes = [
      function (tl, q) { tl.fromTo(q, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.32, ease: 'power2.out' }, 0); var im = q.querySelector('img'); if (im) tl.fromTo(im, { scale: 1.35 }, { scale: 1, duration: 0.5, ease: 'none' }, 0); },
      function (tl, q) { tl.fromTo(q, { opacity: 0, rotate: -7, x: -50 }, { opacity: 1, rotate: 0, x: 0, duration: 0.32, ease: 'power2.out' }, 0); },
      function (tl, q) { tl.fromTo(q, { opacity: 0, scale: 0.78 }, { opacity: 1, scale: 1, duration: 0.32, ease: 'power3.out' }, 0); },
      function (tl, q) { tl.fromTo(q, { opacity: 0, y: 110 }, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' }, 0); },
    ];
    document.querySelectorAll('.momento').forEach(function (m, i) {
      var q = m.querySelector('.momento__quadro');
      var l = m.querySelector('.momento__legenda');
      var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: m, start: 'top 85%', end: 'bottom 15%', scrub: 0.7 } });
      tl.to({}, { duration: 1 }, 0);
      variantes[i % variantes.length](tl, q, l);
      tl.fromTo(l, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0.14);
      tl.to([q, l], { opacity: 0.12, y: -60, duration: 0.24, ease: 'power1.in' }, 0.76);
    });

    // a carta longa: cada parágrafo aparece com calma ao chegar ao ecrã
    gsap.utils.toArray('#cartaLonga p').forEach(function (p) {
      gsap.from(p, { opacity: 0, y: 24, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 90%' } });
    });

    // razões vão aparecendo uma a uma
    gsap.utils.toArray('#listaRazoes li').forEach(function (li) {
      gsap.from(li, { opacity: 0, x: -30, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: li, start: 'top 88%' } });
    });
    gsap.from('#assinatura', { opacity: 0, y: 20, duration: 1.2, scrollTrigger: { trigger: '#assinatura', start: 'top 92%' } });
    gsap.from('#topo', { opacity: 0, duration: 1.2, scrollTrigger: { trigger: '#topo', start: 'top 95%' } });
    gsap.from('#cartas .titulo-cap, #cartas .sub-cap, #razoes .titulo-cap', { opacity: 0, y: 30, duration: 0.9, stagger: 0.15, scrollTrigger: { trigger: '#cartas', start: 'top 70%' } });
  }
  animar();

  // ---------- entrar ----------
  var musica = $('musica');
  var botaoSom = $('som');
  $('comecar').addEventListener('click', function () {
    document.body.classList.remove('bloqueado');
    if (C.musica) {
      musica.src = C.musica; musica.volume = 0.0;
      var tocar = musica.play();
      if (tocar && tocar.catch) tocar.catch(function () {});
      gsap.to(musica, { volume: 0.55, duration: 4 });
      botaoSom.hidden = false; botaoSom.setAttribute('aria-pressed', 'true');
    }
    gsap.to('#cortina', { opacity: 0, duration: parado ? 0 : 1.6, ease: 'power1.inOut', onComplete: function () { $('cortina').remove(); } });
    if (!parado) {
      gsap.from('.cap--titulo .pequeno', { opacity: 0, y: 16, duration: 1.2, delay: 0.6 });
      gsap.from('.letra', { opacity: 0, y: 60, rotate: 6, duration: 1.4, stagger: 0.12, ease: 'power3.out', delay: 1 });
      gsap.from('.deslizar', { opacity: 0, duration: 1.4, delay: 3 });
    }
    ScrollTrigger.refresh();
  });
  botaoSom.addEventListener('click', function () {
    var ligado = botaoSom.getAttribute('aria-pressed') === 'true';
    if (ligado) musica.pause(); else musica.play();
    botaoSom.setAttribute('aria-pressed', ligado ? 'false' : 'true');
  });
  $('topo').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: parado ? 'auto' : 'smooth' }); });
})();
