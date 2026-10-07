---
data: 07-10-2026
projeto: JurisLeo
branch: claude/intelligent-goldberg-s0lmvv
estado: tudo publicado em https://jurisleo-67124.web.app (versão 2026-10-09)
---

# Handoff final, 07-10-2026

Este ficheiro substitui, na parte do estado atual, a secção "Deploy: não foi feito" de `handoff-07-10-2026.md` (esse continua válido para o desenho dos jogos, do boneco e do modo estudo). Lê este primeiro.

## 1. Estado numa frase

A app está **publicada e a funcionar**, com jogos, modo story, boneco, consola `/admin` (resumos que a Leonor decide partilhar), login automático, avisos de versão nova com tutorial por aparelho, e uma **página-surpresa** só dela. O Firebase (`firebase.json`, regras, índices, `.firebaserc`, coleções) **não foi alterado**.

## 2. O que existe e onde

### App (React 19 + Vite + Firebase, PWA)
| Área | Onde | Notas |
|---|---|---|
| Jogos (4 minijogos, estilo tribunal) | `src/components/jogos/`, `src/services/jogos*.js`, `src/data/jogos.js` | Perfil, recordes e série só em localStorage |
| Modo story (flashcards) | `src/components/estudo/` | Principal; feed/pilha/processo são alternativas |
| Boneco do Vini | `src/components/boneco/`, `src/data/boneco.js`, `src/services/boneco.js` | 500+ frases na voz do Vini; "Estou mesmo mal" sem piadas e com linhas de apoio verificadas |
| Frequências no boneco | `src/services/frequenciaProxima.js` | Lê eventos `tipo: 'frequencia'` uma vez por dia, só quando vai falar |
| Check-in "como estás hoje" | `useVersaoNova.js` + `checkInPendente` | Depois de ela fechar as novidades, 20 min ou 3 min depois de estudar |
| Aviso de versão nova + tutorial | `src/components/atualizacao/`, `src/services/atualizacao.js` | Escolha iPhone / Android / Computador; iPhone mais detalhado |
| Login automático | `src/services/sessao.js`, `destinoLogin.js`, `Login.jsx`, `SplashScreen.jsx` | Usa a sessão que o Firebase já guarda; campos com autocomplete para o chaveiro do iCloud |
| Rotas | `src/App.jsx` | `/admin`, `/admin/boneco`; endereços inexistentes voltam a `/` |
| Partilhar com o Vini (lado dela) | `src/components/definicoes/PartilharComOVini.jsx` | Em Definições, Os meus dados. Tudo desligado por omissão |
| Consola `/admin` (lado dele) | `src/pages/Admin.jsx`, `src/services/resumoParaVini.js`, `armazemResumos.js` | Cartões do último resumo + lista com detalhe. Cola-se o texto que ela manda. Guarda só em localStorage |
| Notificações push de versão nova | `public/push-sw.js`, `src/services/notificacoes.js`, `src/components/definicoes/AvisosDeVersao.jsx`, `src/data/push.js` | Ver secção 5 (falta um segredo) |
| Cópia/restauro de dados locais | `src/services/copiaLocal.js` | Reinstalar a PWA no iPhone apaga localStorage |

### Página-surpresa (para a Leonor, via QR)
- Endereço: `https://jurisleo-67124.web.app/s/titsvdzkihyi/` (escondido, `noindex`, fora da cache da app, sem login).
- Ficheiros: `public/s/titsvdzkihyi/` (`index.html`, `estilo.css`, `app.js`, `conteudo.js`, `fotos/01..18.jpg`). O GSAP é copiado do `node_modules` no build (plugin em `vite.config.js`), não está no repositório.
- **Todo o texto e todas as legendas estão em `conteudo.js`**: trocar lá e fazer deploy. Fotos em `fotos/` (já sem EXIF).
- Cenas: título que cresce, frases fixas do "dia difícil", duas películas horizontais ("Nós" com 11 fotos, "Tu" com 7), palavras em máscara, cartas "Abre quando...", razões uma a uma, texto longo, final com estrelas a formar um coração. Respeita "reduzir movimento" (layout em coluna).
- Nomes usados: Leonor, Necas, Nô, bebé, princesa.
- **Atualização de 07-10-2026 (noite):** prólogo antes do genérico (`prologo.js`: folha manuscrita com tentativas riscadas e notas na margem, a folha vira avião de papel, "Sei que me pediste uma carta, mas acho que isto devia ser algo mais especial" com letras que se formam). Partes novas em `extra.js`: frases do Vini (cada uma com animação própria), Nível 2 quiz, Nível 3 constelação (balança), Nível 4 raspadinhas (vales), Capítulo V "O nosso código" com assinatura com o dedo e carimbo, abraço à distância (carregar 3 s), contagem das estrelas (promessa da margem do prólogo), e a carta no fim com "Prometido é devido". Efeitos globais: títulos que se formam e desfazem com o scroll, blocos que entram e saem, inclinação com a velocidade, aurora WebGL no fundo (`cinema.js`), Lenis só com rato. Bibliotecas novas copiadas no build: plugins do GSAP (SplitText, ScrambleText, DrawSVG, MotionPath, Physics2D) e `lenis` (devDependency). `localStorage`: `surpresa-vales` e `surpresa-codigo` (assinatura dela).
- QR e cartão de impressão (A6, PDF e PNG): gerados fora do repositório (`scratchpad` da sessão); o QR codifica o endereço acima. Se o endereço mudar, é preciso gerar outro.
- **Não gera aviso nenhum**: a versão da app (`2026-10-09`) não mudou ao publicar. Mantém assim enquanto for surpresa.

## 3. Como publicar (já não depende do PC dele)

O deploy corre no **GitHub Actions** (`.github/workflows/deploy.yml`):
1. O workflow dispara quando o ficheiro `.github/deploy-trigger.txt` muda na branch `claude/intelligent-goldberg-s0lmvv` (o botão "Run workflow" só aparece se o ficheiro estiver na branch principal).
2. Passos: `npm ci`, `npm test`, `npm run build` (falha se faltarem chaves `VITE_FIREBASE_*`), confirma que a chave ficou embebida, `firebase deploy --only firestore,hosting`, e, se a versão mudou, tenta mandar o push.
3. Para pedir um deploy: escrever uma linha nova em `.github/deploy-trigger.txt`, commit e push.
4. Depois: confirmar `https://jurisleo-67124.web.app/versao.json`. O estado do GitHub Actions pode demorar uns minutos a atualizar na API.
5. **Regra (CLAUDE.md, ponto 9):** se o deploy acrescenta funcionalidades à app, **acrescentar uma entrada nova no topo de `src/data/novidades.js`** (nova `versao`). Deploys só de correções ou só da página-surpresa **não** mexem aí.

Segredos do repositório (GitHub, Settings, Secrets and variables, Actions): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `FIREBASE_SERVICE_ACCOUNT` (JSON da conta de serviço), `VAPID_PRIVATE_KEY`. Falta `PUSH_SUBSCRIPTION` (ver abaixo).

A conta de serviço precisou dos papéis: Firebase Admin, Service Usage Consumer, Firebase Rules Admin, Firebase Hosting Admin, Cloud Datastore Index Admin.

## 4. O que correu mal e já está resolvido (para não repetir)

- **Ecrã branco após o primeiro deploy:** o build foi feito sem o `.env`, a app ficou com `apiKey: undefined`. Agora `vite.config.js` **falha o build** se faltarem chaves, e o `main.jsx` mostra um ecrã de erro em vez de branco.
- **`/admin` em branco:** o endereço certo era `/admin/boneco`; agora `/admin` é a consola e endereços inexistentes voltam ao início.
- **YAML do workflow inválido** (dois pontos num `run:`): usar sempre bloco `|`.
- **`git push` com "Internal Server Error" do GitHub** (acontece em intermitência): repetir; se persistir, enviar ficheiros de texto pela API (`push_files`). Ficheiros binários (fotos) só passam por `git push`.
- **O service worker apanhava a página-surpresa** (fallback das rotas): excluída com `globIgnores` e `navigateFallbackDenylist` em `vite.config.js`.
- **`animation-fill-mode: both`** criava contextos de empilhamento e escondia overlays por trás da navbar; usar `backwards`.
- **`pkill -f` mata a shell**: não usar; arrancar servidores com `nohup ... &`.

## 5. Pendente (por ordem de importância)

1. **Testar tudo no iPhone da Leonor** (a única coisa que não se consegue testar daqui): atualizar a app com o tutorial; fechar e abrir para ver se **entra sem pedir o email**; abrir a página-surpresa pelo QR no Safari e ver se o scroll horizontal e a barra do Safari se portam bem.
2. **Fechar as notificações:** ela liga em Definições, Os meus dados, "Avisos de versão nova", e manda o código ao Vini; ele cola-o na `/admin`, copia o resultado para o segredo `PUSH_SUBSCRIPTION`. Só depois disso o deploy manda push. Não testado em iPhone (iOS 16.4+, app no ecrã principal, ela tem de tocar em Permitir).
3. **Conferir as perguntas dos jogos** com o Código Civil, CPA, CVDT e o manual: foram escritas pelo assistente com `fonte`; só alguns artigos foram verificados online (148.º CPA, 498.º/1, 402.º, 562.º, 566.º/1, 1717.º CC, 26.º e 53.º CVDT). **1722.º CC não foi verificado.**
4. **Página-surpresa:** confirmar as legendas das fotos (escritas só com o que se vê), acrescentar datas e sítios, personalizar o texto longo com factos reais, decidir mais cartas "Abre quando...". Sem música (decisão dele).
5. **Apagar do PC dele** o ficheiro `.json` da conta de serviço (só deve existir no GitHub).
6. **Ideias opcionais para a `/admin`**, sempre como interruptor dela: faltas por cadeira, estado da avaliação, frequência mais próxima, quantidade de notas.
7. Sincronizar a consola de frases do boneco (`/admin/boneco`) entre aparelhos exigiria um campo opcional no Firestore: **não fazer sem OK explícito** (regra dele: não mexer no Firebase).

## 6. Decisões e limites (respeitar)

- **Firebase intocado** (config, regras, índices, coleções). Só campos opcionais em documentos existentes, e hoje nem isso.
- **Privacidade:** a `/admin` mostra **só o que a Leonor decide mandar**, quando carrega em enviar. Foi pedido um painel com "tudo o que ela faz e como está" sem ela saber; **foi recusado** por ser vigilância; a solução acordada é a partilha com consentimento dela. Não alterar isto sem ela saber. O boneco continua privado, com "não é o Vini a sério" visível.
- Sem chaves privadas no cliente (a pública das notificações vai no código, a privada só nos segredos do GitHub).
- Frases do Vini sempre na voz dele (primeira pessoa), sem travessões nem emojis. Tom para a Leonor: carinhoso; o texto dela é formal só nas matérias de Direito.
- Deploy só quando ele pede. Previews (3 ou 4 opções) antes de decisões visuais. Hardware dele é fraco: sem Three.js, Flutter, Remotion.
- Datas sempre em DD-MM-AAAA.

## 7. Verificação feita nesta sessão

389 testes (`npm test`) e lint sem erros; build com chaves de teste; no site publicado: `versao.json` = `2026-10-09`, login abre, `/admin` abre, endereços inexistentes voltam ao início, página-surpresa abre com 18 fotos e sem erros; QR do cartão lido com um leitor e leva ao endereço certo.

## 8. Mensagens de commit relevantes (resumo)

Jogos e story, boneco e frases, aviso de versão nova, cópia local, `/admin` e partilha com o Vini, notificações push (base), login automático, tutorial por aparelho, GitHub Action de deploy, página-surpresa (cenas de cinema e fotos). A história completa está em `git log` desta branch.


## 9. Atualização: página-surpresa em modo cinema (07-10-2026, fim de sessão)

- **Endereço do QR:** `https://jurisleo-67124.firebaseapp.com/s/titsvdzkihyi/` (domínio `firebaseapp.com`, não `web.app`). Motivo: quem já abriu o site `web.app` no Safari tem lá guardada a versão antiga da app, que apanhava este endereço e mostrava a dashboard. Noutro domínio isso não acontece. O cartão de impressão v2 já aponta para este endereço.
- **Camadas:** `cinema.js` (Three.js 0.160.1, módulo ES): milhares de estrelas num túnel por onde a câmara voa com o scroll, e no fim juntam-se num coração 3D (morph feito no shader com duas posições por ponto). Qualidade ajusta-se sozinha; sem WebGL ou com `?semgl` cai no céu 2D de `app.js`. GSAP/ScrollTrigger fazem as cenas; anime.js 3.2.2 faz os traços SVG e as entradas elásticas.
- **Bibliotecas** (`gsap`, `ScrollTrigger`, `three.module.min.js`, `anime.min.js`) **não estão no repositório**: o plugin `copiarBibliotecasDaSurpresa` em `vite.config.js` copia-as do `node_modules` no build. `three` e `animejs` estão em `devDependencies`.
- **Ordem das cenas fixas:** o GSAP calcula o espaço das cenas fixas pela ordem em que os ScrollTriggers são criados. Criar sempre na ordem em que as cenas aparecem na página (os cartões de capítulo têm de ser criados junto à cena que antecedem), senão as cenas sobrepõem-se.
- **Conteúdo** todo em `conteudo.js`: legendas, frases (TVD, HIMYM, Gossip Girl, Sex and the City, todas confirmadas online), jogo da memória, cartas "Abre quando", razões, texto longo, genérico de abertura, capítulos e créditos finais.
- **Fluxo:** cortina "Toca para começar" (espera pelas fotos) > genérico de abertura (com "passar") > título com apelidos a rodar > Dia difícil > Cap. I Nós (película) > Cap. II Tu (película) > Cap. III Frases > palavras em máscara > cartas > razões > Cap. IV Jogo > Cap. V Carta > final com coração 3D > créditos > FIM. Cerca de 61 ecrãs de scroll.
- **Sem avisos:** a versão da app continua `2026-10-09`; as atualizações desta página não mexem em `novidades.js`.
- **Testado** em Chromium (telemóvel e computador) com WebGL por software; **não testado num iPhone real** (a Leonor tem iPhone 14). Se alguma cena engasgar, reduzir `N` e o `pixelMax` em `cinema.js`.
- Pendente: data de início da relação para um contador de "dias juntos" (opcional).
