// a experiência, em cenas de cinema: monta tudo a partir de conteudo.js e anima com gsap + scrolltrigger.
// só se animam transform e opacity (leves no iphone). com "reduzir movimento" ligado, tudo aparece arrumado e legível
/* global gsap, ScrollTrigger */
(function () {
  var C = window.CONTEUDO;
  var parado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (parado) document.body.classList.add('parado');
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function dois(n) { return (n < 10 ? '0' : '') + n; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // ---------- montar o conteúdo ----------
  $('abertura').textContent = C.abertura;
  var h1 = $('nome');
  h1.setAttribute('aria-label', C.nome);
  if (C.subtitulo) $('subtitulo').textContent = C.subtitulo;
  C.nome.split('').forEach(function (l) { var s = el('span', 'letra', l); s.setAttribute('aria-hidden', 'true'); h1.appendChild(s); });

  C.dificil.forEach(function (linha) { $('linhasDificil').appendChild(el('p', 'linha', linha)); });

  // uma película por parte ("Nós", "Tu"): cada uma é uma cena que desliza na horizontal
  var peliculas = C.tiras.map(function (t, ti) {
    var sec = el('section', 'cena cena--tira');
    var topo = el('div', 'tira-topo');
    topo.appendChild(el('span', 'tira-etiqueta', t.etiqueta));
    var contador = el('span', 'tira-contador', dois(1) + ' / ' + dois(t.momentos.length));
    topo.appendChild(contador);
    var tira = el('div', 'tira');
    t.momentos.forEach(function (m, i) {
      var q = el('article', 'quadro-cena');
      var foto = el('div', 'quadro-foto');
      foto.style.setProperty('--h', String(340 + (i + ti * 5) * 27));
      if (m.foto) {
        var img = el('img');
        img.src = m.foto; img.alt = m.titulo; img.decoding = 'async';
        foto.appendChild(img);
      }
      var leg = el('div', 'quadro-legenda');
      if (m.data) leg.appendChild(el('p', 'momento__data', m.data));
      leg.appendChild(el('h2', 'momento__titulo', m.titulo));
      leg.appendChild(el('p', 'momento__texto', m.texto));
      q.appendChild(foto); q.appendChild(leg);
      tira.appendChild(q);
    });
    var prog = el('div', 'tira-progresso');
    prog.setAttribute('aria-hidden', 'true');
    var barra = el('i');
    prog.appendChild(barra);
    sec.appendChild(topo); sec.appendChild(tira); sec.appendChild(prog);
    $('tiras').appendChild(sec);
    return { sec: sec, tira: tira, contador: contador, barra: barra, total: t.momentos.length };
  });

  C.interludio.forEach(function (linha) {
    var p = el('p');
    linha.split(' ').forEach(function (w, i, todas) {
      var m = el('span', 'mascara');
      m.appendChild(el('span', 'mascara__in', w));
      p.appendChild(m);
      if (i < todas.length - 1) p.appendChild(document.createTextNode(' '));
    });
    $('interludioTexto').appendChild(p);
  });

  C.razoes.forEach(function (r, i) {
    var d = el('div', 'razao');
    d.appendChild(el('span', 'razao__n', dois(i + 1)));
    d.appendChild(el('p', 'razao__t', r));
    $('razoesPalco').appendChild(d);
  });

  $('cartaTitulo').textContent = C.cartaTitulo || '';
  (C.carta || []).forEach(function (par) { $('cartaLonga').appendChild(el('p', null, par)); });

  C.final.forEach(function (linha) { $('finalTexto').appendChild(el('p', 'final-linha', linha)); });
  $('assinatura').textContent = C.assinatura;

  // ---------- cartas "abre quando" ----------
  var CHAVE = 'surpresa-cartas';
  var abertas = [];
  try { abertas = JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { abertas = []; }
  function contar() { $('contadorCartas').textContent = 'Abriste ' + abertas.length + ' de ' + C.cartas.length; }
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
      gsap.to(corpo, { height: abrir ? 'auto' : 0, duration: parado ? 0 : 0.7, ease: 'power3.inOut', onComplete: function () { ScrollTrigger.refresh(); } });
      if (abrir && abertas.indexOf(i) === -1) {
        abertas.push(i);
        try { localStorage.setItem(CHAVE, JSON.stringify(abertas)); } catch { /* sem armazenamento, esquece */ }
        contar();
      }
    });
  });
  contar();

  // ---------- estrelas que, no fim, se juntam num coração ----------
  var tela = $('estrelas');
  var ctx = tela.getContext('2d');
  var estrelas = [];
  var rolar = 0;
  var coracao = { p: 0 };
  var NUM_CORACAO = 120;
  function medir() {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth; var h = window.innerHeight;
    tela.width = w * d; tela.height = h * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    var n = w < 700 ? 130 : 190;
    var k = Math.min(w * 0.84 / 34, h * 0.30 / 30);
    estrelas = [];
    for (var i = 0; i < n; i++) {
      var s = { x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + 0.3, f: Math.random() * 6, p: Math.random() * 0.6 + 0.1, hx: 0, hy: 0, coracao: i < NUM_CORACAO };
      if (s.coracao) {
        var t = (i / NUM_CORACAO) * 6.2832;
        s.hx = 16 * Math.pow(Math.sin(t), 3) * k;
        s.hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * k;
      }
      estrelas.push(s);
    }
  }
  function desenhar(t) {
    var w = window.innerWidth; var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    var p = coracao.p;
    var bate = p > 0.9 ? 1 + 0.045 * Math.max(0, Math.sin(t / 280)) : 1;
    var cx = w / 2; var cy = h * 0.33;
    for (var i = 0; i < estrelas.length; i++) {
      var s = estrelas[i];
      var y = (s.y - rolar * s.p * 0.15 + h * 10) % h;
      var x = s.x;
      var brilho = parado ? 0.6 : 0.35 + 0.35 * Math.sin(t / 1100 + s.f);
      var raio = s.r;
      if (p > 0) {
        if (s.coracao) {
          x = x + (cx + s.hx * bate - x) * p;
          y = y + (cy + s.hy * bate - y) * p;
          brilho = brilho + (0.95 - brilho) * p;
          raio = s.r * (1 + p * 1.1);
        } else {
          brilho = brilho * (1 - 0.8 * p);
        }
      }
      ctx.fillStyle = 'rgba(' + (s.coracao && p > 0.5 ? '255,214,170' : '243,233,223') + ',' + brilho.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(x, y, raio, 0, 6.2832); ctx.fill();
    }
    if (!parado && document.visibilityState === 'visible') requestAnimationFrame(desenhar);
  }
  medir();
  window.addEventListener('resize', medir);
  window.addEventListener('scroll', function () { rolar = window.scrollY; }, { passive: true });
  requestAnimationFrame(desenhar);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && !parado) requestAnimationFrame(desenhar); });

  // ---------- as cenas ----------
  // cena em que uma lista de elementos entra e sai, um de cada vez, sempre no mesmo sítio
  function sequencia(gatilho, itens, entrada, saida, fatia) {
    var n = itens.length;
    var tl = gsap.timeline({ scrollTrigger: { trigger: gatilho, start: 'top top', end: function () { return '+=' + (n * window.innerHeight * fatia); }, scrub: 0.8, pin: true, invalidateOnRefresh: true } });
    itens.forEach(function (it, i) {
      tl.fromTo(it, entrada.de, Object.assign({ duration: 0.35, ease: 'power2.out' }, entrada.para), i);
      if (i < n - 1) tl.to(it, Object.assign({ duration: 0.3, ease: 'power2.in' }, saida), i + 0.7);
    });
    tl.to({}, { duration: 0.35 });
    return tl;
  }

  function animar() {
    if (parado) return;

    // barra de progresso do filme todo
    ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: function (self) { $('barra').style.transform = 'scaleX(' + self.progress.toFixed(4) + ')'; } });

    // 1. o título cresce até engolir o ecrã, com uma luz a varrer por cima
    gsap.timeline({ scrollTrigger: { trigger: '#cenaTitulo', start: 'top top', end: '+=120%', scrub: 0.8, pin: true } })
      .to('.luz-varrer', { x: '260%', ease: 'none', duration: 1 }, 0)
      .to('#tituloBloco', { scale: 2.6, opacity: 0, ease: 'power2.in', duration: 0.9 }, 0.2);

    // 2. as frases do dia difícil, uma a uma
    sequencia('#cenaDificil', gsap.utils.toArray('.linha'),
      { de: { opacity: 0, y: 70, scale: 0.93 }, para: { opacity: 1, y: 0, scale: 1 } },
      { opacity: 0, y: -70, scale: 1.05 }, 0.75);

    // 3. as películas: descer faz a tira de fotos deslizar na horizontal, com paralaxe dentro de cada foto
    peliculas.forEach(function (pel) {
      var tira = pel.tira;
      var quadros = gsap.utils.toArray('.quadro-cena', tira);
      var dist = function () { return Math.max(0, tira.scrollWidth - window.innerWidth); };
      var anim = gsap.to(tira, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: pel.sec, start: 'top top', end: function () { return '+=' + dist() * 1.2; }, pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: function (self) {
            var idx = Math.min(pel.total - 1, Math.round(self.progress * (pel.total - 1)));
            pel.contador.textContent = dois(idx + 1) + ' / ' + dois(pel.total);
            pel.barra.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')';
          },
        },
      });
      quadros.forEach(function (q, i) {
        var foto = q.querySelector('.quadro-foto');
        var leg = q.querySelector('.quadro-legenda');
        var img = q.querySelector('img');
        var tl = gsap.timeline({ scrollTrigger: { trigger: q, containerAnimation: anim, start: 'left 96%', end: 'right 4%', scrub: true } });
        if (i === 0) tl.to(foto, { duration: 0.4 }); else tl.fromTo(foto, { scale: 0.8, rotate: i % 2 ? 4 : -4, opacity: 0.25 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
        tl.fromTo(leg, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, i === 0 ? 0 : 0.18);
        if (i < quadros.length - 1) { tl.to(foto, { duration: 0.3 }).to([foto, leg], { opacity: 0.2, scale: 0.92, duration: 0.3, ease: 'power2.in' }); }
        if (img) gsap.fromTo(img, { xPercent: -9 }, { xPercent: 9, ease: 'none', scrollTrigger: { trigger: q, containerAnimation: anim, start: 'left right', end: 'right left', scrub: true } });
      });
    });

    // 4. palavras grandes que sobem de dentro de uma máscara
    gsap.timeline({ scrollTrigger: { trigger: '#cenaInterludio', start: 'top top', end: '+=160%', scrub: 0.8, pin: true } })
      .from('#interludioTexto .mascara__in', { yPercent: 118, rotate: 5, stagger: 0.14, duration: 0.5, ease: 'power3.out' })
      .to({}, { duration: 0.7 });

    // as cartas entram em perspetiva
    gsap.from('#cartas .titulo-cap, #cartas .sub-cap', { opacity: 0, y: 30, duration: 0.9, stagger: 0.15, scrollTrigger: { trigger: '#cartas', start: 'top 70%' } });
    gsap.utils.toArray('.carta').forEach(function (c) {
      gsap.from(c, { opacity: 0, rotateX: -45, y: 50, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 94%' } });
    });

    // 5. as razões, uma de cada vez, com o número gigante por trás
    var razoes = gsap.utils.toArray('.razao');
    var tr = gsap.timeline({ scrollTrigger: { trigger: '#cenaRazoes', start: 'top top', end: function () { return '+=' + (razoes.length * window.innerHeight * 0.7); }, scrub: 0.8, pin: true, invalidateOnRefresh: true } });
    razoes.forEach(function (r, i) {
      var num = r.querySelector('.razao__n');
      var txt = r.querySelector('.razao__t');
      tr.set(r, { opacity: 1 }, i);
      tr.fromTo(num, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, i);
      tr.fromTo(txt, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, i + 0.1);
      if (i < razoes.length - 1) tr.to([num, txt], { opacity: 0, y: -40, scale: 1.12, duration: 0.3, ease: 'power2.in' }, i + 0.7);
    });
    tr.to({}, { duration: 0.35 });

    // a carta longa: cada parágrafo aparece com calma
    gsap.utils.toArray('#cartaLonga p').forEach(function (p) {
      gsap.from(p, { opacity: 0, y: 28, duration: 1.1, ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 90%' } });
    });
    gsap.from('#cartaTitulo', { opacity: 0, y: 30, duration: 1, scrollTrigger: { trigger: '#cartaTitulo', start: 'top 85%' } });

    // final: as estrelas voam e juntam-se num coração, e só depois chegam as palavras
    var linhasF = gsap.utils.toArray('.final-linha');
    var tf = gsap.timeline({ scrollTrigger: { trigger: '#cenaFinal', start: 'top top', end: '+=260%', scrub: 1, pin: true } });
    tf.to(coracao, { p: 1, duration: 1.5, ease: 'power2.inOut' }, 0);
    linhasF.forEach(function (l, i) { tf.fromTo(l, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.3 + i * 0.5); });
    var fim = 1.3 + linhasF.length * 0.5;
    tf.fromTo('#assinatura', { opacity: 0 }, { opacity: 1, duration: 0.5 }, fim)
      .fromTo('#topo', { opacity: 0 }, { opacity: 1, duration: 0.4 }, fim + 0.3)
      .to({}, { duration: 0.6 });
  }
  animar();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  // ---------- entrar ----------
  var musica = $('musica');
  var botaoSom = $('som');
  $('comecar').addEventListener('click', function () {
    document.body.classList.remove('bloqueado');
    if (C.musica) {
      musica.src = C.musica; musica.volume = 0;
      var tocar = musica.play();
      if (tocar && tocar.catch) tocar.catch(function () {});
      gsap.to(musica, { volume: 0.55, duration: 4 });
      botaoSom.hidden = false; botaoSom.setAttribute('aria-pressed', 'true');
    }
    gsap.to('#cortina', { opacity: 0, duration: parado ? 0 : 1.6, ease: 'power1.inOut', onComplete: function () { $('cortina').remove(); } });
    if (!parado) {
      gsap.to('#barraCima, #barraBaixo', { height: '4.5svh', duration: 2.2, ease: 'power3.inOut' });
      gsap.from('.titulo-bloco .pequeno', { opacity: 0, y: 16, duration: 1.2, delay: 0.8 });
      gsap.from('.letra', { opacity: 0, y: 80, rotate: 8, duration: 1.6, stagger: 0.13, ease: 'power3.out', delay: 1.1 });
      gsap.from('.deslizar', { opacity: 0, duration: 1.4, delay: 3.2 });
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
