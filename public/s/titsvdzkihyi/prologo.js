// o prólogo, antes do filme: a carta que eu tentei escrever. as tentativas ficam riscadas com notas na margem,
// a folha dobra-se num avião de papel que voa pelo ecrã, e a frase grande forma-se letra a letra no meio do céu.
// usa gsap (motionpath, drawsvg, scrambletext, physics2d) e anime.js. com "reduzir movimento" fica tudo parado e legível
/* global gsap */
(function () {
  window.PROLOGO = function (o) {
    var C = window.CONTEUDO.prologo;
    var $ = function (id) { return document.getElementById(id); };
    function el(tag, classe, texto) {
      var e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto != null) e.textContent = texto;
      return e;
    }
    var caixa = $('prologo');
    var folha = $('folha');
    var texto = $('folhaTexto');
    var caneta = $('caneta');
    var palco = $('prologoPalco');
    var cinema = window.CINEMA || {};
    var feito = false;
    var tl;
    var tAcender = null; // só as animações do céu feitas aqui (as da contagem das estrelas não se tocam)
    var ondular = null;

    // parte uma frase em palavras (que não partem a meio) e letras, para a escrever letra a letra
    function partir(p, frase) {
      var letras = [];
      frase.split(' ').forEach(function (w, i, todas) {
        var pal = el('span', 'palavra');
        w.split('').forEach(function (ch) { var s = el('span', 'ch', ch); pal.appendChild(s); letras.push(s); });
        p.appendChild(pal);
        if (i < todas.length - 1) p.appendChild(document.createTextNode(' '));
      });
      p.setAttribute('aria-label', frase);
      return letras;
    }

    // ---------- montar a folha ----------
    texto.textContent = '';
    palco.textContent = '';
    $('prologoAntes').textContent = C.antes;
    var linhas = [];
    function linha(frase, classe) {
      var p = el('p', 'escrita' + (classe ? ' ' + classe : ''));
      texto.appendChild(p);
      var l = { p: p, letras: partir(p, frase) };
      linhas.push(l);
      return l;
    }
    var saud = linha(C.saudacao, 'escrita--saudacao');
    var pedido = linha(C.pedido, 'escrita--pedido');
    var tentativas = C.tentativas.map(function (t) { return { linha: linha(t.texto, 'escrita--tentativa'), nota: linha('\u2190 ' + t.nota, 'nota') }; });
    var depois = C.depois.map(function (f) { return linha(f); });

    // a frase grande e o "porquê", no palco do meio
    var grandes = C.grande.map(function (f, i) {
      var p = el('p', 'pg' + (i === C.grande.length - 1 ? ' pg--especial' : ''));
      var letras = partir(p, f);
      palco.appendChild(p);
      return { p: p, letras: letras };
    });
    var porques = C.porque.map(function (f, i) {
      var p = el('p', 'pq' + (i === C.porque.length - 1 ? ' pq--filme' : ''));
      var letras = partir(p, f);
      palco.appendChild(p);
      return { p: p, letras: letras };
    });

    caixa.hidden = false;

    function acabar() {
      if (feito) return;
      feito = true;
      if (tl) tl.kill();
      if (tAcender) tAcender.kill();
      if (ondular) ondular.pause();
      if (o.parado) { caixa.hidden = true; cinema.acender = 1; o.depois(); return; }
      gsap.to(cinema, { acender: 1, duration: 1.2 });
      gsap.to(caixa, { opacity: 0, duration: 0.8, onComplete: function () { caixa.hidden = true; } });
      o.depois();
    }
    $('prologoPassar').addEventListener('click', acabar);

    // sem animações: tudo à vista, riscado com css, e um botão para seguir
    if (o.parado) {
      caixa.classList.add('prologo--parado');
      $('prologoPassar').textContent = 'Continuar ›';
      return;
    }

    // ---------- escrever à mão ----------
    var W = window.innerWidth; var H = window.innerHeight;
    function moverCaneta(s) {
      gsap.set(caneta, { x: s.offsetLeft + s.offsetWidth, y: s.offsetTop + s.offsetHeight - 22, opacity: 1 });
    }
    // escreve uma linha a partir do instante t, com o ritmo irregular de uma mão; devolve o instante em que acaba
    function escrever(l, t, ritmo) {
      l.letras.forEach(function (s, i) {
        tl.set(s, { opacity: 1 }, t);
        if (i % 2 === 0) tl.call(moverCaneta, [s], t);
        var ch = s.textContent;
        t += ritmo * (0.55 + Math.random() * 0.9);
        if (ch === ',' ) t += 0.22;
        if (ch === '.') t += 0.3;
      });
      return t;
    }

    // risca uma linha: um traço ondulado por cada linha visual, desenhado da esquerda para a direita
    var svgRisco = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgRisco.setAttribute('class', 'riscos');
    folha.appendChild(svgRisco);
    function riscar(l) {
      svgRisco.setAttribute('viewBox', '0 0 ' + folha.clientWidth + ' ' + folha.clientHeight);
      var porLinha = {};
      l.letras.forEach(function (s) { var k = s.offsetTop; (porLinha[k] = porLinha[k] || []).push(s); });
      Object.keys(porLinha).forEach(function (k, i) {
        var v = porLinha[k];
        var x1 = v[0].offsetLeft - 4; var x2 = v[v.length - 1].offsetLeft + v[v.length - 1].offsetWidth + 4;
        var y = Number(k) + v[0].offsetHeight * 0.56;
        var d = 'M' + x1 + ' ' + (y + 2);
        var passo = 26; var sobe = true;
        for (var x = x1 + passo; x < x2; x += passo) { d += ' Q ' + (x - passo / 2) + ' ' + (y + (sobe ? -4 : 4)) + ' ' + x + ' ' + y; sobe = !sobe; }
        d += ' L ' + x2 + ' ' + (y - 1);
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        svgRisco.appendChild(path);
        gsap.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.42, delay: i * 0.3, ease: 'power1.inOut' });
      });
      gsap.to(l.p, { opacity: 0.42, duration: 0.6, delay: 0.3 });
      if (navigator.vibrate) { try { navigator.vibrate(12); } catch { /* sem vibração */ } }
    }

    // ---------- o avião de papel ----------
    function voar() {
      W = window.innerWidth; H = window.innerHeight;
      var svg = $('voo');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var r = folha.getBoundingClientRect();
      var x0 = r.left + r.width / 2; var y0 = r.top + r.height / 2;
      // uma volta pelo ecrã, com um laço, e sai por cima à direita
      var d = 'M' + x0 + ' ' + y0 +
        ' C ' + (W * 0.95) + ' ' + (H * 0.85) + ', ' + (W * 1.0) + ' ' + (H * 0.2) + ', ' + (W * 0.6) + ' ' + (H * 0.22) +
        ' S ' + (W * 0.12) + ' ' + (H * 0.55) + ', ' + (W * 0.3) + ' ' + (H * 0.72) +
        ' S ' + (W * 0.62) + ' ' + (H * 0.55) + ', ' + (W * 0.5) + ' ' + (H * 0.36) +
        ' S ' + (W * 0.8) + ' ' + (H * -0.05) + ', ' + (W * 1.25) + ' ' + (H * -0.2);
      var rasto = $('vooRasto');
      rasto.setAttribute('d', d);
      var aviao = $('aviao');
      gsap.set(aviao, { opacity: 1, scale: W < 700 ? 1 : 1.4 });
      var dur = 4.2;
      gsap.to(aviao, { duration: dur, ease: 'power1.inOut', motionPath: { path: rasto, align: rasto, alignOrigin: [0.5, 0.5], autoRotate: true } });
      gsap.timeline()
        .fromTo(rasto, { drawSVG: '0% 0%', opacity: 1 }, { drawSVG: '55% 100%', duration: dur, ease: 'power1.inOut' })
        .to(rasto, { drawSVG: '100% 100%', duration: 0.8, ease: 'power1.in' });
    }

    // brilhos que saltam e caem com gravidade (physics2d)
    function brilhos(x, y, n) {
      for (var i = 0; i < n; i++) {
        var b = el('i', 'brilho');
        document.body.appendChild(b);
        var tam = 2 + Math.random() * 4;
        gsap.set(b, { x: x, y: y, width: tam, height: tam, opacity: 1 });
        gsap.to(b, {
          duration: 1.6 + Math.random() * 1.4,
          physics2D: { velocity: 180 + Math.random() * 420, angle: -20 - Math.random() * 140, gravity: 380 },
          opacity: 0, ease: 'none',
          onComplete: function () { this.targets()[0].remove(); },
        });
      }
    }

    // ---------- a linha do tempo ----------
    tl = gsap.timeline({ onComplete: acabar });
    gsap.set(caixa, { opacity: 1 });
    gsap.set('.prologo .ch', { opacity: 0 });
    gsap.set(caneta, { opacity: 0 });
    tAcender = gsap.to(cinema, { acender: 0.18, duration: 2 });

    tl.fromTo('#prologoAntes', { opacity: 0, letterSpacing: '0.9em', filter: 'blur(10px)' }, { opacity: 1, letterSpacing: '0.45em', filter: 'blur(0px)', duration: 1.2, ease: 'power2.out' }, 0.2);
    tl.to('#prologoAntes', { opacity: 0, y: -12, duration: 0.7 }, 1.9);
    tl.fromTo(folha, { opacity: 0, y: 140, rotateX: 38, rotate: -6, scale: 0.92 }, { opacity: 1, y: 0, rotateX: 0, rotate: -1.4, scale: 1, duration: 1.5, ease: 'power3.out' }, 2.1);

    var t = 3.6;
    t = escrever(saud, t, 0.09) + 0.5;
    t = escrever(pedido, t, 0.06) + 1.1;
    tentativas.forEach(function (tt) {
      t = escrever(tt.linha, t, 0.042) + 0.35;
      tl.call(riscar, [tt.linha], t);
      t += 0.75;
      t = escrever(tt.nota, t, 0.035) + 0.9;
    });
    depois.forEach(function (l) { t = escrever(l, t, 0.055) + 0.6; });
    t += 0.6;

    // só a linha verdadeira fica acesa
    tl.to(caneta, { opacity: 0, duration: 0.3 }, t);
    tl.to(linhas.filter(function (l) { return l !== pedido; }).map(function (l) { return l.p; }), { opacity: 0.12, duration: 0.9 }, t);
    tl.to(pedido.p, { color: '#d8b45f', scale: 1.06, transformOrigin: 'left center', textShadow: '0 0 18px rgba(216,180,95,.6)', duration: 0.9 }, t);
    t += 1.9;

    // a folha dobra-se e vira avião
    tl.to(folha, { rotateX: 80, scaleY: 0.15, scaleX: 0.4, rotate: -24, opacity: 0, duration: 0.85, ease: 'power2.in' }, t);
    tl.call(voar, null, t + 0.6);
    t += 1.9;

    // a frase grande: as primeiras linhas sobem de dentro de uma névoa, a última forma-se de letras espalhadas pelo ecrã
    grandes.forEach(function (g, i) {
      var ultima = i === grandes.length - 1;
      tl.set(g.p, { opacity: 1 }, t);
      if (!ultima) {
        tl.fromTo(g.letras, { opacity: 0, y: 26, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.025, ease: 'power2.out' }, t);
        t += 1.5;
      } else {
        tl.fromTo(g.letras, {
          opacity: 0,
          x: function () { return (Math.random() - 0.5) * W * 1.2; },
          y: function () { return (Math.random() - 0.5) * H * 1.1; },
          rotate: function () { return (Math.random() - 0.5) * 300; },
          scale: function () { return 0.2 + Math.random() * 2.4; },
          filter: 'blur(12px)',
        }, { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: 'blur(0px)', duration: 2.1, stagger: { each: 0.05, from: 'random' }, ease: 'expo.out' }, t);
        tl.call(function () {
          tAcender = gsap.to(cinema, { acender: 1, duration: 2.6, ease: 'power2.out' });
          if (o.pulso) o.pulso(2.2);
          var r = g.p.getBoundingClientRect();
          brilhos(r.left + r.width / 2, r.top + r.height / 2, W < 700 ? 34 : 60);
          // depois de formada, a palavra fica a ondular devagar
          if (window.anime) ondular = window.anime({ targets: g.letras, translateY: [0, -6, 0], duration: 2200, delay: window.anime.stagger(70), easing: 'easeInOutSine', loop: true });
        }, null, t + 1.6);
        t += 4.6;
      }
    });

    // saída: as primeiras linhas desfazem-se em símbolos, a última explode em pedaços
    grandes.forEach(function (g, i) {
      if (i < grandes.length - 1) {
        tl.to(g.p, { duration: 1, scrambleText: { text: ' ', chars: '♥✦·*', speed: 0.6 }, ease: 'none' }, t);
        tl.to(g.p, { opacity: 0, duration: 0.4 }, t + 0.8);
      } else {
        tl.to(g.letras, {
          x: function () { return (Math.random() - 0.5) * W; },
          y: function () { return -H * (0.3 + Math.random() * 0.6); },
          rotate: function () { return (Math.random() - 0.5) * 200; },
          opacity: 0, filter: 'blur(8px)', duration: 1.4, stagger: { each: 0.02, from: 'center' }, ease: 'power2.in',
        }, t + 0.3);
      }
    });
    t += 2;

    // o porquê: uma frase de cada vez, a entrar por uma máscara e a sair desfocada
    porques.forEach(function (q, i) {
      var ultima = i === porques.length - 1;
      tl.set(q.p, { opacity: 1 }, t);
      tl.fromTo(q.letras, { opacity: 0, yPercent: 90, rotateX: -80 }, { opacity: 1, yPercent: 0, rotateX: 0, duration: 0.8, stagger: 0.018, ease: 'back.out(1.6)' }, t);
      t += 0.8 + q.letras.length * 0.018 + (ultima ? 1.4 : 1.6);
      if (ultima) {
        // a tremer como película antiga, e depois apaga-se como num cinema
        tl.to(q.p, { keyframes: [{ opacity: 0.25, duration: 0.06 }, { opacity: 1, duration: 0.08 }, { opacity: 0.5, duration: 0.05 }, { opacity: 1, duration: 0.1 }], ease: 'none' }, t - 1.2);
        tl.to(q.p, { opacity: 0, scale: 1.4, filter: 'blur(14px)', duration: 1, ease: 'power2.in' }, t);
        t += 1;
      } else {
        tl.to(q.p, { opacity: 0, y: -30, filter: 'blur(10px)', duration: 0.6, ease: 'power2.in' }, t);
        t += 0.6;
      }
    });
    tl.to({}, { duration: 0.2 }, t);
  };
})();
