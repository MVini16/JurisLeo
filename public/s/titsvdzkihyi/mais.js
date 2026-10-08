// ainda mais: cenas interativas novas (balões, puzzle, mapa, roda dos encontros, frasco, lanterna, desenhar um coração),
// ajudas para ela (índice dos capítulos, continuar onde ficou, capítulo atual, dica para deslizar, modo calmo, ecrã inteiro,
// guardar a carta, atalhos de teclado, aviso para virar o telemóvel) e mais animações espalhadas pelo filme.
// app.js chama montar() ao construir a página e animar() depois de todas as cenas fixas
/* global gsap, ScrollTrigger */
(function () {
  var C = window.CONTEUDO;
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  var SVG = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function centroDe(e) { var r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function vibrar(ms) { if (navigator.vibrate) { try { navigator.vibrate(ms); } catch { /* sem vibração */ } } }
  function ler(chave, padrao) { try { var v = JSON.parse(localStorage.getItem(chave)); return v == null ? padrao : v; } catch { return padrao; } }
  function guardar(chave, v) { try { localStorage.setItem(chave, JSON.stringify(v)); } catch { /* sem armazenamento */ } }
  function baralhar(v) { for (var k = v.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = v[k]; v[k] = v[j]; v[j] = t; } return v; }

  var ctx; var parado = false;
  var CHAVE_POS = 'surpresa-posicao';
  var CHAVE_CALMO = 'surpresa-calmo';
  var CHAVE_INC = 'surpresa-inclinar';
  var ligarInclinar = null; // montado em montarAjudas
  function calmo() { return document.body.classList.contains('calmo'); }

  // ---------- confetti e estrelas cadentes (usados por várias cenas) ----------
  function confetti(n) {
    if (parado || calmo() || !window.Physics2DPlugin) return;
    var w = window.innerWidth;
    var cores = ['#d8b45f', '#e0566e', '#f3e9df', '#8e1f33', '#ffd9a8'];
    for (var i = 0; i < (n || 70); i++) {
      var c = el('i', 'confetti');
      c.style.background = cores[i % cores.length];
      document.body.appendChild(c);
      gsap.set(c, { x: w / 2 + (Math.random() - 0.5) * 80, y: window.innerHeight * 0.35, rotate: Math.random() * 360, opacity: 1 });
      gsap.to(c, { duration: 2.2 + Math.random() * 1.2, physics2D: { velocity: 300 + Math.random() * 500, angle: -40 - Math.random() * 100, gravity: 520 }, rotate: '+=' + (360 + Math.random() * 720), opacity: 0, ease: 'none', onComplete: function () { this.targets()[0].remove(); } });
    }
  }
  function estrelasCadentes(n) {
    if (parado || calmo()) return;
    var w = window.innerWidth; var h = window.innerHeight;
    for (var i = 0; i < (n || 7); i++) {
      (function (i) {
        setTimeout(function () {
          var c = el('div', 'cometa');
          document.body.appendChild(c);
          var x0 = Math.random() * w * 0.7; var y0 = Math.random() * h * 0.3;
          var ang = 25 + Math.random() * 20; var dx = w * 0.6; var dy = Math.tan(ang * Math.PI / 180) * dx;
          gsap.set(c, { x: x0, y: y0, rotate: ang, opacity: 0 });
          gsap.timeline({ onComplete: function () { c.remove(); } })
            .to(c, { opacity: 1, duration: 0.12 }, 0)
            .to(c, { x: x0 + dx, y: y0 + dy, duration: 0.9, ease: 'power1.in' }, 0)
            .to(c, { opacity: 0, duration: 0.3 }, 0.6);
        }, i * 180);
      })(i);
    }
  }
  // uma luz quente que atravessa o ecrã ao entrar num capítulo
  function luzDeCapitulo() {
    if (parado || calmo()) return;
    gsap.fromTo('#luzCapitulo', { opacity: 0, xPercent: -70 }, { keyframes: [{ opacity: 0.85, duration: 0.35 }, { opacity: 0, duration: 0.9 }], xPercent: 70, duration: 1.25, ease: 'power1.inOut' });
  }

  // ---------- nível 5: balões ----------
  function montarBaloes() {
    var B = C.baloes;
    $('baloesTitulo').textContent = B.titulo;
    $('baloesSub').textContent = B.sub;
    var ceu = $('baloesCeu'); var frase = $('baloesFrase');
    var partes = B.palavras.map(function (p) { var s = el('span', 'frase-baloes__p', p); frase.appendChild(s); frase.appendChild(document.createTextNode(' ')); return s; });
    var rebentados = 0;
    var ordem = baralhar(B.palavras.map(function (_, i) { return i; }));
    ordem.forEach(function (i, k) {
      var b = el('button', 'balao' + (k % 2 ? ' balao--ouro' : ''));
      b.type = 'button';
      b.setAttribute('aria-label', 'Balão: ' + B.palavras[i]);
      b.style.left = (8 + (k % 3) * 30 + Math.random() * 8) + '%';
      b.style.top = (k < 3 ? 8 : 48) + Math.random() * 10 + '%';
      b.appendChild(el('span', 'balao__fio'));
      ceu.appendChild(b);
      if (!parado) gsap.to(b, { y: -14 - Math.random() * 10, rotate: (Math.random() - 0.5) * 10, duration: 1.6 + Math.random(), yoyo: true, repeat: -1, ease: 'sine.inOut', delay: Math.random() });
      b.addEventListener('click', function () {
        if (b.disabled) return;
        b.disabled = true;
        var c = centroDe(b);
        ctx.coracoes(c.x, c.y, 12, true);
        vibrar(18);
        gsap.killTweensOf(b);
        gsap.to(b, { scale: 1.5, opacity: 0, duration: parado ? 0 : 0.22, ease: 'power2.out', onComplete: function () { b.style.visibility = 'hidden'; } });
        var p = partes[i];
        p.classList.add('visivel');
        if (!parado) gsap.fromTo(p, { rotateX: -90, y: 10 }, { rotateX: 0, y: 0, duration: 0.7, ease: 'back.out(2)' });
        rebentados++;
        if (rebentados === B.palavras.length) {
          setTimeout(function () {
            frase.classList.add('frase-baloes--feita');
            frase.textContent = B.feito;
            if (!parado) gsap.fromTo(frase, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
            confetti(60); ctx.pulso(1.4);
          }, 700);
        }
      });
    });
  }

  // ---------- nível 6: puzzle de peças a rodar ----------
  function montarPuzzle() {
    var P = C.puzzle;
    $('puzzleTitulo').textContent = P.titulo;
    $('puzzleSub').textContent = P.sub;
    var grelha = $('puzzleGrelha');
    // a grelha é quadrada (peças quadradas rodam sem se sobrepor); a foto cobre-a toda, ao centro
    var img = new Image();
    function encaixar() {
      if (!img.naturalWidth) return;
      var lado = grelha.clientWidth; var t = lado / 3;
      var esc = Math.max(lado / img.naturalWidth, lado / img.naturalHeight);
      var w = img.naturalWidth * esc; var h = img.naturalHeight * esc;
      var ox = (w - lado) / 2; var oy = (h - lado) / 2;
      grelha.querySelectorAll('.peca').forEach(function (p, k) {
        p.style.backgroundSize = w + 'px ' + h + 'px';
        p.style.backgroundPosition = -((k % 3) * t + ox) + 'px ' + -(Math.floor(k / 3) * t + oy) + 'px';
      });
    }
    img.onload = encaixar;
    img.src = P.foto;
    window.addEventListener('resize', encaixar);
    var rot = [];
    for (var k = 0; k < 9; k++) rot.push([90, 180, 270, 0][Math.floor(Math.random() * 4)]);
    if (rot.every(function (r) { return r === 0; })) rot[4] = 90;
    var feito = false;
    rot.forEach(function (r, k) {
      var t = el('button', 'peca');
      t.type = 'button';
      t.setAttribute('aria-label', 'Peça ' + (k + 1));
      t.style.backgroundImage = 'url(' + P.foto + ')';
      gsap.set(t, { rotation: r });
      grelha.appendChild(t);
      t.addEventListener('click', function () {
        if (feito) return;
        rot[k] += 90;
        gsap.to(t, { rotation: rot[k], duration: parado ? 0 : 0.45, ease: 'back.out(1.8)' });
        vibrar(8);
        if (rot.every(function (v) { return v % 360 === 0; })) {
          feito = true;
          grelha.classList.add('puzzle--feito');
          $('puzzleMsg').textContent = P.feito;
          var c = centroDe(grelha);
          ctx.coracoes(c.x, c.y, 24, true); ctx.pulso(1.3);
          if (!parado) gsap.fromTo(grelha, { scale: 0.96 }, { scale: 1, duration: 1, ease: 'elastic.out(1, 0.4)' });
        }
      });
    });
  }

  // ---------- capítulo vi: o mapa dos nossos sítios ----------
  function montarMapa() {
    var M = C.mapa;
    $('mapaTitulo').textContent = M.titulo;
    $('mapaSub').textContent = M.sub;
    var svg = $('mapaSvg');
    // a costa, desenhada à mão (portugal e o sul de espanha), e a rota entre os sítios
    svg.appendChild(svgEl('path', { class: 'mapa__costa', d: 'M22 4 C 20 14 17 22 16 30 C 15 38 13 44 14 50 C 15 56 14 62 15 68 C 16 72 18 76 22 78 C 28 79 34 78 40 80 C 48 83 56 86 64 87 C 72 88 80 86 88 82' }));
    var pontos = M.sitios.map(function (s) { return s.x + ' ' + s.y; });
    svg.appendChild(svgEl('path', { class: 'mapa__rota', id: 'mapaRota', d: 'M' + pontos[0] + ' Q 10 51 ' + pontos[1] + ' S 20 72 ' + pontos[2] + ' S 50 80 ' + pontos[3] }));
    svg.appendChild(svgEl('path', { class: 'mapa__aviao', id: 'mapaAviao', d: 'M-3 -2 L4 0 L-3 2 L-1.5 0 Z' }));
    var postal = $('mapaPostal');
    M.sitios.forEach(function (s, i) {
      var p = el('button', 'pino');
      p.type = 'button';
      p.style.left = s.x + '%'; p.style.top = s.y + '%';
      p.style.setProperty('--d', (i * 0.4) + 's');
      p.setAttribute('aria-label', s.nome);
      p.appendChild(el('span', 'pino__nome', s.nome));
      $('mapaPinos').appendChild(p);
      p.addEventListener('click', function () {
        document.querySelectorAll('.pino').forEach(function (o) { o.classList.toggle('pino--ativo', o === p); });
        postal.textContent = '';
        var cartao = el('div', 'postal');
        var foto = el('img', 'postal__foto'); foto.src = s.foto; foto.alt = s.nome;
        cartao.appendChild(foto);
        var txt = el('div', 'postal__txt');
        txt.appendChild(el('p', 'postal__nome', s.nome));
        txt.appendChild(el('p', 'postal__texto', s.texto));
        cartao.appendChild(txt);
        postal.appendChild(cartao);
        if (!parado) gsap.fromTo(cartao, { rotateY: -80, opacity: 0, transformPerspective: 900 }, { rotateY: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.6)' });
        var c = centroDe(p); ctx.coracoes(c.x, c.y, 8, false);
      });
    });
  }

  // ---------- a roda dos próximos encontros ----------
  var ICONES_RODA = ['🍝', '🧺', '🌅', '📺', '🍧', '📵', '🍳', '🎄'];
  function montarRoda() {
    var R = C.roda;
    $('rodaTitulo').textContent = R.titulo;
    $('rodaSub').textContent = R.sub;
    $('rodaGirar').textContent = R.botao;
    var svg = $('rodaSvg');
    var n = R.opcoes.length; var ang = 360 / n;
    var g = svgEl('g', { id: 'rodaGira' });
    for (var i = 0; i < n; i++) {
      var a0 = (i * ang - 90 - ang / 2) * Math.PI / 180; var a1 = ((i + 1) * ang - 90 - ang / 2) * Math.PI / 180;
      var d = 'M0 0 L ' + (100 * Math.cos(a0)).toFixed(2) + ' ' + (100 * Math.sin(a0)).toFixed(2) + ' A 100 100 0 0 1 ' + (100 * Math.cos(a1)).toFixed(2) + ' ' + (100 * Math.sin(a1)).toFixed(2) + ' Z';
      g.appendChild(svgEl('path', { d: d, class: 'roda__fatia' + (i % 2 ? ' roda__fatia--b' : '') }));
      var am = (i * ang - 90) * Math.PI / 180;
      var t = svgEl('text', { x: (66 * Math.cos(am)).toFixed(2), y: (66 * Math.sin(am)).toFixed(2), class: 'roda__icone', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
      t.textContent = ICONES_RODA[i % ICONES_RODA.length];
      g.appendChild(t);
    }
    g.appendChild(svgEl('circle', { r: 16, class: 'roda__centro' }));
    var meio = svgEl('text', { class: 'roda__coracao', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    meio.textContent = '♥';
    svg.appendChild(g); svg.appendChild(meio);
    var rodando = false; var total = 0;
    $('rodaGirar').addEventListener('click', function () {
      if (rodando) return;
      rodando = true;
      $('rodaMsg').textContent = '';
      var escolha = Math.floor(Math.random() * n);
      // a fatia escolhida tem de parar debaixo do ponteiro (em cima)
      var destino = 360 * 6 - escolha * ang;
      total = total - (total % 360) + destino;
      gsap.to(g, { rotation: total, svgOrigin: '0 0', duration: parado ? 0 : 4.6, ease: 'power4.out', onComplete: function () {
        rodando = false;
        var msg = $('rodaMsg');
        msg.textContent = '';
        msg.appendChild(el('span', 'roda-saiu', R.saiu + ' '));
        msg.appendChild(el('b', null, ICONES_RODA[escolha] + ' ' + R.opcoes[escolha]));
        if (R.depois) msg.appendChild(el('span', 'roda-depois', R.depois));
        if (!parado) gsap.fromTo(msg, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(2.5)' });
        var c = centroDe(svg); ctx.coracoes(c.x, c.y, 18, true); vibrar([20, 40, 20]);
      } });
    });
  }

  // ---------- o frasco dos bilhetinhos ----------
  function montarFrasco() {
    var F = C.frasco;
    $('frascoTitulo').textContent = F.titulo;
    $('frascoSub').textContent = F.sub;
    var CHAVE = 'surpresa-bilhetes';
    var lidos = ler(CHAVE, []);
    var papeis = $('frascoPapeis');
    var cores = ['#f3e9df', '#ffe1c7', '#f6d0d8', '#e9dcc8'];
    function desenharPapeis() {
      papeis.textContent = '';
      var restam = F.bilhetes.length - lidos.length;
      for (var i = 0; i < restam; i++) {
        papeis.appendChild(svgEl('rect', { x: 26 + (i % 4) * 17 + Math.random() * 4, y: 120 - Math.floor(i / 4) * 16 - Math.random() * 6, width: 16, height: 10, rx: 2, fill: cores[i % 4], transform: 'rotate(' + ((Math.random() - 0.5) * 50).toFixed(1) + ')', class: 'frasco__papel' }));
      }
    }
    desenharPapeis();
    var bilhete = $('bilhete');
    $('frascoBotao').addEventListener('click', function () {
      var porLer = F.bilhetes.map(function (_, i) { return i; }).filter(function (i) { return lidos.indexOf(i) === -1; });
      bilhete.textContent = '';
      if (!parado) gsap.fromTo('#frascoBotao', { rotate: -6 }, { rotate: 0, duration: 0.8, ease: 'elastic.out(1.2, 0.3)' });
      if (porLer.length === 0) { bilhete.appendChild(el('p', 'bilhete__vazio', F.vazio)); return; }
      var i = porLer[Math.floor(Math.random() * porLer.length)];
      lidos.push(i); guardar(CHAVE, lidos);
      desenharPapeis();
      var cartao = el('div', 'bilhete__papel');
      cartao.appendChild(el('p', 'bilhete__texto', F.bilhetes[i]));
      cartao.appendChild(el('p', 'bilhete__conta', (F.bilhetes.length - porLer.length + 1) + ' de ' + F.bilhetes.length));
      bilhete.appendChild(cartao);
      vibrar(12);
      if (!parado) {
        gsap.fromTo(cartao, { y: -120, scale: 0.3, rotate: -20, opacity: 0 }, { y: 0, scale: 1, rotate: (Math.random() - 0.5) * 6, opacity: 1, duration: 0.9, ease: 'back.out(1.7)' });
        gsap.fromTo(cartao.querySelector('.bilhete__texto'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, delay: 0.4, ease: 'power2.out' });
      }
    });
  }

  // ---------- a lanterna: o dedo (ou o rato) é a luz ----------
  function montarLanterna() {
    var L = C.lanterna;
    $('lanternaTitulo').textContent = L.titulo;
    $('lanternaSub').textContent = L.sub;
    var caixa = $('lanternaCaixa');
    var texto = $('lanternaTexto');
    texto.textContent = L.texto;
    if (parado) { caixa.classList.add('lanterna--acesa'); return; }
    var luz = { r: 0 };
    var vistos = {}; var acesa = false;
    function mover(e) {
      var r = caixa.getBoundingClientRect();
      var x = e.clientX - r.left; var y = e.clientY - r.top;
      caixa.style.setProperty('--x', x + 'px'); caixa.style.setProperty('--y', y + 'px');
      if (luz.r < 1) gsap.to(luz, { r: 1, duration: 0.5, onUpdate: function () { caixa.style.setProperty('--r', (luz.r * 95) + 'px'); } });
      vistos[Math.floor(x / (r.width / 6)) + '-' + Math.floor(y / (r.height / 4))] = true;
      if (!acesa && Object.keys(vistos).length >= 13) {
        acesa = true;
        caixa.classList.add('lanterna--acesa');
        var c = centroDe(caixa); ctx.coracoes(c.x, c.y, 16, true); ctx.pulso(1.2);
      }
    }
    caixa.addEventListener('pointermove', mover);
    caixa.addEventListener('pointerdown', function (e) { caixa.setPointerCapture(e.pointerId); mover(e); });
  }

  // ---------- desenhar um coração por cima do tracejado ----------
  function montarDesenhar() {
    var D = C.desenhar;
    $('desenharTitulo').textContent = D.titulo;
    $('desenharSub').textContent = D.sub;
    var caminho = $('desenhoCaminho');
    var tela = $('desenhoTela');
    var c = tela.getContext('2d');
    var total = caminho.getTotalLength();
    var N = 48; var amostras = [];
    for (var i = 0; i < N; i++) amostras.push(caminho.getPointAtLength((i / N) * total));
    var tocados = {}; var feito = false; var ativo = false; var ux = 0; var uy = 0;
    function preparar() {
      var d = Math.min(window.devicePixelRatio || 1, 2);
      tela.width = tela.clientWidth * d; tela.height = tela.clientHeight * d;
      c.setTransform(d, 0, 0, d, 0, 0);
      c.strokeStyle = '#e0566e'; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round';
      c.shadowColor = 'rgba(224,86,110,.7)'; c.shadowBlur = 8;
    }
    preparar();
    window.addEventListener('resize', function () { if (!feito) preparar(); });
    function ponto(e) { var r = tela.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; }
    function marcar(p) {
      var sx = p.w / 200; var sy = p.h / 180;
      amostras.forEach(function (a, k) { if (Math.hypot(a.x * sx - p.x, a.y * sy - p.y) < 22) tocados[k] = true; });
      if (!feito && Object.keys(tocados).length >= N * 0.86) completo();
    }
    function completo() {
      feito = true;
      $('desenhoCaixa').classList.add('desenho--feito');
      $('desenharMsg').textContent = D.feito;
      var ct = centroDe(tela); ctx.coracoes(ct.x, ct.y, 26, true); ctx.pulso(1.5); confetti(40); vibrar([30, 50, 30]);
      if (!parado) {
        gsap.to(tela, { opacity: 0, duration: 0.8 });
        gsap.fromTo('#desenhoCaminho', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut' });
        gsap.fromTo('.desenho__guia', { scale: 0.9 }, { scale: 1, duration: 1.4, ease: 'elastic.out(1, 0.4)', transformOrigin: '50% 50%' });
      }
    }
    tela.addEventListener('pointerdown', function (e) { if (feito) return; ativo = true; var p = ponto(e); ux = p.x; uy = p.y; tela.setPointerCapture(e.pointerId); marcar(p); });
    tela.addEventListener('pointermove', function (e) {
      if (!ativo || feito) return;
      var p = ponto(e);
      c.beginPath(); c.moveTo(ux, uy); c.lineTo(p.x, p.y); c.stroke();
      ux = p.x; uy = p.y;
      marcar(p);
    });
    ['pointerup', 'pointercancel'].forEach(function (n) { tela.addEventListener(n, function () { ativo = false; }); });
  }

  // ---------- pétalas a cair enquanto ela lê a carta ----------
  function montarPetalas() {
    var caixa = el('div', 'petalas');
    caixa.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 14; i++) {
      var p = el('i', 'petala');
      p.style.left = (Math.random() * 100) + '%';
      p.style.animationDelay = (-Math.random() * 14).toFixed(2) + 's';
      p.style.animationDuration = (10 + Math.random() * 8).toFixed(2) + 's';
      p.style.setProperty('--s', (0.6 + Math.random() * 0.8).toFixed(2));
      caixa.appendChild(p);
    }
    document.body.appendChild(caixa);
  }

  // ---------- pó dourado na cortina, aspas nas frases dos filmes, sublinhado no interlúdio ----------
  function montarEnfeites() {
    var cortina = $('cortina');
    if (cortina) {
      var po = el('div', 'po-dourado');
      po.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 18; i++) {
        var g = el('i');
        g.style.left = (Math.random() * 100) + '%';
        g.style.animationDelay = (-Math.random() * 9).toFixed(2) + 's';
        g.style.animationDuration = (6 + Math.random() * 6).toFixed(2) + 's';
        po.appendChild(g);
      }
      cortina.insertBefore(po, cortina.firstChild);
    }
    document.querySelectorAll('.frase').forEach(function (f) { f.insertBefore(el('span', 'frase__aspas', '“'), f.firstChild); });
    var ultima = document.querySelector('#interludioTexto p:last-child');
    if (ultima) ultima.classList.add('sublinha-ouro');
  }

  // ---------- as ajudas: índice, capítulo atual, dica, modo calmo, ecrã inteiro, carta, teclado, orientação ----------
  var capitulos = [];
  function alvoDe(e) { var p = e.closest('.pin-spacer') || e; return p.getBoundingClientRect().top + window.scrollY; }
  function capituloAtual() {
    var y = window.scrollY + window.innerHeight * 0.5; var atual = 0;
    capitulos.forEach(function (c, i) { if (alvoDe(c.el) <= y) atual = i; });
    return atual;
  }
  function irParaCapitulo(i) {
    var c = capitulos[Math.max(0, Math.min(capitulos.length - 1, i))];
    if (c) ctx.ir(alvoDe(c.el) + (c.el.classList.contains('cena--capitulo') ? window.innerHeight * 0.55 : 0));
  }

  function montarAjudas() {
    var U = C.ui || {};
    capitulos.push({ nome: 'Início', el: $('cenaTitulo') });
    document.querySelectorAll('.cena--capitulo').forEach(function (sec) {
      var num = sec.querySelector('.cap-num').textContent.replace('Capítulo ', '');
      capitulos.push({ nome: sec.querySelector('.cap-titulo').getAttribute('aria-label'), num: num, el: sec });
    });
    capitulos.push({ nome: 'O fim', el: $('cenaFinal') });

    var botao = $('menuBotao'); var painel = $('menuPainel');
    botao.hidden = false;
    botao.setAttribute('aria-label', U.menu || 'Capítulos');
    $('menuTitulo').textContent = U.menu || 'Capítulos';
    $('menuAnterior').textContent = '‹ ' + (U.anterior || 'Anterior');
    $('menuSeguinte').textContent = (U.seguinte || 'Seguinte') + ' ›';
    $('opCalmo').textContent = U.calmo || 'Modo calmo';
    $('opCalmo').title = U.calmoAjuda || '';
    $('opEcra').textContent = U.ecra || 'Ecrã inteiro';
    $('opCarta').textContent = U.guardarCarta || 'Guardar a carta';
    $('opTopo').textContent = U.recomecar || 'Voltar ao início';
    $('dicaDeslizar').textContent = (U.dica || 'continua a deslizar') + ' ↓';
    $('avisoOrientacao').querySelector('p').textContent = U.orientacao || '';
    capitulos.forEach(function (c, i) {
      var li = el('li');
      var b = el('button', 'menu-item');
      b.type = 'button';
      if (c.num) b.appendChild(el('span', 'menu-item__num', c.num));
      b.appendChild(el('span', 'menu-item__nome', c.nome));
      b.addEventListener('click', function () { fechar(); irParaCapitulo(i); });
      li.appendChild(b);
      $('menuLista').appendChild(li);
    });

    var aberto = false;
    function abrir() {
      aberto = true; painel.hidden = false; botao.setAttribute('aria-expanded', 'true'); botao.classList.add('menu-botao--aberto');
      var atual = capituloAtual();
      document.querySelectorAll('.menu-item').forEach(function (b, i) { b.classList.toggle('menu-item--atual', i === atual); });
      if (!parado) {
        gsap.fromTo(painel, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' });
        gsap.fromTo('.menu-item', { opacity: 0, x: 24 }, { opacity: 1, x: 0, stagger: 0.04, duration: 0.4, delay: 0.1, ease: 'power2.out' });
      }
    }
    function fechar() {
      if (!aberto) return;
      aberto = false; botao.setAttribute('aria-expanded', 'false'); botao.classList.remove('menu-botao--aberto');
      if (parado) { painel.hidden = true; return; }
      gsap.to(painel, { opacity: 0, x: 40, duration: 0.3, onComplete: function () { painel.hidden = true; } });
    }
    botao.addEventListener('click', function () { if (aberto) fechar(); else abrir(); });
    document.addEventListener('pointerdown', function (e) { if (aberto && !painel.contains(e.target) && !botao.contains(e.target)) fechar(); });
    $('menuAnterior').addEventListener('click', function () { fechar(); irParaCapitulo(capituloAtual() - 1); });
    $('menuSeguinte').addEventListener('click', function () { fechar(); irParaCapitulo(capituloAtual() + 1); });
    $('opTopo').addEventListener('click', function () { fechar(); ctx.ir(0); });

    // o céu que se inclina (iphone.js): no iphone a autorização só se pode pedir depois de um toque,
    // por isso há um botão no título e uma opção no menu. no android liga-se sozinho
    var I = window.INCLINACAO;
    var chip = $('chipInclinar'); var opInc = $('opInclinar');
    function marcarInclinar() { opInc.setAttribute('aria-pressed', I && I.ativo ? 'true' : 'false'); }
    ligarInclinar = function () {
      return I.pedir().then(function (ok) {
        if (!ok) { guardar(CHAVE_INC, false); return false; }
        // há telemóveis sem giroscópio: se não chegar nada, desliga-se outra vez
        return I.funciona(900).then(function (anda) {
          if (!anda) I.desligar();
          marcarInclinar(); guardar(CHAVE_INC, anda);
          return anda;
        });
      });
    };
    if (I && I.disponivel && !parado) {
      opInc.hidden = false;
      opInc.textContent = U.inclinarMenu || 'Céu que se inclina';
      marcarInclinar();
      opInc.addEventListener('click', function () {
        if (I.ativo) { I.desligar(); guardar(CHAVE_INC, false); marcarInclinar(); return; }
        ligarInclinar().then(function (ok) { if (ok) ctx.pulso(1); });
      });
      chip.textContent = U.inclinar || 'Inclina o telemóvel';
      chip.addEventListener('click', function () {
        chip.disabled = true;
        ligarInclinar().then(function (ok) {
          chip.classList.add('chip-inclinar--feito');
          chip.textContent = ok ? (U.inclinarFeito || 'Agora o céu segue-te') : (U.inclinarNao || 'Este telemóvel não deixou');
          if (ok) { ctx.pulso(1.2); ctx.coracoes(window.innerWidth / 2, window.innerHeight * 0.62, 10, true); }
          gsap.to(chip, { opacity: 0, y: -10, duration: 0.7, delay: 2.2, onComplete: function () { chip.hidden = true; } });
        });
      });
    }

    // modo calmo: menos efeitos (grão, cometas, rastos, partículas), lembrado neste telemóvel
    function aplicarCalmo(sim) {
      document.body.classList.toggle('calmo', sim);
      $('opCalmo').setAttribute('aria-pressed', sim ? 'true' : 'false');
      if (window.CINEMA) window.CINEMA.calmo = sim;
      guardar(CHAVE_CALMO, sim);
    }
    aplicarCalmo(!!ler(CHAVE_CALMO, false));
    $('opCalmo').addEventListener('click', function () { aplicarCalmo(!calmo()); });

    // ecrã inteiro (no iphone o safari não deixa: o botão desaparece)
    var raiz = document.documentElement;
    var podeEcra = !!(raiz.requestFullscreen || raiz.webkitRequestFullscreen);
    if (!podeEcra) $('opEcra').hidden = true;
    function alternarEcra() {
      if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      var r = (raiz.requestFullscreen || raiz.webkitRequestFullscreen).call(raiz);
      if (r && r.catch) r.catch(function () {});
    }
    $('opEcra').addEventListener('click', function () { fechar(); alternarEcra(); });

    // guardar a carta: abre a janela de imprimir só com a carta (dá para guardar em pdf)
    $('opCarta').addEventListener('click', function () {
      fechar();
      document.body.classList.add('imprimir-carta');
      setTimeout(function () { window.print(); }, 50);
    });
    window.addEventListener('afterprint', function () { document.body.classList.remove('imprimir-carta'); });

    // atalhos de teclado: m menu, n seguinte, p anterior, c modo calmo, f ecrã inteiro, esc fecha
    document.addEventListener('keydown', function (e) {
      if (document.body.classList.contains('bloqueado') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      var k = e.key.toLowerCase();
      if (k === 'm') { if (aberto) fechar(); else abrir(); } else if (k === 'escape') fechar();
      else if (k === 'n') irParaCapitulo(capituloAtual() + 1);
      else if (k === 'p') irParaCapitulo(capituloAtual() - 1);
      else if (k === 'c') aplicarCalmo(!calmo());
      else if (k === 'f' && podeEcra) alternarEcra();
    });

    // capítulo atual, posição guardada e a dica para continuar a deslizar
    var pill = $('capituloAtual'); var dica = $('dicaDeslizar');
    var ultimo = -1; var tempoDica = null; var ultimoGuardar = 0;
    function verDica() {
      clearTimeout(tempoDica);
      dica.classList.remove('dica-deslizar--ver');
      tempoDica = setTimeout(function () {
        var fundo = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 40;
        if (!document.body.classList.contains('bloqueado') && !aberto && !fundo) dica.classList.add('dica-deslizar--ver');
      }, 8000);
    }
    function aoRolar() {
      if (document.body.classList.contains('bloqueado')) return;
      var i = capituloAtual();
      if (i !== ultimo) {
        ultimo = i;
        var c = capitulos[i];
        pill.hidden = i === 0;
        pill.textContent = c.num ? c.num + ' · ' + c.nome : c.nome;
        if (!parado && i !== 0) gsap.fromTo(pill, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      }
      var agora = Date.now();
      if (agora - ultimoGuardar > 1000) { ultimoGuardar = agora; guardar(CHAVE_POS, Math.round(window.scrollY)); }
      verDica();
    }
    window.addEventListener('scroll', aoRolar, { passive: true });
    verDica();
  }

  // ---------- montar tudo ----------
  function montar(c) {
    ctx = c; parado = c.parado;
    montarBaloes();
    montarPuzzle();
    montarMapa();
    montarRoda();
    montarFrasco();
    montarLanterna();
    montarDesenhar();
    montarPetalas();
    montarEnfeites();
    montarAjudas();
  }

  // ---------- animações (depois das cenas fixas) ----------
  function animar() {
    if (parado) return;

    // as cenas novas entram e saem com o scroll, como as outras
    gsap.utils.toArray('.baloes, .puzzle, .mapa, .roda-caixa, .frasco, .lanterna, .desenho').forEach(function (b) {
      gsap.fromTo(b, { opacity: 0, y: 80, rotateX: -18, scale: 0.94, transformPerspective: 900 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top bottom', end: 'top 70%', scrub: 0.7 } });
      gsap.to(b, { opacity: 0, y: -50, scale: 0.95, ease: 'power1.in', immediateRender: false, scrollTrigger: { trigger: b, start: 'top 2%', end: 'bottom -5%', scrub: 0.7 } });
    });

    // o mapa: a rota desenha-se e um avião percorre-a, os pinos caem do céu
    gsap.timeline({ scrollTrigger: { trigger: '#mapaCaixa', start: 'top 75%', toggleActions: 'play none none reverse' } })
      .fromTo('.mapa__costa', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, ease: 'power2.inOut' })
      .fromTo('#mapaRota', { drawSVG: '0%' }, { drawSVG: '100%', duration: 2, ease: 'power1.inOut' }, 0.6)
      .fromTo('#mapaAviao', { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.6)
      .to('#mapaAviao', { duration: 2, ease: 'power1.inOut', motionPath: { path: '#mapaRota', align: '#mapaRota', alignOrigin: [0.5, 0.5], autoRotate: true } }, 0.6)
      .fromTo('.pino', { y: -60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.25, duration: 0.7, ease: 'bounce.out' }, 0.8);

    // a roda entra a girar devagar; as raspadinhas abanam ao chegar
    gsap.fromTo('#rodaGira', { rotation: -120, svgOrigin: '0 0' }, { rotation: 0, svgOrigin: '0 0', duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: '#roda', start: 'top 70%', toggleActions: 'play none none none' } });
    gsap.fromTo('.vale', { rotate: function (i) { return i % 2 ? 6 : -6; } }, { rotate: 0, duration: 1.2, stagger: 0.08, ease: 'elastic.out(1, 0.3)', scrollTrigger: { trigger: '#listaVales', start: 'top 80%' } });

    // contagem das estrelas: quando o número chega ao fim, caem estrelas
    var chuva = false;
    ScrollTrigger.create({ trigger: '#contagem', start: 'top top', end: '+=240%', onUpdate: function (s) { if (!chuva && s.progress > 0.62) { chuva = true; estrelasCadentes(9); } } });

    // o interlúdio sublinha-se a ouro no fim; o ecrã brilha com o coração do final
    ScrollTrigger.create({ trigger: '#cenaInterludio', start: 'top top', end: '+=160%', onUpdate: function (s) { document.body.classList.toggle('interludio-aceso', s.progress > 0.55); } });
    ScrollTrigger.create({ trigger: '#cenaFinal', start: 'top top', end: '+=260%', onToggle: function (s) { document.body.classList.toggle('final-aceso', s.isActive); } });
    // as pétalas só caem enquanto ela está na carta
    ScrollTrigger.create({ trigger: '#carta', start: 'top 60%', end: 'bottom 40%', toggleClass: { targets: '.petalas', className: 'petalas--ver' } });

    // tocar no coração do fim dá-lhe um soco de luz
    ['#cenaFinal', '#cenaCreditos'].forEach(function (s) { $(s.slice(1)).addEventListener('pointerdown', function () { ctx.pulso(1.3); }); });

    // em toda a página: um anel onde se toca, e um rasto de pó dourado ao arrastar o dedo
    var ultimoRasto = 0;
    document.addEventListener('pointerdown', function (e) {
      if (calmo() || document.body.classList.contains('bloqueado')) return;
      var o = el('i', 'onda');
      document.body.appendChild(o);
      gsap.set(o, { x: e.clientX, y: e.clientY });
      gsap.fromTo(o, { scale: 0, opacity: 0.8 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: function () { o.remove(); } });
    }, { passive: true });
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'touch' || calmo()) return;
      var agora = Date.now();
      if (agora - ultimoRasto < 45) return;
      ultimoRasto = agora;
      var p = el('i', 'po');
      document.body.appendChild(p);
      gsap.set(p, { x: e.clientX, y: e.clientY, opacity: 1, scale: 0.6 + Math.random() });
      gsap.to(p, { y: e.clientY - 30 - Math.random() * 30, x: e.clientX + (Math.random() - 0.5) * 30, opacity: 0, duration: 0.9, ease: 'power1.out', onComplete: function () { p.remove(); } });
    }, { passive: true });

    // com rato: os cartões inclinam-se para o cursor
    if (window.matchMedia('(pointer: fine)').matches) {
      var alvos = '.quiz-cartao, .diploma, .vale, .mapa, .bilhete__papel, .postal, .frasco, .puzzle';
      document.addEventListener('pointermove', function (e) {
        var t = e.target.closest && e.target.closest(alvos);
        if (!t || calmo()) return;
        var r = t.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5; var py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(t, { rotateY: px * 8, rotateX: -py * 8, transformPerspective: 1000, duration: 0.5, overwrite: 'auto' });
      }, { passive: true });
      document.addEventListener('pointerout', function (e) {
        var t = e.target.closest && e.target.closest(alvos);
        if (t && !t.contains(e.relatedTarget)) gsap.to(t, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' });
      });
    }
  }

  window.MAIS = {
    montar: montar,
    animar: animar,
    luzDeCapitulo: luzDeCapitulo,
    confetti: confetti,
    posicaoGuardada: function () { return Number(ler(CHAVE_POS, 0)) || 0; },
    // no toque de começar: se da outra vez ela ligou o céu que se inclina, volta a ligar (é um toque, o iphone deixa)
    aoComecar: function () {
      var I = window.INCLINACAO;
      if (ligarInclinar && I && I.disponivel && !I.ativo && !parado && ler(CHAVE_INC, false)) ligarInclinar();
    },
    // depois da abertura: mostra o botão "inclina o telemóvel" no título (só onde é preciso pedir)
    mostrarInclinar: function () {
      var I = window.INCLINACAO; var chip = $('chipInclinar');
      if (!I || !I.disponivel || !I.precisaPedir || I.ativo || parado || !chip || !chip.textContent) return;
      chip.hidden = false;
      gsap.fromTo(chip, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, delay: 3.6, ease: 'power2.out' });
    },
  };
})();
