// a experiência, em cenas de cinema: monta tudo a partir de conteudo.js e anima com gsap + scrolltrigger.
// só se animam transform e opacity (leves no iphone). com "reduzir movimento" ligado, tudo aparece arrumado e legível
/* global gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin, Physics2DPlugin, Lenis */
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
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin, Physics2DPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // ---------- montar o conteúdo ----------
  $('abertura').textContent = C.abertura;
  var h1 = $('nome');
  h1.setAttribute('aria-label', C.nome);
  $('subFixo').textContent = 'Para a minha';
  $('subRoda').textContent = (C.apelidos && C.apelidos[0]) || 'Necas';
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
      foto.appendChild(el('i', 'quadro-flash'));
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

  ['nos', 'tu'].forEach(function (k, i) { if (peliculas[i]) antesDe(peliculas[i].sec, C.capitulos[k]); });
  antesDe($('cenaFrases'), C.capitulos.frases);
  antesDe($('jogo'), C.capitulos.jogo);
  antesDe($('codigo'), C.capitulos.codigo);
  antesDe($('mapa'), C.capitulos.sitios);
  antesDe($('carta'), C.capitulos.carta);

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

  (C.marquee || []).forEach(function (t, i) {
    var l = el('div', 'marquee__linha', (t + ' \u2665 ').repeat(6));
    l.setAttribute('data-dir', i % 2 ? '1' : '-1');
    $('marquee').appendChild(l);
  });
  C.frases.forEach(function (f) {
    var d = el('div', 'frase');
    d.appendChild(el('p', 'frase__fonte', f.fonte));
    d.appendChild(el('p', 'frase__txt', f.texto));
    d.appendChild(el('p', 'frase__pt', f.pt));
    d.appendChild(el('p', 'frase__nosso', f.nosso));
    $('frasesPalco').appendChild(d);
  });

  $('cartaTitulo').textContent = C.cartaTitulo || '';
  (C.carta || []).forEach(function (par) { $('cartaLonga').appendChild(el('p', null, par)); });

  C.final.forEach(function (linha) { $('finalTexto').appendChild(el('p', 'final-linha', linha)); });
  $('assinatura').textContent = C.assinatura;

  // créditos finais
  C.creditos.forEach(function (c) {
    var d = el('div', 'credito' + (c[1] ? '' : ' credito--solto'));
    d.appendChild(el('p', 'credito__papel', c[0]));
    if (c[1]) d.appendChild(el('p', 'credito__nome', c[1]));
    $('creditos').appendChild(d);
  });
  $('fimGrande').textContent = C.fim[0];
  $('fimSub').textContent = C.fim[1];

  // cartões de capítulo: um título grande antes de cada parte
  function criarCapitulo(par) {
    var sec = el('section', 'cena cena--capitulo');
    sec.appendChild(el('p', 'cap-num', par[0]));
    var t = el('h2', 'cap-titulo');
    t.setAttribute('aria-label', par[1]);
    // letra a letra, mas cada palavra inteira na mesma linha (para não partir "frases" a meio)
    par[1].split(' ').forEach(function (w, i, todas) {
      var pal = el('span', 'cap-palavra');
      pal.setAttribute('aria-hidden', 'true');
      w.split('').forEach(function (ch) { pal.appendChild(el('span', 'cap-letra', ch)); });
      t.appendChild(pal);
      if (i < todas.length - 1) t.appendChild(document.createTextNode(' '));
    });
    sec.appendChild(t);
    sec.appendChild(el('i', 'cap-linha'));
    return sec;
  }
  function antesDe(alvo, par) { alvo.parentNode.insertBefore(criarCapitulo(par), alvo); }

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
      if (abrir && !parado) {
        var selo = cab.querySelector('.carta__selo');
        gsap.fromTo(selo, { rotate: 0, scale: 1 }, { rotate: 360, scale: 1.35, duration: 0.6, ease: 'back.out(2)', yoyo: false, onComplete: function () { gsap.to(selo, { scale: 1.15, duration: 0.3 }); } });
        var txt = corpo.querySelector('.carta__texto');
        if (window.SplitText && !txt.getAttribute('data-partido')) { txt.setAttribute('data-partido', '1'); SplitText.create(txt, { type: 'words' }); }
        gsap.fromTo(txt.querySelectorAll('div, span'), { opacity: 0, y: 12, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.025, duration: 0.5, delay: 0.25, ease: 'power2.out' });
        var r = selo.getBoundingClientRect();
        coracoes(r.left + r.width / 2, r.top + r.height / 2, 10, true);
      }
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
  // a camada 3D (cinema.js) lê daqui o quanto as estrelas já são um coração, o soco de câmara e o quanto o céu está aceso
  window.CINEMA = { coracao: coracao, pulso: 0, acender: 1 };
  var NUM_CORACAO = 120;
  function medir() {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth; var h = window.innerHeight;
    tela.width = w * d; tela.height = h * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    var n = w < 700 ? 130 : 190;
    window.CINEMA.estrelas2d = n;
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
    if (document.body.classList.contains('gl')) { if (!parado) requestAnimationFrame(desenhar); return; } // com a camada 3D ligada, o céu 2D descansa
    var w = window.innerWidth; var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    var p = coracao.p;
    var bate = p > 0.9 ? 1 + 0.045 * Math.max(0, Math.sin(t / 280)) : 1;
    var cx = w / 2; var cy = h * 0.33;
    for (var i = 0; i < estrelas.length; i++) {
      var s = estrelas[i];
      var y = (s.y - rolar * s.p * 0.15 + h * 10) % h;
      var x = s.x;
      var brilho = (parado ? 0.6 : 0.35 + 0.35 * Math.sin(t / 1100 + s.f)) * Math.min(1.6, window.CINEMA.acender);
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
      ctx.fillStyle = 'rgba(' + (s.coracao && p > 0.5 ? '255,214,170' : '243,233,223') + ',' + Math.min(1, brilho).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(x, y, raio, 0, 6.2832); ctx.fill();
    }
    if (!parado && document.visibilityState === 'visible') requestAnimationFrame(desenhar);
  }
  medir();
  window.addEventListener('resize', medir);
  window.addEventListener('scroll', function () { rolar = window.scrollY; }, { passive: true });
  requestAnimationFrame(desenhar);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && !parado) requestAnimationFrame(desenhar); });

  // ---------- efeitos de rato e de toque: corações a nascer onde tocas ----------
  var ativos = 0;
  function coracoes(x, y, n, espalhar) {
    if (parado || ativos > 140) return;
    for (var i = 0; i < n; i++) {
      var h = el('span', 'fx-coracao', '♥');
      h.style.fontSize = (10 + Math.random() * 16) + 'px';
      document.body.appendChild(h);
      ativos++;
      var ang = Math.random() * 6.2832;
      var dist = 30 + Math.random() * (espalhar ? 170 : 70);
      gsap.set(h, { x: x, y: y, opacity: 1, scale: 0.4, rotate: (Math.random() - 0.5) * 50 });
      gsap.to(h, {
        x: x + Math.cos(ang) * dist, y: y + Math.sin(ang) * dist - 40 - Math.random() * 60, scale: 1 + Math.random() * 0.5, opacity: 0,
        duration: 1.1 + Math.random() * 0.9, ease: 'power2.out',
        onComplete: function () { ativos--; this.targets()[0].remove(); },
      });
    }
  }
  if (!parado) {
    // um toque (que não seja o gesto de deslizar) faz nascer corações
    document.addEventListener('pointerup', function (e) {
      if (e.target.closest && e.target.closest('#cortina')) return;
      coracoes(e.clientX, e.clientY, 6, false);
    }, { passive: true });

    // com rato: cursor próprio, rasto de corações, botões magnéticos e fotos que inclinam
    if (window.matchMedia('(pointer: fine)').matches) {
      document.body.classList.add('cursor-custom');
      var cur = el('div', 'cursor');
      cur.appendChild(el('div', 'cursor__anel'));
      cur.appendChild(el('div', 'cursor__ponto'));
      cur.style.opacity = '0';
      document.body.appendChild(cur);
      var anel = cur.querySelector('.cursor__anel');
      var ponto = cur.querySelector('.cursor__ponto');
      var anelX = gsap.quickTo(anel, 'x', { duration: 0.45, ease: 'power3' });
      var anelY = gsap.quickTo(anel, 'y', { duration: 0.45, ease: 'power3' });
      var ultimo = 0; var ux = 0; var uy = 0;
      window.addEventListener('pointermove', function (e) {
        cur.style.opacity = '1';
        gsap.set(ponto, { x: e.clientX, y: e.clientY });
        anelX(e.clientX); anelY(e.clientY);
        var agora = Date.now();
        if (agora - ultimo > 90 && Math.hypot(e.clientX - ux, e.clientY - uy) > 28) { coracoes(e.clientX, e.clientY, 1, false); ultimo = agora; ux = e.clientX; uy = e.clientY; }
        var alvo = e.target.closest && e.target.closest('button, a, .quadro-foto, .memo-carta');
        cur.classList.toggle('sobre', !!alvo);
        // fotos inclinam com o rato
        var foto = e.target.closest && e.target.closest('.quadro-foto');
        if (foto) {
          var r = foto.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5; var py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(foto, { rotateY: px * 14, rotateX: -py * 14, transformPerspective: 800, duration: 0.4, overwrite: 'auto' });
        }
        // botões puxam um pouco para o cursor
        var bt = e.target.closest && e.target.closest('.botao');
        if (bt) {
          var b = bt.getBoundingClientRect();
          gsap.to(bt, { x: (e.clientX - (b.left + b.width / 2)) * 0.25, y: (e.clientY - (b.top + b.height / 2)) * 0.35, duration: 0.3 });
        }
      }, { passive: true });
      document.addEventListener('pointerout', function (e) {
        var foto = e.target.closest && e.target.closest('.quadro-foto');
        if (foto) gsap.to(foto, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
        var bt = e.target.closest && e.target.closest('.botao');
        if (bt) gsap.to(bt, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    }
  }

  // ---------- as partes novas (extra.js) ----------
  window.FX = { coracoes: coracoes };
  window.EXTRA.montar({ parado: parado, coracoes: function (x, y, n, e) { coracoes(x, y, n, e); }, pulso: function (f) { pulso(f); } });
  window.MAIS.montar({ parado: parado, coracoes: function (x, y, n, e) { coracoes(x, y, n, e); }, pulso: function (f) { pulso(f); }, ir: function (y, d) { irPara(y, d); } });

  // ---------- minijogo da memória ----------
  var jogo = { aberta: [], bloqueio: false, certas: 0, jogadas: 0 };
  function baralhar(v) { for (var k = v.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = v[k]; v[k] = v[j]; v[j] = t; } return v; }
  function montarJogo() {
    var J = C.jogo;
    $('jogoTitulo').textContent = J.titulo;
    $('jogoSub').textContent = J.sub;
    jogo = { aberta: [], bloqueio: false, certas: 0, jogadas: 0 };
    $('memoFinal').hidden = true;
    $('memoMsg').textContent = '';
    $('memoContador').textContent = 'Jogadas: 0 · Pares: 0 de ' + J.pares.length;
    var baralho = [];
    J.pares.forEach(function (p, i) { baralho.push({ i: i, foto: p.foto }); baralho.push({ i: i, foto: p.foto }); });
    baralhar(baralho);
    var mesa = $('memo');
    mesa.textContent = '';
    baralho.forEach(function (c) {
      var b = el('button', 'memo-carta');
      b.type = 'button';
      b.setAttribute('data-par', String(c.i));
      b.setAttribute('aria-label', 'Carta virada para baixo');
      var dentro = el('div', 'memo-carta__in');
      dentro.appendChild(el('div', 'memo-face memo-face--costas', '♥'));
      var frente = el('div', 'memo-face memo-face--frente');
      var im = el('img'); im.src = c.foto; im.alt = ''; im.decoding = 'async';
      frente.appendChild(im);
      dentro.appendChild(frente);
      b.appendChild(dentro);
      b.addEventListener('click', function () { virar(b); });
      mesa.appendChild(b);
    });
  }
  function centroDe(elem) { var r = elem.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function virar(b) {
    if (jogo.bloqueio || b.classList.contains('virada') || b.classList.contains('certa')) return;
    b.classList.add('virada');
    b.setAttribute('aria-label', 'Carta virada');
    jogo.aberta.push(b);
    if (jogo.aberta.length < 2) return;
    jogo.jogadas++;
    var a = jogo.aberta[0]; var c = jogo.aberta[1];
    jogo.aberta = [];
    if (a.getAttribute('data-par') === c.getAttribute('data-par')) {
      a.classList.add('certa'); c.classList.add('certa');
      if (!parado) gsap.fromTo([a, c], { scale: 1.14, rotate: function (k) { return k ? 4 : -4; } }, { scale: 1, rotate: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
      jogo.certas++;
      $('memoMsg').textContent = C.jogo.pares[Number(a.getAttribute('data-par'))].msg;
      var ca = centroDe(a); var cc = centroDe(c);
      coracoes(ca.x, ca.y, 9, true); coracoes(cc.x, cc.y, 9, true);
      if (jogo.certas === C.jogo.pares.length) setTimeout(vitoria, 900);
    } else {
      jogo.bloqueio = true;
      setTimeout(function () { a.classList.remove('virada'); c.classList.remove('virada'); jogo.bloqueio = false; }, 900);
    }
    $('memoContador').textContent = 'Jogadas: ' + jogo.jogadas + ' · Pares: ' + jogo.certas + ' de ' + C.jogo.pares.length;
  }
  function vitoria() {
    $('memoMsg').textContent = '';
    $('memoVitoria').textContent = C.jogo.vitoria.join(' ');
    $('memoGrande').textContent = C.jogo.final;
    $('memoFinal').hidden = false;
    if (!parado) {
      if (temAnime) window.anime({ targets: '#memoGrande', scale: [0.5, 1], opacity: [0, 1], duration: 1800, easing: 'easeOutElastic(1, .55)' });
      gsap.from('#memoVitoria', { opacity: 0, y: 20, duration: 1.2, ease: 'power3.out' });
      for (var k = 0; k < 6; k++) setTimeout(function () { coracoes(Math.random() * window.innerWidth, window.innerHeight * (0.3 + Math.random() * 0.5), 14, true); }, k * 350);
    }
  }
  montarJogo();
  $('memoRecomecar').addEventListener('click', montarJogo);

  // um "soco de câmara": a lente 3D dá um zoom curto, usado a cada cena nova
  function pulso(f) {
    if (parado || !window.CINEMA) return;
    gsap.fromTo(window.CINEMA, { pulso: f || 1 }, { pulso: 0, duration: 1.8, ease: 'power3.out', overwrite: 'auto' }); // 'auto' só corta o pulso anterior, não o acender do céu
    gsap.fromTo('#vinheta', { opacity: Math.min(0.9, 0.45 * (f || 1)) }, { opacity: 0, duration: 1.4, ease: 'power2.out', overwrite: 'auto' });
  }

  // fogo de artifício dourado, para o FIM: vários rebentamentos com gravidade
  function fogoDeArtificio() {
    if (parado || !window.Physics2DPlugin) return;
    var w = window.innerWidth; var h = window.innerHeight;
    for (var k = 0; k < 6; k++) {
      (function (k) {
        setTimeout(function () {
          var x = w * (0.18 + Math.random() * 0.64); var y = h * (0.15 + Math.random() * 0.35);
          var cor = ['#d8b45f', '#ffd9a8', '#e0566e', '#f3e9df'][k % 4];
          for (var i = 0; i < 26; i++) {
            var b = el('i', 'brilho');
            b.style.background = cor; b.style.boxShadow = '0 0 8px 2px ' + cor;
            document.body.appendChild(b);
            gsap.set(b, { x: x, y: y, width: 3, height: 3, opacity: 1 });
            gsap.to(b, { duration: 1.6 + Math.random(), physics2D: { velocity: 140 + Math.random() * 220, angle: (i / 26) * 360, gravity: 160 }, opacity: 0, ease: 'none', onComplete: function () { this.targets()[0].remove(); } });
          }
          pulso(0.8);
        }, k * 420);
      })(k);
    }
    for (var j = 0; j < 4; j++) setTimeout(function () { coracoes(w * Math.random(), h * (0.3 + Math.random() * 0.4), 10, true); }, 300 + j * 500);
  }

  // um cometa que atravessa o céu de vez em quando
  function cometa() {
    if (document.visibilityState === 'visible' && !document.body.classList.contains('bloqueado')) {
      var c = el('div', 'cometa');
      document.body.appendChild(c);
      var w = window.innerWidth; var h = window.innerHeight;
      var x0 = Math.random() * w * 0.55; var y0 = Math.random() * h * 0.35;
      var ang = 22 + Math.random() * 16;
      var dx = w * 0.85; var dy = Math.tan(ang * Math.PI / 180) * dx;
      gsap.set(c, { x: x0, y: y0, rotate: ang, opacity: 0 });
      gsap.timeline({ onComplete: function () { c.remove(); } })
        .to(c, { opacity: 1, duration: 0.18 }, 0)
        .to(c, { x: x0 + dx, y: y0 + dy, duration: 1.5, ease: 'power1.in' }, 0)
        .to(c, { opacity: 0, duration: 0.45 }, 1.05);
    }
    setTimeout(cometa, 6000 + Math.random() * 7000);
  }

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
    ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: function (self) {
      $('barra').style.transform = 'scaleX(' + self.progress.toFixed(4) + ')';
      $('barraCoracao').style.transform = 'translateX(' + (self.progress * window.innerWidth).toFixed(1) + 'px)';
    } });

    // 1. o título cresce até engolir o ecrã, com uma luz a varrer por cima
    gsap.timeline({ scrollTrigger: { trigger: '#cenaTitulo', start: 'top top', end: '+=120%', scrub: 0.8, pin: true } })
      .to('.luz-varrer', { x: '260%', ease: 'none', duration: 1 }, 0)
      .to('#tituloBloco', { scale: 2.6, opacity: 0, ease: 'power2.in', duration: 0.9 }, 0.2);

    // 2. as frases do dia difícil, uma a uma
    sequencia('#cenaDificil', gsap.utils.toArray('.linha'),
      { de: { opacity: 0, y: 70, scale: 0.93, filter: 'blur(14px)' }, para: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } },
      { opacity: 0, y: -70, scale: 1.05, filter: 'blur(12px)' }, 0.75);


    // cartões de capítulo: o título entra letra a letra, a linha abre, e tudo se desfoca e desaparece.
    // têm de ser criados pela ordem em que aparecem na página (o gsap calcula o espaço das cenas fixas por essa ordem)
    var capitulos = gsap.utils.toArray('.cena--capitulo');
    function animarCapitulo(sec) {
      if (!sec) return;
      var tlc = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: '+=140%', scrub: 0.7, pin: true, onEnter: function () { if (window.MAIS) window.MAIS.luzDeCapitulo(); } } });
      tlc.fromTo(sec.querySelector('.cap-num'), { opacity: 0, y: 20, letterSpacing: '1em', rotateX: -90, transformPerspective: 500 }, { opacity: 1, y: 0, letterSpacing: '0.5em', rotateX: 0, duration: 0.5, ease: 'power2.out' }, 0);
      tlc.fromTo(sec.querySelectorAll('.cap-letra'), { yPercent: 120, opacity: 0, rotate: 8 }, { yPercent: 0, opacity: 1, rotate: 0, stagger: 0.07, duration: 0.6, ease: 'power3.out' }, 0.1);
      tlc.fromTo(sec.querySelector('.cap-linha'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, 0.5);
      tlc.to({}, { duration: 0.5 });
      tlc.to(sec.querySelector('.cap-titulo'), { scale: 1.25, opacity: 0, filter: 'blur(16px)', duration: 0.5, ease: 'power2.in' });
      tlc.to([sec.querySelector('.cap-num'), sec.querySelector('.cap-linha')], { opacity: 0, duration: 0.4 }, '<');
    }

    // 3. as películas: descer faz a tira de fotos deslizar na horizontal, com paralaxe dentro de cada foto
    peliculas.forEach(function (pel, ip) {
      animarCapitulo(capitulos[ip]); // I Nós, II Tu
      var tira = pel.tira;
      var quadros = gsap.utils.toArray('.quadro-cena', tira);
      var n = quadros.length;
      var PAUSA = 0.7; // quanto tempo (do scroll) cada foto fica parada no centro
      var dist = function () { return Math.max(0, tira.scrollWidth - window.innerWidth); };
      // quanto a tira tem de andar para a foto i ficar centrada no ecrã
      var alvo = function (i) { var q = quadros[i]; return -Math.min(dist(), Math.max(0, q.offsetLeft + q.offsetWidth / 2 - window.innerWidth / 2)); };
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pel.sec, start: 'top top', end: function () { return '+=' + (n * window.innerHeight * 0.95); }, pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: function (self) {
            // a foto i está ao centro entre i*(1+PAUSA) e i*(1+PAUSA)+PAUSA; o número muda a meio de cada viagem
            var idx = Math.min(n - 1, Math.floor((self.progress * tl.duration() + 0.5) / (1 + PAUSA)));
            pel.contador.textContent = dois(Math.max(0, idx) + 1) + ' / ' + dois(n);
            pel.barra.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')';
            pel.sec.style.setProperty('--perf', (-self.progress * dist() * 0.55).toFixed(1) + 'px');
          },
        },
      });
      tl.set(tira, { x: function () { return alvo(0); } }, 0);
      quadros.forEach(function (q, i) {
        var foto = q.querySelector('.quadro-foto');
        var leg = q.querySelector('.quadro-legenda');
        var img = q.querySelector('img');
        var tituloQ = q.querySelector('.momento__titulo');
        var chars = tituloQ && window.SplitText ? SplitText.create(tituloQ, { type: 'words,chars' }).chars : [tituloQ];
        var chega = i === 0 ? 0 : (i - 1) * (1 + PAUSA) + PAUSA; // quando começa a viagem até esta foto
        if (i > 0) {
          // a anterior afasta-se e a tira desliza com calma até esta ficar centrada
          tl.to([quadros[i - 1].querySelector('.quadro-foto'), quadros[i - 1].querySelector('.quadro-legenda')], { opacity: 0.2, scale: 0.9, duration: 0.5, ease: 'power2.in' }, chega);
          tl.to(tira, { x: function () { return alvo(i); }, duration: 1, ease: 'power2.inOut' }, chega);
          tl.fromTo(foto, { scale: 0.8, rotate: i % 2 ? 5 : -5, opacity: 0.25 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, chega + 0.2);
          var flash = foto.querySelector('.quadro-flash');
          if (flash) tl.fromTo(flash, { opacity: 0 }, { keyframes: [{ opacity: 0.85, duration: 0.05 }, { opacity: 0, duration: 0.35 }], ease: 'none' }, chega + 0.95);
        }
        // a foto revela-se como uma polaroid e a legenda escreve-se letra a letra
        if (img && i > 0) tl.fromTo(img, { filter: 'sepia(0.85) brightness(1.45) contrast(0.8) blur(5px)' }, { filter: 'sepia(0) brightness(1) contrast(1) blur(0px)', duration: 0.9, ease: 'power2.out' }, chega + 0.25);
        if (img) tl.fromTo(img, { scale: 1.16, xPercent: -6 }, { scale: 1, xPercent: 6, duration: 1 + PAUSA, ease: 'none' }, Math.max(0, chega));
        // (a primeira já está à vista quando a película começa)
        if (i > 0) {
          tl.fromTo(leg, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, chega + 0.6);
          tl.fromTo(chars, { opacity: 0, yPercent: 80, rotate: 10 }, { opacity: 1, yPercent: 0, rotate: 0, stagger: 0.012, duration: 0.35, ease: 'power3.out' }, chega + 0.6);
        }
      });
      tl.to({}, { duration: PAUSA });
    });

    animarCapitulo(capitulos[2]); // III As nossas frases
    // 3b. frases de filmes e séries: letra gigante que anda com o scroll, e uma frase de cada vez no centro
    var dur;
    var tlF = sequencia('#cenaFrases', gsap.utils.toArray('.frase'),
      { de: { opacity: 0, y: 60, scale: 0.9, rotate: -1.5, filter: 'blur(16px)' }, para: { opacity: 1, y: 0, scale: 1, rotate: 0, filter: 'blur(0px)' } },
      { opacity: 0, y: -60, scale: 1.07, filter: 'blur(14px)' }, 0.7);
    dur = tlF.duration();
    gsap.utils.toArray('.marquee__linha').forEach(function (r) {
      var dir = Number(r.getAttribute('data-dir'));
      tlF.fromTo(r, { xPercent: dir > 0 ? -26 : 0 }, { xPercent: dir > 0 ? 0 : -26, ease: 'none', duration: dur }, 0);
    });

    // 3c. as minhas frases, cada uma com a sua animação
    window.EXTRA.animarMinhas();

    // 4. palavras grandes que sobem de dentro de uma máscara
    gsap.timeline({ scrollTrigger: { trigger: '#cenaInterludio', start: 'top top', end: '+=160%', scrub: 0.8, pin: true } })
      .from('#interludioTexto .mascara__in', { yPercent: 118, rotate: 5, stagger: 0.14, duration: 0.5, ease: 'power3.out' })
      .to({}, { duration: 0.7 });

    // (as cartas, os jogos e os títulos entram e saem com os efeitos globais de extra.js, no fim)

    // 5. as razões, uma de cada vez, com o número gigante por trás
    var razoes = gsap.utils.toArray('.razao');
    var tr = gsap.timeline({ scrollTrigger: { trigger: '#cenaRazoes', start: 'top top', end: function () { return '+=' + (razoes.length * window.innerHeight * 0.7); }, scrub: 0.8, pin: true, invalidateOnRefresh: true } });
    razoes.forEach(function (r, i) {
      var num = r.querySelector('.razao__n');
      var txt = r.querySelector('.razao__t');
      tr.set(r, { opacity: 1 }, i);
      tr.fromTo(num, { opacity: 0, scale: 0.6, rotateY: -90 }, { opacity: 1, scale: 1, rotateY: 0, duration: 0.5, ease: 'power2.out' }, i);
      tr.fromTo(txt, { opacity: 0, y: 40, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.35, ease: 'power2.out' }, i + 0.1);
      tr.fromTo('#razoesAnel', { scale: 0.6, opacity: 0.9 }, { scale: 1.6, opacity: 0, duration: 0.6, ease: 'power2.out' }, i + 0.05);
      if (i < razoes.length - 1) tr.to([num, txt], { opacity: 0, y: -40, scale: 1.12, duration: 0.3, ease: 'power2.in' }, i + 0.7);
    });
    tr.to({}, { duration: 0.35 });

    animarCapitulo(capitulos[3]); // IV Os jogos
    animarCapitulo(capitulos[4]); // V O nosso código
    animarCapitulo(capitulos[5]); // VI Os nossos sítios
    animarCapitulo(capitulos[6]); // VII A carta

    // a contagem das estrelas, presa ao scroll, logo antes do coração
    window.EXTRA.animarContagem();

    // final: as estrelas voam e juntam-se num coração, e só depois chegam as palavras
    var linhasF = gsap.utils.toArray('.final-linha');
    var tf = gsap.timeline({ scrollTrigger: { trigger: '#cenaFinal', start: 'top top', end: '+=260%', scrub: 1, pin: true } });
    tf.to(coracao, { p: 1, duration: 1.5, ease: 'power2.inOut' }, 0);
    linhasF.forEach(function (l, i) { tf.fromTo(l, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.3 + i * 0.5); });
    var fim = 1.3 + linhasF.length * 0.5;
    tf.fromTo('#assinatura', { opacity: 0 }, { opacity: 1, duration: 0.5 }, fim)
      .to({}, { duration: 0.8 });

    // créditos finais: sobem por cima do coração a bater, e no fim aparece o FIM
    var cr = $('creditos');
    var tc = gsap.timeline({ scrollTrigger: { trigger: '#cenaCreditos', start: 'top top', end: '+=430%', scrub: 0.9, pin: true, invalidateOnRefresh: true } });
    tc.fromTo(cr, { y: function () { return window.innerHeight * 0.95; } }, { y: function () { return -cr.offsetHeight - 30; }, ease: 'none', duration: 3 }, 0);
    tc.fromTo(window.CINEMA, { acender: 1 }, { acender: 0.45, duration: 0.5, ease: 'power1.out' }, 0);
    tc.to(window.CINEMA, { acender: 1.25, duration: 0.6, ease: 'power2.out' }, 2.4);
    tc.fromTo('#creditosFim', { opacity: 0, scale: 0.86, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' }, 2.5);
    tc.to({}, { duration: 0.7 });
    var fogoFeito = false;
    ScrollTrigger.create({ trigger: '#cenaCreditos', start: function () { return tc.scrollTrigger.start + (tc.scrollTrigger.end - tc.scrollTrigger.start) * 0.78; }, onEnter: function () { if (!fogoFeito) { fogoFeito = true; fogoDeArtificio(); } } });

    // um soco de câmara a cada cena nova
    ['#cenaDificil', '#cenaFrases', '#cenaMinhas', '#contagem', '#cenaInterludio', '#cenaRazoes', '#cenaFinal', '#cenaCreditos', '.cena--tira', '.cena--capitulo'].forEach(function (sel) {
      gsap.utils.toArray(sel).forEach(function (el2) { ScrollTrigger.create({ trigger: el2, start: 'top 65%', onEnter: function () { pulso(1); } }); });
    });
    setTimeout(cometa, 5000);
  }
  animar();
  // os efeitos globais (letras que se formam, blocos que entram e saem) vêm depois de todas as cenas fixas
  window.EXTRA.animarResto();
  window.MAIS.animar();

  // scroll suave com o rato (lenis); no telemóvel fica o scroll nativo, que é o mais fiável no safari
  var lenis = null;
  if (!parado && window.Lenis && window.matchMedia('(pointer: fine)').matches) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  function irPara(y, depressa) {
    if (lenis) lenis.scrollTo(y, { duration: depressa ? 0.01 : 2.2, immediate: !!depressa });
    else window.scrollTo({ top: y, behavior: depressa || parado ? 'auto' : 'smooth' });
  }

  // ---------- desenhos de traço com anime.js ----------
  var temAnime = typeof window.anime !== 'undefined';
  if (temAnime && !parado) {
    var corp = document.querySelector('.cortina__coracao path');
    if (corp) {
      window.anime({ targets: corp, strokeDashoffset: [window.anime.setDashoffset, 0], duration: 2600, easing: 'easeInOutSine', delay: 400,
        complete: function () { window.anime({ targets: '.cortina__coracao', scale: [1, 1.12, 1], duration: 1400, easing: 'easeInOutSine', loop: true }); } });
    }
    var sub = document.querySelector('.sublinhado path');
    if (sub) { sub.style.strokeDasharray = '1000'; sub.style.strokeDashoffset = '1000'; }
  }

  // ---------- entrar ----------
  var musica = $('musica');
  var botaoSom = $('som');
  var botaoComecar = $('comecar');

  // espera que as fotos estejam descodificadas, para a experiência não engasgar ao começar
  function pronto() { botaoComecar.disabled = false; botaoComecar.textContent = 'Toca para começar'; }
  var decodificadas = Promise.all([].slice.call(document.images).map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); }));
  var limite = new Promise(function (r) { setTimeout(r, 7000); });
  Promise.race([decodificadas.then(function () { return document.fonts ? document.fonts.ready : null; }), limite]).then(pronto);

  function tocarMusica() {
    if (!C.musica) return;
    musica.src = C.musica; musica.volume = 0;
    var tocar = musica.play();
    if (tocar && tocar.catch) tocar.catch(function () {});
    gsap.to(musica, { volume: 0.55, duration: 4 });
    botaoSom.hidden = false; botaoSom.setAttribute('aria-pressed', 'true');
  }

  // depois do genericoDeAbertura: liberta o scroll e o título aparece
  function entrar() {
    document.body.classList.remove('bloqueado');
    if (lenis) lenis.start();
    if (!parado) {
      gsap.from('.titulo-bloco .pequeno', { opacity: 0, y: 16, duration: 1.2, delay: 0.4 });
      if (temAnime) {
        gsap.set('.letra', { opacity: 0 });
        window.anime({ targets: '.letra', translateY: [90, 0], rotate: [10, 0], opacity: [0, 1], delay: window.anime.stagger(140, { start: 700 }), duration: 1900, easing: 'easeOutElastic(1, .6)' });
        var sub2 = document.querySelector('.sublinhado path');
        if (sub2) window.anime({ targets: sub2, strokeDashoffset: [1000, 0], duration: 2200, delay: 2500, easing: 'easeInOutSine' });
      } else {
        gsap.from('.letra', { opacity: 0, y: 80, rotate: 8, duration: 1.6, stagger: 0.13, ease: 'power3.out', delay: 0.7 });
      }
      gsap.from('.deslizar', { opacity: 0, duration: 1.4, delay: 2.8 });
      // o apelido por baixo do título vai rodando
      var ap = C.apelidos || ['Necas']; var ia = 0; var roda = $('subRoda');
      if (ap.length > 1) {
        setInterval(function () {
          ia = (ia + 1) % ap.length;
          gsap.to(roda, { opacity: 0, y: -10, duration: 0.4, onComplete: function () { roda.textContent = ap[ia]; gsap.fromTo(roda, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }); } });
        }, 2600);
      }
    }
    ScrollTrigger.refresh();
  }

  // o genericoDeAbertura de abertura, como num filme: barras de cinema a fechar e três cartões de texto
  function genericoDeAbertura(depois) {
    var caixa = $('intro'); var linha = $('introLinha'); var tl; var feito = false;
    function acabar() {
      if (feito) return;
      feito = true;
      if (tl) tl.kill();
      gsap.to(caixa, { opacity: 0, duration: 0.9, onComplete: function () { caixa.hidden = true; } });
      gsap.to('#barraCima, #barraBaixo', { height: '4.5svh', duration: 1.6, ease: 'power3.inOut' });
      pulso(1.5);
      depois();
    }
    caixa.hidden = false;
    gsap.set(caixa, { opacity: 1 });
    gsap.to('#barraCima, #barraBaixo', { height: '12svh', duration: 2.4, ease: 'power3.inOut' });
    pulso(1.2);
    tl = gsap.timeline({ onComplete: acabar });
    var pos = 1.0;
    C.intro.forEach(function (t) {
      tl.call(function () { linha.textContent = t; }, null, pos);
      tl.fromTo(linha, { opacity: 0, filter: 'blur(14px)', letterSpacing: '0.7em', scale: 1.08 }, { opacity: 1, filter: 'blur(0px)', letterSpacing: '0.3em', scale: 1, duration: 1.2, ease: 'power2.out' }, pos);
      tl.to(linha, { opacity: 0, filter: 'blur(10px)', duration: 0.8, ease: 'power2.in' }, pos + 1.9);
      pos += 2.9;
    });
    tl.to({}, { duration: 0.2 }, pos);
    $('introPassar').addEventListener('click', acabar);
  }

  botaoComecar.addEventListener('click', function () {
    tocarMusica();
    gsap.to('#cortina', { opacity: 0, duration: parado ? 0 : 1.4, ease: 'power1.inOut', onComplete: function () { $('cortina').remove(); } });
    // primeiro o prólogo (a carta que eu tentei escrever), depois o genérico e o filme
    window.PROLOGO({ parado: parado, pulso: pulso, depois: function () { if (parado) entrar(); else genericoDeAbertura(entrar); } });
  });
  var botaoContinuar = $('continuar');
  var guardado = window.MAIS.posicaoGuardada();
  if (guardado > window.innerHeight * 2) {
    botaoContinuar.textContent = (C.ui && C.ui.continuar) || 'Continuar onde ficaste';
    botaoContinuar.hidden = false;
  }
  botaoContinuar.addEventListener('click', function () {
    tocarMusica();
    gsap.to('#cortina', { opacity: 0, duration: parado ? 0 : 0.9, onComplete: function () { $('cortina').remove(); } });
    gsap.set('#barraCima, #barraBaixo', { height: '4.5svh' });
    entrar();
    setTimeout(function () { ScrollTrigger.refresh(); irPara(guardado, true); }, 120);
  });
  botaoSom.addEventListener('click', function () {
    var ligado = botaoSom.getAttribute('aria-pressed') === 'true';
    if (ligado) musica.pause(); else musica.play();
    botaoSom.setAttribute('aria-pressed', ligado ? 'false' : 'true');
  });
  $('topo').addEventListener('click', function () {
    if (lenis) lenis.scrollTo(0, { duration: 5 });
    else window.scrollTo({ top: 0, behavior: parado ? 'auto' : 'smooth' });
  });
})();
