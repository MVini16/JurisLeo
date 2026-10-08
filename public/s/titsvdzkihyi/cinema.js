// a camada 3D, por baixo de tudo: milhares de estrelas por onde a câmara voa enquanto desces,
// e no fim todas se juntam num coração 3D que bate e roda. a transformação é feita na placa gráfica (shader),
// com duas posições por ponto (a de estrela e a de coração). por trás, uma aurora que se mexe e muda de cor ao longo do filme,
// desenhada em baixa resolução (fica suave e quase não custa nada). se o telemóvel não aguentar, fica o céu 2D de app.js
import * as THREE from './three.module.min.js';

(function () {
  var baseFov = 62; var ultPul = 0; var tamBase = 1;
  var parado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (parado || /[?&]semgl\b/.test(window.location.search)) return;

  var tela = document.getElementById('gl');
  if (!tela) return;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: false, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return; // sem webgl: continua o céu 2D
  }
  var estado = window.CINEMA || { coracao: { p: 0 } };
  estado.estrelas = 0; // preenchido abaixo, para a contagem das estrelas

  var fraco = (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  var pequeno = window.innerWidth < 700;
  var N = fraco ? 2200 : pequeno ? 5200 : 8500; // um iphone 14 aguenta isto com folga
  var COMPRIMENTO = 320; // quanto a câmara viaja do início ao fim do scroll
  var LONGE = 85; // a partir daqui as estrelas desvanecem
  var pixelMax = fraco ? 1 : 2;
  estado.estrelas = N;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelMax));
  renderer.setClearColor(0x000000, 0);
  var cena = new THREE.Scene();
  var camara = new THREE.PerspectiveCamera(62, 1, 0.1, 400);

  // ---- as posições: estrela (um túnel por onde se voa) e coração (um coração 3D, perto da câmara) ----
  var estrela = new Float32Array(N * 3);
  var coracao = new Float32Array(N * 3);
  var rnd = new Float32Array(N * 4); // fase, tamanho, cor, atraso

  for (var i = 0; i < N; i++) {
    // túnel: raio entre 2.5 e 48, mais gente nas margens para o centro ficar livre para o texto
    var ang = Math.random() * 6.2832;
    var raio = 2.5 + Math.pow(Math.random(), 0.7) * 46;
    estrela[i * 3] = Math.cos(ang) * raio;
    estrela[i * 3 + 1] = Math.sin(ang) * raio * 0.75;
    estrela[i * 3 + 2] = -Math.random() * (COMPRIMENTO + 40) + 20;
    rnd[i * 4] = Math.random();
    rnd[i * 4 + 1] = 0.5 + Math.random() * 1.3;
    rnd[i * 4 + 2] = Math.random();
    rnd[i * 4 + 3] = Math.random();
  }

  // coração 3D: pontos dentro da superfície clássica, a maior parte junto à superfície para se ver o contorno
  function ponto3dDoCoracao(superficie) {
    for (var t = 0; t < 400; t++) {
      var x = (Math.random() * 2 - 1) * 1.4;
      var y = (Math.random() * 2 - 1) * 1.4;
      var z = (Math.random() * 2 - 1) * 1.1;
      var a = x * x + 2.25 * z * z + y * y - 1;
      var f = a * a * a - x * x * y * y * y - 0.1125 * z * z * y * y * y;
      if (f <= 0 && (!superficie || f > -0.03)) return [x, y, z];
    }
    return [0, 0, 0];
  }
  var ESCALA = 5.6;
  for (var j = 0; j < N; j++) {
    var pt = ponto3dDoCoracao(Math.random() < 0.86);
    coracao[j * 3] = pt[0] * ESCALA;
    coracao[j * 3 + 1] = pt[1] * ESCALA;
    coracao[j * 3 + 2] = pt[2] * ESCALA;
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(estrela, 3));
  geo.setAttribute('aEstrela', new THREE.BufferAttribute(estrela, 3));
  geo.setAttribute('aCoracao', new THREE.BufferAttribute(coracao, 3));
  geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1e6); // nunca cortar os pontos

  var mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTempo: { value: 0 },
      uMorph: { value: 0 },
      uCam: { value: new THREE.Vector3() },
      uLonge: { value: LONGE },
      uTam: { value: 1 },
      uBater: { value: 1 },
      uRodar: { value: 0 },
      uAlto: { value: 4 },
      uAcender: { value: 1 },
      uVel: { value: 0 },
    },
    vertexShader: [
      'attribute vec3 aEstrela; attribute vec3 aCoracao; attribute vec4 aRnd;',
      'uniform float uTempo; uniform float uMorph; uniform vec3 uCam; uniform float uLonge; uniform float uTam; uniform float uBater; uniform float uRodar; uniform float uAlto; uniform float uAcender; uniform float uVel;',
      'varying float vAlfa; varying vec3 vCor;',
      'mat2 rot(float a){ float s = sin(a); float c = cos(a); return mat2(c, -s, s, c); }',
      'void main(){',
      '  float t = smoothstep(aRnd.w * 0.55, aRnd.w * 0.55 + 0.45, uMorph);',
      '  vec3 h = aCoracao; h.xz = rot(uRodar) * h.xz; h *= uBater;',
      '  vec3 paraCoracao = uCam + vec3(0.0, uAlto, -26.0) + h;',
      '  vec3 deEstrela = aEstrela + vec3(sin(uTempo * 0.3 + aRnd.x * 6.28) * 0.5, cos(uTempo * 0.27 + aRnd.x * 6.28) * 0.5, 0.0);',
      '  vec3 p = mix(deEstrela, paraCoracao, t);',
      '  float arco = sin(3.14159 * t);',
      '  p.xy += rot(aRnd.x * 6.28 + uTempo * 0.4) * vec2(arco * 4.0, 0.0);', // curva no caminho, em vez de linha reta
      '  vec4 mv = viewMatrix * vec4(p, 1.0);',
      '  float dist = -mv.z;',
      '  gl_Position = projectionMatrix * mv;',
      '  float brilho = 0.68 + 0.32 * sin(uTempo * 1.7 + aRnd.x * 40.0);',
      '  gl_PointSize = clamp(uTam * aRnd.y * (70.0 / max(dist, 1.0)) * (1.0 + t * 1.1) * (1.0 + uVel * 0.9), 1.0, 34.0);',
      '  float fade = smoothstep(uLonge, uLonge * 0.5, dist) * smoothstep(0.4, 3.5, dist);',
      '  vAlfa = fade * brilho * mix(0.85, 1.0, t) * uAcender * (1.0 + uVel * 0.6);',
      '  vec3 base = mix(vec3(1.0, 0.94, 0.86), vec3(0.88, 0.72, 0.38), aRnd.z);',
      '  vCor = mix(base, vec3(1.0, 0.42, 0.52), t * 0.85);',
      '}',
    ].join('\n'),
    fragmentShader: [
      'precision mediump float;',
      'varying float vAlfa; varying vec3 vCor;',
      'void main(){',
      '  float d = length(gl_PointCoord - 0.5);',
      '  float a = smoothstep(0.5, 0.0, d); a *= a;',
      '  gl_FragColor = vec4(vCor * a * vAlfa, a * vAlfa);',
      '}',
    ].join('\n'),
  });
  // ---- a aurora: um fundo de cor que flui (ruído fractal), noutra tela, a 1/6 da resolução ----
  var telaAurora = document.getElementById('aurora');
  var aurora = null;
  if (telaAurora) {
    try {
      var rendA = new THREE.WebGLRenderer({ canvas: telaAurora, antialias: false, alpha: false, powerPreference: 'low-power' });
      rendA.setPixelRatio(1);
      var cenaA = new THREE.Scene();
      var camA = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      var matA = new THREE.ShaderMaterial({
        uniforms: { uT: { value: 0 }, uP: { value: 0 }, uAsp: { value: 1 }, uRato: { value: new THREE.Vector2() }, uAcender: { value: 1 }, uMorph: { value: 0 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: [
          'precision mediump float;',
          'uniform float uT; uniform float uP; uniform float uAsp; uniform vec2 uRato; uniform float uAcender; uniform float uMorph;',
          'varying vec2 vUv;',
          'float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
          'float n(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);',
          '  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }',
          'float fbm(vec2 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++){ v += a * n(p); p = p * 2.03 + 7.1; a *= 0.5; } return v; }',
          'void main(){',
          '  vec2 uv = vUv; uv.x *= uAsp; uv += uRato * 0.12;',
          '  float t = uT * 0.045;',
          '  vec2 q = vec2(fbm(uv * 1.3 + vec2(t, -t * 0.6) + uP * 1.6), fbm(uv * 1.3 + vec2(-t * 0.8, t) + 3.7));',
          '  float m = fbm(uv * 1.1 + q * 2.0 + vec2(0.0, uP * 3.0 - t));',
          // as cores mudam com o scroll: vinho, depois noite violeta, depois ouro e rosa no coração
          '  vec3 a1 = vec3(0.42, 0.06, 0.14); vec3 a2 = vec3(0.20, 0.07, 0.32); vec3 a3 = vec3(0.55, 0.16, 0.30);',
          '  vec3 b1 = vec3(0.70, 0.50, 0.20); vec3 b2 = vec3(0.35, 0.22, 0.60); vec3 b3 = vec3(0.95, 0.55, 0.45);',
          '  vec3 c1 = mix(mix(a1, a2, smoothstep(0.25, 0.55, uP)), a3, smoothstep(0.7, 0.95, uP));',
          '  vec3 c2 = mix(mix(b1, b2, smoothstep(0.25, 0.55, uP)), b3, smoothstep(0.7, 0.95, uP));',
          '  vec3 cor = mix(c1, c2, smoothstep(0.45, 0.85, m));',
          // cortinas verticais, como uma aurora, a ondular devagar
          '  float cortina = pow(0.5 + 0.5 * sin(vUv.x * 5.0 + q.x * 3.0 + t * 3.0), 3.0) * smoothstep(1.05, 0.25, vUv.y) * smoothstep(-0.1, 0.5, vUv.y);',
          '  float forca = (0.4 * m + 0.5 * cortina * m + 0.15 * uMorph) * clamp(uAcender, 0.2, 1.6);',
          '  float vinheta = smoothstep(1.25, 0.25, length((vUv - 0.5) * vec2(1.3, 1.0)));',
          '  vec3 fundo = vec3(0.051, 0.024, 0.035);',
          '  gl_FragColor = vec4(fundo + cor * forca * vinheta, 1.0);',
          '}',
        ].join('\n'),
        depthTest: false, depthWrite: false,
      });
      cenaA.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matA));
      aurora = { r: rendA, cena: cenaA, cam: camA, mat: matA, div: 6 };
    } catch {
      aurora = null; // sem aurora, fica o fundo escuro e as luzes em css
    }
  }

  var pontos = new THREE.Points(geo, mat);
  pontos.frustumCulled = false;
  cena.add(pontos);

  function medir() {
    var w = window.innerWidth; var h = window.innerHeight;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    baseFov = w < h ? 70 : 58; // mais aberta no telemóvel em pé
    camara.fov = baseFov + ultPul * 9;
    camara.updateProjectionMatrix();
    tamBase = Math.min(1.35, Math.max(0.85, h / 800));
    mat.uniforms.uTam.value = tamBase;
    mat.uniforms.uAlto.value = w < h ? 4.6 : 6.4; // em pé o coração fica mais alto, por cima das palavras
    if (aurora) {
      aurora.r.setSize(Math.max(32, Math.round(w / aurora.div)), Math.max(32, Math.round(h / aurora.div)), false);
      aurora.mat.uniforms.uAsp.value = w / h;
    }
  }
  medir();
  window.addEventListener('resize', medir);

  // ---- a câmara anda com o scroll, com suavidade; o rato (ou o dedo) inclina-a um pouco ----
  var alvoP = 0; var p = 0; var ultScroll = window.scrollY; var vel = 0; var roll = 0; var velSuave = 0; var calmoAtual = false;
  var mx = 0; var my = 0; var sx = 0; var sy = 0;
  window.addEventListener('pointermove', function (e) { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; }, { passive: true });
  function progresso() {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return Math.min(1, Math.max(0, window.scrollY / max));
  }

  // qualidade que se ajusta sozinha: se a imagem engasgar, baixa a resolução e tira pontos
  var lentos = 0; var ultimo = performance.now(); var nivel = 0;
  function ajustar(dt) {
    if (dt > 26) lentos++; else if (lentos > 0) lentos -= 0.5;
    if (lentos > 40 && nivel < 2) {
      nivel++; lentos = 0;
      renderer.setPixelRatio(nivel === 1 ? 1.25 : 1);
      geo.setDrawRange(0, Math.floor(N * (nivel === 1 ? 0.75 : 0.5)));
      if (aurora) aurora.div = nivel === 1 ? 8 : 11;
      medir();
    }
  }

  var vivo = true;
  document.addEventListener('visibilitychange', function () { vivo = document.visibilityState === 'visible'; if (vivo) { ultimo = performance.now(); requestAnimationFrame(frame); } });

  function frame(agora) {
    if (!vivo) return;
    var dt = agora - ultimo; ultimo = agora;
    ajustar(dt);
    var t = agora / 1000;

    alvoP = progresso();
    p += (alvoP - p) * Math.min(1, dt / 220);
    var dy = window.scrollY - ultScroll; ultScroll = window.scrollY;
    vel += (dy - vel) * 0.12;
    roll += ((-vel * 0.0016) - roll) * 0.08;

    sx += (mx - sx) * 0.05; sy += (my - sy) * 0.05;
    var z = -COMPRIMENTO * p;
    camara.position.set(sx * 3.2 + Math.sin(t * 0.21) * 0.6, -sy * 2.2 + Math.cos(t * 0.17) * 0.5, z);
    camara.rotation.set(-sy * 0.05, -sx * 0.08, roll);
    camara.updateMatrixWorld();

    // o "soco de câmara": a lente abre e as estrelas crescem um instante a cada cena nova
    var pul = estado.pulso || 0;
    if (Math.abs(pul - ultPul) > 0.002) {
      ultPul = pul;
      camara.fov = baseFov + pul * 9;
      camara.updateProjectionMatrix();
      mat.uniforms.uTam.value = tamBase * (1 + pul * 0.45);
    }
    var morph = estado.coracao ? estado.coracao.p : 0;
    mat.uniforms.uMorph.value = morph;
    mat.uniforms.uTempo.value = t;
    mat.uniforms.uCam.value.copy(camara.position);
    mat.uniforms.uRodar.value = t * 0.35;
    mat.uniforms.uBater.value = morph > 0.9 ? 1 + 0.05 * Math.max(0, Math.sin(t * 4.2)) + 0.012 * Math.sin(t * 1.3) : 1;

    // "velocidade de dobra": a descer depressa, as estrelas crescem e brilham mais
    velSuave += (Math.min(1, Math.abs(vel) / 45) - velSuave) * 0.08;
    mat.uniforms.uVel.value = velSuave;
    // modo calmo: menos estrelas desenhadas e a aurora em resolução mais baixa
    var querCalmo = !!estado.calmo;
    if (querCalmo !== calmoAtual) {
      calmoAtual = querCalmo;
      geo.setDrawRange(0, Math.floor(N * (querCalmo ? 0.35 : (nivel === 1 ? 0.75 : nivel === 2 ? 0.5 : 1))));
      if (aurora) { aurora.div = querCalmo ? 12 : 6; medir(); }
    }
    var aceso = estado.acender == null ? 1 : estado.acender;
    mat.uniforms.uAcender.value = aceso;
    if (aurora) {
      var ua = aurora.mat.uniforms;
      ua.uT.value = t; ua.uP.value = p; ua.uAcender.value = aceso; ua.uMorph.value = morph;
      ua.uRato.value.set(sx, -sy);
      aurora.r.render(aurora.cena, aurora.cam);
    }
    renderer.render(cena, camara);
    requestAnimationFrame(frame);
  }
  document.body.classList.add('gl');
  if (aurora) document.body.classList.add('aurora');
  requestAnimationFrame(frame);
  window.CINEMA_ATIVO = true;
})();
