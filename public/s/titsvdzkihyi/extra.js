// as partes novas do filme: frases minhas, os jogos (quiz, constelação, raspadinhas), o nosso código com assinatura,
// o abraço à distância e a contagem das estrelas. app.js chama montar() ao construir a página e as animações pela ordem
// em que as cenas aparecem (o gsap precisa disso para as cenas fixas). também traz os efeitos globais de scroll:
// letras que se formam e se desfazem, blocos que entram e saem, e títulos que inclinam com a velocidade
/* global gsap, ScrollTrigger, SplitText */
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
  function guardado(chave) { try { return JSON.parse(localStorage.getItem(chave)) || []; } catch { return []; } }
  function guardar(chave, v) { try { localStorage.setItem(chave, JSON.stringify(v)); } catch { /* sem armazenamento */ } }
  function espalhado(W, H) {
    return {
      opacity: 0,
      x: function () { return (Math.random() - 0.5) * W; },
      y: function () { return (Math.random() - 0.5) * H; },
      rotate: function () { return (Math.random() - 0.5) * 220; },
      scale: function () { return 0.3 + Math.random() * 1.8; },
    };
  }

  var ctx; // { parado, coracoes, pulso }
  var parado = false;

  // ---------- frases minhas ----------
  function montarMinhas() {
    $('minhasTitulo').textContent = C.minhasTitulo.join(' ');
    C.minhas.forEach(function (m) {
      var d = el('div', 'minha minha--' + (m.efeito || 'foco'));
      d.appendChild(el('p', 'minha__txt', m.texto));
      $('minhasPalco').appendChild(d);
    });
  }

  // cada frase entra e sai com uma animação diferente, presa ao scroll
  function animarMinhas() {
    if (parado) return;
    var itens = gsap.utils.toArray('.minha');
    var W = window.innerWidth; var H = window.innerHeight;
    var tl = gsap.timeline({ scrollTrigger: { trigger: '#cenaMinhas', start: 'top top', end: function () { return '+=' + ((itens.length + 1) * window.innerHeight * 0.8); }, scrub: 0.8, pin: true, invalidateOnRefresh: true } });
    // o título forma-se no meio, letra a letra, e depois encolhe para o topo
    var st = SplitText.create('#minhasTitulo', { type: 'words,chars' });
    tl.fromTo(st.chars, espalhado(W * 0.9, H * 0.8), { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 0.6, stagger: { each: 0.008, from: 'random' }, ease: 'expo.out' }, 0);
    tl.fromTo('#minhasTitulo', { y: 0, scale: 1.25 }, { y: function () { return -window.innerHeight * 0.32; }, scale: 0.7, duration: 0.4, ease: 'power2.inOut' }, 0.75);

    itens.forEach(function (it, i) {
      var p = it.querySelector('.minha__txt');
      var ef = (C.minhas[i] && C.minhas[i].efeito) || 'foco';
      var t = 1.2 + i;
      tl.set(it, { opacity: 1 }, t);
      if (ef === 'baralhar') {
        var texto = p.textContent;
        p.setAttribute('aria-label', texto);
        tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.1 }, t);
        tl.to(p, { duration: 0.6, scrambleText: { text: texto, chars: 'abcdefghijklmnopqrstuvwxyz♥', revealDelay: 0.15, speed: 0.4 }, ease: 'none' }, t);
        p.textContent = '';
      } else {
        var sp = SplitText.create(p, { type: 'words,chars' });
        if (ef === 'onda') tl.fromTo(sp.chars, { opacity: 0, y: 60, rotate: 12 }, { opacity: 1, y: 0, rotate: 0, duration: 0.45, stagger: { each: 0.012, ease: 'sine.inOut' }, ease: 'sine.out' }, t);
        else if (ef === 'maquina') tl.fromTo(sp.chars, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 0.007, ease: 'none' }, t);
        else if (ef === 'cair') tl.fromTo(sp.words, { opacity: 0, y: -H * 0.5, rotate: function () { return (Math.random() - 0.5) * 60; } }, { opacity: 1, y: 0, rotate: 0, duration: 0.55, stagger: 0.06, ease: 'bounce.out' }, t);
        else if (ef === 'virar') tl.fromTo(sp.chars, { opacity: 0, rotateX: -100, transformOrigin: '50% 50% -18px' }, { opacity: 1, rotateX: 0, duration: 0.45, stagger: 0.01, ease: 'back.out(2)' }, t);
        else if (ef === 'grande') tl.fromTo(sp.chars, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.5, stagger: { each: 0.03, from: 'center' }, ease: 'back.out(3)' }, t);
        else tl.fromTo(p, { opacity: 0, scale: 1.3, letterSpacing: '0.35em', filter: 'blur(18px)' }, { opacity: 1, scale: 1, letterSpacing: '0em', filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }, t);
      }
      if (i < itens.length - 1) {
        // saídas também diferentes: umas sobem desfocadas, outras desfazem-se para os lados
        if (i % 2) tl.to(it, { opacity: 0, y: -60, filter: 'blur(12px)', duration: 0.25, ease: 'power2.in' }, t + 0.72);
        else tl.to(it, { opacity: 0, x: -W * 0.25, skewX: 18, duration: 0.25, ease: 'power2.in' }, t + 0.72);
      }
    });
    tl.to({}, { duration: 0.4 });
  }

  // ---------- nível 2: quanto sabes de nós ----------
  function montarQuiz() {
    var Q = C.quiz;
    $('quizTitulo').textContent = Q.titulo;
    $('quizSub').textContent = Q.sub;
    var caixa = $('quizCaixa');
    var certas = 0;
    var atual = null;

    function trocar(novo) {
      var velho = atual;
      atual = novo;
      caixa.appendChild(novo);
      if (parado) { if (velho) velho.remove(); return; }
      if (velho) {
        gsap.to(velho, { xPercent: -60, rotateY: 35, opacity: 0, duration: 0.55, ease: 'power2.in', onComplete: function () { velho.remove(); } });
      }
      gsap.fromTo(novo, { xPercent: 60, rotateY: -35, opacity: 0 }, { xPercent: 0, rotateY: 0, opacity: 1, duration: 0.8, delay: velho ? 0.35 : 0, ease: 'power3.out' });
      gsap.fromTo(novo.querySelectorAll('.quiz-op'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, delay: velho ? 0.65 : 0.3, ease: 'back.out(1.6)' });
    }

    function pergunta(i) {
      var P = Q.perguntas[i];
      var cart = el('div', 'quiz-cartao');
      cart.appendChild(el('p', 'quiz-num', 'Pergunta ' + (i + 1) + ' de ' + Q.perguntas.length));
      cart.appendChild(el('p', 'quiz-p', P.p));
      var ops = el('div', 'quiz-opcoes');
      var resp = el('p', 'quiz-resposta');
      var seg = el('button', 'botao quiz-seguinte', i === Q.perguntas.length - 1 ? 'Ver resultado' : 'Seguinte');
      seg.type = 'button'; seg.hidden = true;
      var botoes = P.opcoes.map(function (txt, k) {
        var b = el('button', 'quiz-op', txt);
        b.type = 'button';
        b.addEventListener('click', function () { responder(k); });
        ops.appendChild(b);
        return b;
      });
      function responder(k) {
        if (cart.getAttribute('data-respondida')) return;
        cart.setAttribute('data-respondida', '1');
        botoes.forEach(function (b) { b.disabled = true; });
        var acertou = P.certa === -1 || k === P.certa;
        if (acertou) certas++;
        if (P.certa === -1) {
          // a pergunta com batota: todas as respostas acendem, uma a uma
          botoes.forEach(function (b, j) { setTimeout(function () { b.classList.add('quiz-op--certa'); var c = centroDe(b); ctx.coracoes(c.x, c.y, 8, true); }, j * 260); });
        } else {
          botoes[P.certa].classList.add('quiz-op--certa');
          if (!acertou) botoes[k].classList.add('quiz-op--errada');
          var c = centroDe(botoes[acertou ? k : P.certa]);
          if (acertou) { ctx.coracoes(c.x, c.y, 12, true); vibrar(20); } else if (!parado) { gsap.fromTo(botoes[k], { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' }); vibrar([20, 60, 20]); }
        }
        resp.textContent = acertou ? P.sim : P.nao;
        seg.hidden = false;
        if (!parado) {
          gsap.fromTo(resp, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
          gsap.fromTo(seg, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.3, ease: 'back.out(2)' });
        }
      }
      seg.addEventListener('click', function () { if (i + 1 < Q.perguntas.length) trocar(pergunta(i + 1)); else trocar(resultado()); });
      cart.appendChild(ops); cart.appendChild(resp); cart.appendChild(seg);
      return cart;
    }

    function resultado() {
      var cart = el('div', 'quiz-cartao quiz-cartao--fim');
      cart.appendChild(el('p', 'quiz-p', Q.resultado.replace('{n}', certas).replace('{t}', Q.perguntas.length)));
      var vinte = el('p', 'quiz-vinte');
      var num = el('span', 'quiz-vinte__n', '0');
      vinte.appendChild(num);
      vinte.appendChild(el('span', 'quiz-vinte__v', 'valores'));
      cart.appendChild(vinte);
      cart.appendChild(el('p', 'quiz-resposta', Q.nota));
      var outra = el('button', 'botao botao--suave', 'Jogar outra vez');
      outra.type = 'button';
      outra.addEventListener('click', function () { certas = 0; trocar(pergunta(0)); });
      cart.appendChild(outra);
      if (parado) { num.textContent = '20'; } else {
        var o = { v: 0 };
        gsap.to(o, { v: 20, duration: 2.2, delay: 0.9, ease: 'power3.out', onUpdate: function () { num.textContent = String(Math.round(o.v)); },
          onComplete: function () { var c = centroDe(num); ctx.coracoes(c.x, c.y, 26, true); ctx.pulso(1.4); if (certas === Q.perguntas.length && window.MAIS) window.MAIS.confetti(90); } });
        if (window.anime) window.anime({ targets: vinte, scale: [0.4, 1], opacity: [0, 1], duration: 2200, delay: 700, easing: 'easeOutElastic(1, .5)' });
      }
      return cart;
    }
    trocar(pergunta(0));
  }

  // ---------- nível 3: liga as estrelas (uma balança) ----------
  var ESTRELAS = [
    { id: 'I', x: 36, y: 92 }, { id: 'J', x: 64, y: 92 }, { id: 'A', x: 50, y: 80 }, { id: 'B', x: 50, y: 16 },
    { id: 'C', x: 15, y: 24, braco: true }, { id: 'D', x: 85, y: 24, braco: true },
    { id: 'E', x: 4, y: 54, braco: true }, { id: 'F', x: 26, y: 54, braco: true },
    { id: 'G', x: 74, y: 54, braco: true }, { id: 'H', x: 96, y: 54, braco: true },
  ];
  // segmentos: [de, para, ponto de controlo opcional para os pratos curvos]
  var TRACOS = [['I', 'J'], ['A', 'J'], ['A', 'I'], ['B', 'A'], ['C', 'B', null, true], ['D', 'B', null, true],
    ['E', 'C', null, true], ['F', 'C', null, true], ['F', 'E', [15, 66], true], ['G', 'D', null, true], ['H', 'D', null, true], ['H', 'G', [85, 66], true]];

  function montarConstelacao() {
    var K = C.constelacao;
    $('constTitulo').textContent = K.titulo;
    $('constSub').textContent = K.sub;
    var ceu = $('ceu');
    var pos = {};
    ESTRELAS.forEach(function (s) { pos[s.id] = s; });
    // estrelas de enfeite, a piscar
    var enfeite = svgEl('g', { class: 'ceu-enfeite' });
    for (var k = 0; k < 46; k++) {
      var c = svgEl('circle', { cx: (Math.random() * 100).toFixed(1), cy: (Math.random() * 100).toFixed(1), r: (Math.random() * 0.5 + 0.15).toFixed(2) });
      c.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
      enfeite.appendChild(c);
    }
    ceu.appendChild(enfeite);
    var base = svgEl('g');
    var braco = svgEl('g', { id: 'ceuBraco' });
    ceu.appendChild(base); ceu.appendChild(braco);
    var tracos = TRACOS.map(function (t) {
      var a = pos[t[0]]; var b = pos[t[1]];
      var d = t[2] ? 'M' + a.x + ' ' + a.y + ' Q ' + t[2][0] + ' ' + t[2][1] + ' ' + b.x + ' ' + b.y : 'M' + a.x + ' ' + a.y + ' L ' + b.x + ' ' + b.y;
      var path = svgEl('path', { d: d, class: 'ceu-traco' });
      (t[3] ? braco : base).appendChild(path);
      return { de: t[0], para: t[1], path: path };
    });
    var feitas = {};
    var proxima = 0;
    var nodos = ESTRELAS.map(function (s, i) {
      var g = svgEl('g', { class: 'ceu-estrela', tabindex: '0', role: 'button', 'aria-label': 'Estrela ' + (i + 1) });
      g.appendChild(svgEl('circle', { cx: s.x, cy: s.y, r: 6, class: 'ceu-toque' }));
      g.appendChild(svgEl('circle', { cx: s.x, cy: s.y, r: 3.2, class: 'ceu-anel' }));
      g.appendChild(svgEl('circle', { cx: s.x, cy: s.y, r: 1.4, class: 'ceu-ponto' }));
      var n = svgEl('text', { x: s.x + (s.x > 50 ? -3.5 : 3.5), y: s.y - 3.2, class: 'ceu-num', 'text-anchor': 'middle' });
      n.textContent = String(i + 1);
      g.appendChild(n);
      (s.braco ? braco : base).appendChild(g);
      function tocar() { escolher(i, g); }
      g.addEventListener('click', tocar);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocar(); } });
      return g;
    });
    function marcarProxima() { nodos.forEach(function (n, i) { n.classList.toggle('proxima', i === proxima); }); }
    marcarProxima();

    function escolher(i, g) {
      if (i < proxima) return;
      if (i !== proxima) {
        $('constMsg').textContent = K.errado.replace('{n}', proxima + 1);
        if (!parado) gsap.fromTo(g, { x: -1.5 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        vibrar([15, 40, 15]);
        return;
      }
      $('constMsg').textContent = '';
      var s = ESTRELAS[i];
      feitas[s.id] = true;
      g.classList.add('acesa');
      vibrar(10);
      var c = centroDe(g.querySelector('.ceu-ponto'));
      ctx.coracoes(c.x, c.y, 4, false);
      if (!parado) gsap.fromTo(g.querySelector('.ceu-ponto'), { attr: { r: 4 } }, { attr: { r: 1.6 }, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      // desenha os traços que ligam esta estrela às que já estão acesas
      tracos.forEach(function (t) {
        var outra = t.de === s.id ? t.para : t.para === s.id ? t.de : null;
        if (outra && feitas[outra]) {
          t.path.classList.add('visivel');
          if (!parado) gsap.fromTo(t.path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, ease: 'power2.out' });
        }
      });
      proxima++;
      marcarProxima();
      if (proxima === ESTRELAS.length) completo();
    }

    function completo() {
      ceu.classList.add('completo');
      ctx.pulso(1.6);
      var msg = $('constMsg');
      msg.textContent = '';
      K.feito.forEach(function (f, i) { msg.appendChild(el('span', 'const-linha' + (i ? '' : ' const-linha--grande'), f)); });
      if (parado) return;
      // a balança oscila até ficar em equilíbrio
      gsap.timeline()
        .to('#ceuBraco', { rotation: 9, svgOrigin: '50 16', duration: 0.7, ease: 'sine.inOut' })
        .to('#ceuBraco', { rotation: -6, svgOrigin: '50 16', duration: 0.9, ease: 'sine.inOut' })
        .to('#ceuBraco', { rotation: 3, svgOrigin: '50 16', duration: 0.9, ease: 'sine.inOut' })
        .to('#ceuBraco', { rotation: 0, svgOrigin: '50 16', duration: 1.2, ease: 'elastic.out(1, 0.4)' });
      var linhas = msg.querySelectorAll('.const-linha');
      gsap.fromTo(linhas, { opacity: 0, y: 20, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.6, delay: 0.8, ease: 'power2.out' });
      var r = ceu.getBoundingClientRect();
      for (var k = 0; k < 4; k++) setTimeout(function () { ctx.coracoes(r.left + Math.random() * r.width, r.top + Math.random() * r.height, 10, true); }, 400 + k * 300);
    }
  }

  // ---------- nível 4: raspadinhas ----------
  function montarVales() {
    var V = C.vales;
    $('valesTitulo').textContent = V.titulo;
    $('valesSub').textContent = V.sub;
    var CHAVE = 'surpresa-vales';
    var ganhos = guardado(CHAVE);
    var lista = $('listaVales');
    var telas = [];
    function verTudo() { if (ganhos.length === V.lista.length) $('valesMsg').textContent = V.tudo; }
    V.lista.forEach(function (txt, i) {
      var v = el('div', 'vale');
      v.appendChild(el('span', 'vale__selo', '♥'));
      v.appendChild(el('p', 'vale__txt', txt));
      lista.appendChild(v);
      if (ganhos.indexOf(i) !== -1) { v.classList.add('vale--ganho'); return; }
      var tela = el('canvas', 'vale__raspa');
      tela.setAttribute('aria-label', 'Raspadinha: raspa com o dedo');
      v.appendChild(tela);
      var c = tela.getContext('2d');
      var rasp = { a: false, n: 0, ux: 0, uy: 0, d: 1, feito: false };
      function pintar() {
        var d = Math.min(window.devicePixelRatio || 1, 2);
        rasp.d = d;
        tela.width = v.clientWidth * d; tela.height = v.clientHeight * d;
        var w = tela.width; var h = tela.height;
        c.globalCompositeOperation = 'source-over';
        var g = c.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, '#b8923f'); g.addColorStop(0.45, '#f1d88c'); g.addColorStop(0.55, '#e4c06a'); g.addColorStop(1, '#8f6c28');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(90,50,10,.28)';
        c.font = (14 * d) + 'px Georgia, serif';
        for (var yy = 18 * d; yy < h; yy += 26 * d) for (var xx = ((yy / (26 * d)) % 2) * 13 * d; xx < w; xx += 26 * d) c.fillText('♥', xx, yy);
        c.fillStyle = '#3a1a08';
        c.font = 'italic ' + (17 * d) + 'px Georgia, serif';
        c.textAlign = 'center';
        c.fillText('raspa aqui', w / 2, h / 2 + 6 * d);
      }
      function ponto(e) { var r = tela.getBoundingClientRect(); return { x: (e.clientX - r.left) * rasp.d, y: (e.clientY - r.top) * rasp.d }; }
      function raspar(p) {
        c.globalCompositeOperation = 'destination-out';
        c.lineWidth = 34 * rasp.d; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(rasp.ux, rasp.uy); c.lineTo(p.x, p.y); c.stroke();
        rasp.ux = p.x; rasp.uy = p.y;
        if (++rasp.n % 10 === 0) medir();
      }
      // quanto já foi raspado (amostra alguns pixéis)
      function medir() {
        var dados = c.getImageData(0, 0, tela.width, tela.height).data;
        var vazio = 0; var total = 0;
        for (var k = 3; k < dados.length; k += 4 * 24) { total++; if (dados[k] < 40) vazio++; }
        if (vazio / total > 0.5) ganhar();
      }
      function ganhar() {
        if (rasp.feito) return;
        rasp.feito = true;
        v.classList.add('vale--ganho');
        ganhos.push(i); guardar(CHAVE, ganhos);
        var ct = centroDe(v);
        ctx.coracoes(ct.x, ct.y, 16, true); vibrar(30);
        if (parado) { tela.remove(); } else {
          gsap.to(tela, { opacity: 0, scale: 1.08, duration: 0.6, ease: 'power2.out', onComplete: function () { tela.remove(); } });
          gsap.fromTo(v.querySelector('.vale__txt'), { scale: 0.92 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
        }
        verTudo();
      }
      tela.addEventListener('pointerdown', function (e) { rasp.a = true; var p = ponto(e); rasp.ux = p.x; rasp.uy = p.y; raspar({ x: p.x + 0.1, y: p.y }); tela.setPointerCapture(e.pointerId); });
      tela.addEventListener('pointermove', function (e) { if (rasp.a) raspar(ponto(e)); });
      ['pointerup', 'pointercancel'].forEach(function (ev) { tela.addEventListener(ev, function () { rasp.a = false; if (!rasp.feito) medir(); }); });
      telas.push(pintar);
      pintar();
    });
    verTudo();
    var largura = window.innerWidth;
    window.addEventListener('resize', function () { if (window.innerWidth !== largura) { largura = window.innerWidth; telas.forEach(function (p) { p(); }); } });
  }

  // ---------- capítulo v: o nosso código, com assinatura ----------
  function montarCodigo() {
    var K = C.codigo;
    $('codigoTitulo').textContent = K.titulo;
    $('codigoSub').textContent = K.sub;
    K.artigos.forEach(function (a) {
      var d = el('article', 'artigo');
      d.appendChild(el('p', 'artigo__n', a.n));
      d.appendChild(el('p', 'artigo__epigrafe', a.epigrafe));
      d.appendChild(el('p', 'artigo__texto', a.texto));
      $('artigos').appendChild(d);
    });
    $('assinarLegenda').textContent = K.assinar;
    $('assinaturaVini').textContent = K.assinaturaVini;
    $('assinarLimpar').textContent = K.limpar;
    $('assinarOk').textContent = K.botao;
    $('carimbo').textContent = K.carimbo;

    var tela = $('assinar');
    var c = tela.getContext('2d');
    var a = { ativo: false, ux: 0, uy: 0, comprimento: 0, d: 1, fechado: false };
    var CHAVE = 'surpresa-codigo';
    function preparar() {
      var d = Math.min(window.devicePixelRatio || 1, 2);
      a.d = d;
      tela.width = tela.clientWidth * d; tela.height = tela.clientHeight * d;
      c.setTransform(d, 0, 0, d, 0, 0);
      c.strokeStyle = '#d8b45f'; c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round';
      c.shadowColor = 'rgba(216,180,95,.6)'; c.shadowBlur = 4;
      a.comprimento = 0;
      $('assinarOk').disabled = true;
    }
    function ponto(e) { var r = tela.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    tela.addEventListener('pointerdown', function (e) { if (a.fechado) return; a.ativo = true; var p = ponto(e); a.ux = p.x; a.uy = p.y; tela.setPointerCapture(e.pointerId); });
    tela.addEventListener('pointermove', function (e) {
      if (!a.ativo) return;
      var p = ponto(e);
      var mx = (a.ux + p.x) / 2; var my = (a.uy + p.y) / 2;
      c.beginPath(); c.moveTo(a.ux, a.uy); c.quadraticCurveTo(a.ux, a.uy, mx, my); c.lineTo(p.x, p.y); c.stroke();
      a.comprimento += Math.hypot(p.x - a.ux, p.y - a.uy);
      a.ux = p.x; a.uy = p.y;
      if (a.comprimento > 90) $('assinarOk').disabled = false;
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) { tela.addEventListener(ev, function () { a.ativo = false; }); });
    $('assinarLimpar').addEventListener('click', function () { if (!a.fechado) preparar(); });
    $('assinarOk').addEventListener('click', function () {
      if (a.fechado) return;
      a.fechado = true;
      $('diploma').classList.add('diploma--assinado');
      $('assinarOk').disabled = true;
      try { localStorage.setItem(CHAVE, tela.toDataURL('image/png')); } catch { /* sem armazenamento */ }
      carimbar();
    });
    function carimbar() {
      var feito = $('codigoFeito');
      feito.textContent = K.feito;
      if (parado) { $('carimbo').style.opacity = '0.9'; return; }
      var tl = gsap.timeline();
      tl.fromTo('#carimbo', { opacity: 0, scale: 3.4, rotate: -30 }, { opacity: 0.92, scale: 1, rotate: -14, duration: 0.32, ease: 'power4.in' })
        .add(function () {
          vibrar(40); ctx.pulso(2);
          var cc = centroDe($('carimbo'));
          ctx.coracoes(cc.x, cc.y, 22, true);
        })
        .fromTo('#diploma', { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.25)' })
        .fromTo(feito, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.2');
    }
    // se ela já assinou noutro dia, a assinatura dela volta a aparecer, já carimbada
    var antiga;
    try { antiga = localStorage.getItem(CHAVE); } catch { antiga = null; }
    preparar();
    if (antiga) {
      var img = new Image();
      img.onload = function () { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(img, 0, 0, tela.width, tela.height); c.restore(); };
      img.src = antiga;
      a.fechado = true;
      $('diploma').classList.add('diploma--assinado');
      $('carimbo').style.opacity = '0.92';
      $('codigoFeito').textContent = K.feito;
    }
    var largura = window.innerWidth;
    window.addEventListener('resize', function () { if (!a.fechado && window.innerWidth !== largura) { largura = window.innerWidth; preparar(); } });
  }

  // ---------- abraço à distância ----------
  function montarAbraco() {
    var A = C.abraco;
    $('abracoTitulo').textContent = A.titulo;
    $('abracoSub').textContent = A.sub;
    var botao = $('abracoBotao');
    var anel = $('abracoAnel');
    var msg = $('abracoMsg');
    var calor = el('div', 'calor');
    calor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(calor);
    var CIRC = 2 * Math.PI * 54;
    anel.style.strokeDasharray = CIRC;
    anel.style.strokeDashoffset = CIRC;
    var e = { p: 0 };
    var tw = null; var feito = false; var ultimoVibrar = 0;
    function render() {
      anel.style.strokeDashoffset = (CIRC * (1 - e.p)).toFixed(1);
      calor.style.opacity = (e.p * 0.85).toFixed(3);
      if (!parado) {
        var tremer = e.p > 0.35 ? (e.p - 0.35) * 3.2 : 0;
        gsap.set('#abracoCoracao', { scale: 1 + e.p * 0.7, x: (Math.random() - 0.5) * tremer, y: (Math.random() - 0.5) * tremer });
      }
      var agora = Date.now();
      if (e.p > 0 && e.p < 1 && agora - ultimoVibrar > 450) { vibrar(8 + Math.round(e.p * 20)); ultimoVibrar = agora; }
    }
    function mostrar(linhas, formar) {
      msg.textContent = '';
      linhas.forEach(function (l, i) { msg.appendChild(el('p', i ? 'abraco-msg__sub' : 'abraco-msg__grande', l)); });
      if (parado) return;
      if (formar) {
        // as letras vêm de todo o lado e juntam-se
        msg.querySelectorAll('p').forEach(function (p, i) {
          var sp = SplitText.create(p, { type: 'words,chars' });
          gsap.fromTo(sp.chars, espalhado(window.innerWidth * 0.9, window.innerHeight * 0.7), { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 1.8, delay: i * 0.6, stagger: { each: 0.012, from: 'random' }, ease: 'expo.out' });
        });
      } else {
        gsap.fromTo(msg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
      }
    }
    function largar() {
      if (feito) return;
      if (tw) tw.kill();
      if (e.p > 0.04) mostrar([A.cedo], false);
      tw = gsap.to(e, { p: 0, duration: parado ? 0 : 0.7, ease: 'power2.out', onUpdate: render });
    }
    function carregar(ev) {
      if (feito) return;
      if (ev) ev.preventDefault();
      if (tw) tw.kill();
      msg.textContent = '';
      tw = gsap.to(e, { p: 1, duration: 3 * (1 - e.p), ease: 'none', onUpdate: render, onComplete: completo });
    }
    function completo() {
      feito = true;
      botao.classList.add('abraco-botao--feito');
      vibrar([60, 80, 120]);
      ctx.pulso(2.4);
      var c = centroDe(botao);
      for (var k = 0; k < 5; k++) setTimeout(function () { ctx.coracoes(c.x, c.y, 18, true); }, k * 220);
      if (!parado) {
        gsap.to(calor, { opacity: 0.35, duration: 2.4, delay: 0.6 });
        gsap.set('#abracoCoracao', { x: 0, y: 0 });
        if (window.anime) window.anime({ targets: '#abracoCoracao', scale: [1.7, 1.25, 1.55, 1.25], duration: 1300, easing: 'easeInOutSine', loop: true });
      }
      mostrar(A.feito, true);
    }
    botao.addEventListener('pointerdown', carregar);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { botao.addEventListener(n, largar); });
    botao.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
    botao.addEventListener('keydown', function (ev) { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) carregar(ev); });
    botao.addEventListener('keyup', function (ev) { if (ev.key === ' ' || ev.key === 'Enter') largar(); });
    // ao sair da secção, o calor do ecrã desaparece (criado em animarResto, depois das cenas fixas)
    triggerAbraco = function () { ScrollTrigger.create({ trigger: '#abraco', start: 'top bottom', end: 'bottom top', onLeave: function () { gsap.to(calor, { opacity: 0, duration: 0.6 }); }, onLeaveBack: function () { gsap.to(calor, { opacity: 0, duration: 0.6 }); }, onEnter: function () { if (feito) gsap.to(calor, { opacity: 0.35, duration: 1 }); }, onEnterBack: function () { if (feito) gsap.to(calor, { opacity: 0.35, duration: 1 }); } }); };
  }
  var triggerAbraco = function () {};

  // ---------- contagem das estrelas ----------
  function formatar(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function quantas() { var ci = window.CINEMA || {}; return ci.estrelas || ci.estrelas2d || 190; }
  function montarContagem() {
    var K = C.contagem;
    $('contagemAntes').textContent = K.antes;
    K.depois.forEach(function (l) { $('contagemDepois').appendChild(el('p', 'contagem__linha', l)); });
    if (parado) $('contagemNumero').textContent = formatar(quantas());
  }
  // presa ao scroll: o número sobe enquanto desces, e as estrelas acendem-se ao serem contadas
  function animarContagem() {
    if (parado) return;
    var W = window.innerWidth; var H = window.innerHeight;
    var num = $('contagemNumero');
    var o = { v: 0 };
    var cinema = window.CINEMA;
    var sa = SplitText.create('#contagemAntes', { type: 'words,chars' });
    var tl = gsap.timeline({ scrollTrigger: { trigger: '#contagem', start: 'top top', end: '+=240%', scrub: 0.8, pin: true } });
    tl.fromTo(sa.chars, espalhado(W * 0.9, H * 0.8), { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 0.8, stagger: { each: 0.006, from: 'random' }, ease: 'expo.out' }, 0);
    tl.fromTo(num, { opacity: 0, scale: 0.5, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5 }, 0.8);
    tl.to(o, { v: 1, duration: 1.6, ease: 'power2.out', onUpdate: function () { num.textContent = formatar(Math.round(o.v * quantas())); } }, 0.8);
    if (cinema) tl.fromTo(cinema, { acender: 1 }, { acender: 1.8, duration: 1.6, ease: 'power2.out' }, 0.8);
    tl.fromTo('.contagem__linha', { opacity: 0, y: 24, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.45 }, 2.4);
    if (cinema) tl.to(cinema, { acender: 1, duration: 0.6 }, 3.2);
    tl.to({}, { duration: 0.4 });
    tl.to('.contagem', { opacity: 0, y: -60, filter: 'blur(10px)', duration: 0.5, ease: 'power2.in' });
  }

  // ---------- a promessa cumprida: a introdução da carta ----------
  function montarOrnamentos() {
    document.querySelectorAll('.cap .titulo-cap').forEach(function (t) {
      var o = svgEl('svg', { class: 'ornamento', viewBox: '0 0 160 20', 'aria-hidden': 'true' });
      o.appendChild(svgEl('path', { class: 'ornamento__linha', d: 'M2 10 H62' }));
      o.appendChild(svgEl('path', { class: 'ornamento__linha', d: 'M98 10 H158' }));
      o.appendChild(svgEl('path', { class: 'ornamento__coracao', d: 'M80 16 C 74 11 70 8 72 5 C 74 2 78 3 80 6 C 82 3 86 2 88 5 C 90 8 86 11 80 16 Z' }));
      t.parentNode.insertBefore(o, t);
    });
  }

  function montarCartaIntro() {
    (C.cartaIntro || []).forEach(function (l, i) { $('cartaIntro').appendChild(el('p', i ? 'carta-intro__sub' : 'carta-intro__grande', l)); });
  }

  // ---------- efeitos globais de scroll ----------
  function animarResto() {
    triggerAbraco();
    if (parado) return;
    var W = window.innerWidth;

    // formação de letras: os títulos montam-se de letras espalhadas ao entrar e desfazem-se ao sair, presos ao scroll
    gsap.utils.toArray('.cap .titulo-cap, .diploma__titulo, .carta-intro__grande').forEach(function (t) {
      var sp = SplitText.create(t, { type: 'words,chars' });
      // forma-se enquanto sobe do fundo do ecrã até um pouco acima do meio
      gsap.fromTo(sp.chars, {
        opacity: 0,
        x: function () { return (Math.random() - 0.5) * Math.min(W, 700) * 0.6; },
        y: function () { return 60 + Math.random() * 160; },
        rotate: function () { return (Math.random() - 0.5) * 120; },
        scale: function () { return 0.2 + Math.random() * 1.6; },
      }, { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, stagger: { each: 0.02, from: 'random' }, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 96%', end: 'top 55%', scrub: 0.6 } });
      // e só se desfaz quando já está a sair por cima (para não estragar o título enquanto ela joga)
      gsap.to(sp.chars, {
        opacity: 0, immediateRender: false,
        y: function () { return -(40 + Math.random() * 140); },
        x: function () { return (Math.random() - 0.5) * 200; },
        rotate: function () { return (Math.random() - 0.5) * 90; },
        stagger: { each: 0.012, from: 'edges' }, ease: 'power2.in',
        scrollTrigger: { trigger: t, start: 'top 3%', end: 'top -30%', scrub: 0.6 },
      });
    });

    // blocos que entram e saem com o scroll: sobem em perspetiva, ficam, e afastam-se ao chegar ao topo
    gsap.utils.toArray('.nivel, .sub-cap, .memo, .quiz, .ceu, .vale, .artigo, .assinaturas, .abraco-botao, .carta, .carta-intro__sub, .contador, .memo-msg').forEach(function (b) {
      gsap.fromTo(b, { opacity: 0, y: 90, rotateX: -24, scale: 0.94, transformPerspective: 900, transformOrigin: '50% 0%' },
        { opacity: 1, y: 0, rotateX: 0, scale: 1, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top bottom', end: 'top 72%', scrub: 0.7 } });
      gsap.to(b, { opacity: 0, y: -50, scale: 0.95, rotateX: 14, ease: 'power1.in', immediateRender: false, scrollTrigger: { trigger: b, start: 'top 4%', end: 'bottom -5%', scrub: 0.7 } });
    });

    // artigos do código: número, epígrafe e texto entram por partes
    // (de uma vez, ao entrar: preso ao scroll ficava meio escrito e parecia cortado)
    gsap.utils.toArray('.artigo').forEach(function (a) {
      gsap.timeline({ scrollTrigger: { trigger: a, start: 'top 90%', toggleActions: 'play none none reverse' } })
        .fromTo(a.querySelector('.artigo__n'), { letterSpacing: '0.9em', opacity: 0 }, { letterSpacing: '0.3em', opacity: 1, duration: 0.6, ease: 'power2.out' })
        .fromTo(a.querySelector('.artigo__epigrafe'), { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.15)
        .fromTo(a.querySelector('.artigo__texto'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power2.inOut' }, 0.3)
        .fromTo(a, { '--traco': 0 }, { '--traco': 1, duration: 0.8, ease: 'power2.out' }, 0);
    });
    // a assinatura do vini escreve-se sozinha quando aparece
    gsap.fromTo('#assinaturaVini', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power1.inOut', scrollTrigger: { trigger: '.assinaturas', start: 'top 80%' } });

    // a carta longa: cada parágrafo sobe ao entrar e apaga-se devagar ao chegar ao topo
    // (entra depressa, enquanto ainda está em baixo, para se ler sempre bem; só apaga já a sair por cima)
    gsap.utils.toArray('#cartaLonga p').forEach(function (p) {
      gsap.fromTo(p, { opacity: 0, y: 36, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 100%', end: 'top 82%', scrub: 0.5 } });
      gsap.to(p, { opacity: 0.12, y: -16, ease: 'none', immediateRender: false, scrollTrigger: { trigger: p, start: 'bottom 22%', end: 'bottom 0%', scrub: 0.5 } });
    });
    // um ornamento (linha, coração, linha) desenha-se por cima de cada título das partes
    gsap.utils.toArray('.ornamento').forEach(function (o) {
      gsap.timeline({ scrollTrigger: { trigger: o, start: 'top 90%', toggleActions: 'play none none reverse' } })
        .fromTo(o.querySelectorAll('.ornamento__linha'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 1.1, ease: 'power2.inOut' })
        .fromTo(o.querySelector('.ornamento__coracao'), { scale: 0, rotate: -40, transformOrigin: '50% 50%' }, { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(3)' }, 0.35);
    });

    // títulos que inclinam com a velocidade do scroll
    var inclinar = gsap.utils.toArray('.titulo-cap, .marquee__linha, .creditos-fim__grande, .diploma__titulo').map(function (t) { return gsap.quickTo(t, 'skewY', { duration: 0.5, ease: 'power3' }); });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-7, 7, self.getVelocity() / -320);
        inclinar.forEach(function (f) { f(v); });
      },
    });
    ScrollTrigger.addEventListener('scrollEnd', function () { inclinar.forEach(function (f) { f(0); }); });
  }

  window.EXTRA = {
    montar: function (c) {
      ctx = c; parado = c.parado;
      montarMinhas();
      montarQuiz();
      montarConstelacao();
      montarVales();
      montarCodigo();
      montarAbraco();
      montarContagem();
      montarCartaIntro();
      montarOrnamentos();
    },
    animarMinhas: animarMinhas,
    animarContagem: animarContagem,
    animarResto: animarResto,
  };
})();
