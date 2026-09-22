# JURISLEO — ESPECIFICAÇÃO COMPLETA DE CONCLUSÃO

**Versão:** 2.0 (completa) · secções 3, 9 e 10 alinhadas com o código em 18-09-2026
**Data:** 16-09-2026
**Para:** Claude Code
**Repositório:** `git@github.com:MVini16/JurisLeo.git`
**Pasta local:** `~/programacao/projetos/jurisleo`
**Produção:** `jurisleo-67124.web.app`

---

## ÍNDICE

1. Missão e enquadramento
2. Bloco de personalização (preencher antes de começar)
3. Estado atual do código e dívida técnica
4. Regras de ouro
5. Dados oficiais da FDUL
6. Motor de avaliação — especificação e casos de teste
7. Motor de faltas — especificação e casos de teste
8. Arquitetura de ficheiros
9. Modelo de dados Firestore e regras de segurança
10. Sistema de design (tokens)
11. Rotas e navegação
12. Contratos dos componentes partilhados
13. Dicionário de erros e mensagens
14. Funcionalidades — especificação por ecrã
15. Camada de ajuda
16. Camada de mimo
17. Animações
18. PWA, offline e notificações no iPhone
19. Exportação e backup
20. Desempenho, acessibilidade e convenções
21. O que não fazer
22. Fases de trabalho e critérios de aceitação
23. Assistente de IA (não implementar)
24. Critérios de conclusão

---

## 1. MISSÃO E ENQUADRAMENTO

Esta app não é um produto. É uma prenda.

Foi construída por um namorado (o Vini) para a namorada, a **Leonor**, estudante do **2.º ano da Licenciatura em Direito da Faculdade de Direito da Universidade de Lisboa**, ano letivo **2026/2027**. Ela é a única utilizadora que vai existir.

### Consequências práticas

**Faz:**
- Assume uma única utilizadora. Sem multi-tenant, sem convites, sem partilha, sem planos, sem papéis.
- Interface toda em português de Portugal, na segunda pessoa, dirigida a ela.
- Trata o mimo (mensagens, celebrações, animações) como funcionalidade de primeira classe, com o mesmo cuidado de engenharia que o motor de notas.
- Optimiza para o cenário real: 23h30, cansada, uma mão, iPhone, sofá, às vezes sem net numa sala de aula.
- Assume que ela não é técnica e nunca leu documentação nenhuma.

**Não faz:**
- Ecrãs de subscrição, onboarding comercial, analytics, cookie banners, termos de serviço, página "sobre".
- Linguagem de app genérica. Proibido: "Bem-vindo ao seu dashboard", "Gerencie as suas tarefas", "Nenhum item encontrado".
- Funcionalidades para um utilizador futuro hipotético. Se não serve a Leonor, não entra.
- Inventar dados pessoais dela. Ver secção 2.

---

## 2. BLOCO DE PERSONALIZAÇÃO (PREENCHER ANTES DE COMEÇAR)

> ⚠️ **REGRA ABSOLUTA**
> Se um campo estiver `[A PREENCHER]`, **não inventes**. Escreve no código a string literal `[A PREENCHER]` com o comentário `// todo: pedir ao vini` e continua. Uma frase inventada destrói o efeito inteiro. É melhor um placeholder visível do que uma mentira simpática.

```
NOME:                                         Leonor
ALCUNHA (como ele lhe chama):                 [A PREENCHER]
COMO ELA LHE CHAMA:                           [A PREENCHER]
ANIVERSÁRIO DELA:                             [A PREENCHER]
DATA EM QUE COMEÇARAM A NAMORAR:              [A PREENCHER]
COR PREFERIDA:                                [A PREENCHER]
COR QUE ELA ODEIA:                            [A PREENCHER]
O QUE A STRESSA MAIS NA FACULDADE:            [A PREENCHER]
SÉRIES / MÚSICA / PERSONAGENS FAVORITAS:      [A PREENCHER]
PIADAS INTERNAS / FRASES QUE REPETEM:         [A PREENCHER]

TURMA NA FDUL:                                TA (Turma A)                    ✅
SUBTURMA:                                     7                               ✅
OPTATIVA ESCOLHIDA:                           História das Relações Internacionais  ✅
MÉTODO POR CADEIRA:                           Método A nas cinco cadeiras     ✅
HORÁRIO SEMANAL:                              ver secção 5.4                  ✅
AULAS PRÁTICAS PREVISTAS POR CADEIRA:         30 (2 por semana, 15 semanas)   ✅
COMO ESTUDA:                                  sebentas e casos práticos, no PC ✅
JANELAS DE ESTUDO:                            manhãs livres, aulas 14h-18h de 2ª a 6ª sem furos ✅

NOTAS DO 1.º ANO (só os números, para a média):  [A PREENCHER]
DOCENTES DAS PRÁTICAS:                        [A PREENCHER]
MANUAIS POR CADEIRA:                          [A PREENCHER]
DATAS DAS FREQUÊNCIAS:                        ainda não saíram, janela oficial 30/11 a 18/12
```

**Os campos académicos bloqueantes estão resolvidos.** A Fase 1 pode avançar. Os campos pessoais no topo continuam em falta e valem para a Fase 6 (camada de mimo), não bloqueiam antes disso.

---

## 3. ESTADO ATUAL DO CÓDIGO (auditado em 18-09-2026)

> Esta secção foi reescrita a partir de `docs/ESTADO-REAL.md`. A versão original, de 03-05-2026, estava desatualizada: quase tudo o que aí figurava como placeholder já foi construído.

### 3.1 Stack em uso

React 19 + Vite · Firebase (Auth Email/Password, Firestore com cache offline persistente, Hosting) · React Router DOM · CSS puro com variáveis (`src/index.css`) · Context API para tema · `vite-plugin-pwa` · Vitest. Fonte atual: Georgia (ver secção 10).

### 3.2 Inventário do que existe

| Ficheiro | Estado |
|---|---|
| `src/services/firebase.js` | Funciona. Config via `VITE_*` do `.env`. Firestore com `persistentLocalCache` |
| `src/services/initFirestore.js` | Movido para `services/`. Seed com as 5 cadeiras do 2.º ano. Exporta `seedCadeiras` e `limparCadeirasAntigas` |
| `src/services/auth.js` | Funciona. `registar()`, `login()`, `logout()`, erros em PT |
| `src/services/initCalendario.js` | Funciona. Gera `aulasSemanais` a partir de `horarioS1` e um evento de frequência indicativo |
| `src/services/avaliacao.js` + `.test.js` | **Motor feito**, função pura. Exporta `arredondar`, `calcularNotaAC`, `avaliarCadeira`, `simularNotaNecessaria`, `calcularMediaAnual`, `escalaQualitativa` |
| `src/services/faltas.js` + `.test.js` | **Motor feito**, função pura, `estadoFaltas`. Não segue ainda o ponto 7.4 (ver 3.4) |
| `src/services/repeticaoEspacada.js` + `.test.js` | Feito (flashcards) |
| `src/services/exportar.js` | Feito. Exporta tudo para `.json` |
| `src/context/ThemeContext.jsx` | Funciona. Dark/light em `localStorage` **e** em `configuracoes/dados.tema` (com `useRef` anti-ciclo) |
| `src/components/NavBar.jsx` | Funciona. Menu + com 8 itens, sidebar no desktop, tab bar no mobile |
| `src/components/ModalCriarEvento.jsx` | Cria **e edita** (preenche os campos com `eventoExistente`) |
| `src/components/Celebracao.jsx`, `EcraConsolo.jsx`, `MensagemCarinhosa.jsx` | Feitos, ligados à página da cadeira |
| `src/components/BotaoAjuda.jsx`, `DicaPrimeiraVez.jsx`, `BotaoVoltar.jsx`, `Tutorial.jsx` | Feitos |
| `src/pages/SplashScreen.jsx`, `Login.jsx` | Completas |
| `src/pages/Onboarding.jsx` | 6 ecrãs, easter egg em 3 fases. Guarda o tema em `configuracoes/dados`. **Ecrã 4 (horário) e ecrã 6 (notas anteriores) continuam placeholders** |
| `src/pages/Dashboard.jsx` | Ligada ao Firestore por `useDashboard` e `useTarefas`. Mostra aulas de hoje, tarefas e frequência. **Falta "aula de agora e seguinte"** |
| `src/pages/Calendario.jsx` | 4 vistas, modal de detalhes, editar e apagar. Eventos com uma só `data` |
| `src/pages/Tarefas.jsx` | **Completa** e ligada ao Firestore (criar, editar, concluir, apagar, filtros, agrupamento) |
| `src/pages/Horario.jsx` | Grelha semanal só de leitura, a partir de `dadosLeonor.js` |
| `src/pages/Cadeiras.jsx` | Lista com semáforo de faltas e estado de avaliação |
| `src/pages/Cadeira.jsx` | Formulário de notas e faltas ligado aos motores; celebração e consolo. **Sem tabs** |
| `src/pages/Perfil.jsx` | Dados, tema, logout, rever tutorial, ajuda, exportar, reparar cadeiras |
| `src/pages/Anotacoes`, `Anotacao`, `Casos`, `Caso`, `Estudo`, `Glossario`, `Artigos`, `Leituras`, `Pesquisa`, `Flashcards`, `Ajuda` | Feitas |
| `src/data/` | `dadosLeonor.js`, `motivosFalta.js`, `frases.js`, `ajuda.js` |
| `src/styles/` | Só `imprimir.css` |

### 3.3 Dívida técnica da Fase 0

| # | Item | Estado |
|---|---|---|
| 1 | Mover `initFirestore.js` para `services/` | ✅ feito |
| 2 | `ModalCriarEvento` preencher ao editar | ✅ feito |
| 3 | Ligar as opções do menu + | ⚠️ parcial: Nova Tarefa, Anotação, Caso, Estudo e Frequência funcionam. **Oral de Melhoria, Registar Falta e Lançar Nota só navegam para `/cadeiras`** (a `Cadeiras.jsx` não lê `state.abrirModal`) |
| 4 | Dashboard com dados reais | ✅ feito (nome, frase, aulas, tarefas, countdown) |
| 5 | Onboarding guardar o tema no Firestore | ✅ feito |
| 6 | Seed do 1.º ano → 2.º ano | ✅ feito |
| 7 | Ecrãs 4 e 6 do Onboarding | ❌ continuam placeholders |
| 8 | Regras do Firestore | ✅ endurecidas e publicadas; `firebase.json` referencia regras e índices |

### 3.4 O que ainda não existe, ou difere do resto desta spec

- **Ficheiros de dados em falta:** `calendarioEscolar.js`, `planoEstudos2Ano.js`, `feriados.js`, `erros.js`. As datas do 1.º semestre existem só como `calendarioS1` dentro de `dadosLeonor.js`.
- **Páginas em falta:** `/notas`, `/faltas`, `/frequencia`, `/assistente`. `Cadeira.jsx` não tem tabs. `Horario.jsx` não mostra docente, não edita e não tem vista de hoje.
- **Componentes em falta:** `ModalBase`, `Toast`, `EstadoVazio`, `SemaforoFaltas`, `ArvoreAvaliacao`, `EditavelNoSitio`, `BotaoMotivacao`, `IndicadorOffline` e outros da secção 12.
- **Calendário:** não há `estadoAula`, famílias de eventos, `dataInicio`/`dataFim`, deteção de choques, feriados nem épocas de exames. `aulasPraticasLecionadas` é um número editado à mão em `Cadeira.jsx`.
- **`simularNotaNecessaria` e `calcularMediaAnual`** existem no motor mas nenhuma página os usa.
- **Motor de faltas vs. ponto 7.4:** `estadoFaltas` calcula `faltasRestantes` sobre as aulas lecionadas e o semáforo assenta nisso. A secção 5.4.1 pede o número principal sobre as 30 previstas e nunca vermelho antes de metade do semestre só pela proporção corrente. **A resolver na Fase 3.**
- **Inconsistência interna desta spec, caso 25 (secção 6.5):** a tabela diz `excluida` com nota 10, o texto ao lado diz "aprovada com 10". O código segue o texto (média arredondada) e está marcado como caso limite. **A confirmar com o Vini e a Leonor.**
- **Inconsistência interna desta spec, faltas — não é um conflito real (fechado em 22-09-2026):** a tabela 7.5 usa 26 aulas previstas, a secção 5.4 usa 30. `estadoFaltas` é uma função pura que recebe `aulasPraticasPrevistas` como parâmetro — não há um número "certo" fixo no motor. `faltas.test.js` usa 26 só porque divide bem por quarto e metade nos casos de teste, sem pretender ser o número real de nenhuma cadeira. `dadosLeonor.js` (a fonte de verdade das cadeiras reais, por regra do `CLAUDE.md`) usa 30 para todas as cadeiras do 2.º ano — é esse o número que a app usa de facto para a Leonor.
- **Modelo de dados:** a secção 9 descreve o que está em produção. As coleções `notas`, `faltas`, `aulas`, `sumarios`, `mensagensDele` e `feedback` da versão original **não existem**.
- **Intervalos dos flashcards — resolvido em 22-09-2026:** a secção 14.7 diz 1, 3, 7, 16 e 35 dias; o código tinha ficado com 1, 2, 4, 7 e 15 por engano. Corrigido `repeticaoEspacada.js` para seguir a spec (1, 3, 7, 16, 35).
- **Banco de frases:** `frases.js` tem cerca de 120 frases organizadas em 8 contextos (geral, madrugada, pós-nota-boa, pós-nota-excelente, pós-nota-baixa, sessão-longa, faltas-apertadas, antes-de-frequência). A secção 16.1 pede 150, com 6 tons, autoria "dele" e quotas por tom. O formato e as quotas ainda não existem.
- **Sem traço no código:** botão "falta-me motivação", ecrã depois da 1h, aviso dos 90 minutos, modo "estou a passar-me", importador de backup, notificações push, dedicatória nos PDF, sebenta compilada, "algo está mal aqui" e `feedback`.
- **Secções 25 (registo de bem-estar) e 26 (consola do Vini):** não têm fase na secção 22 e nada disto existe no código. Ver 22.1.
- **Nomes reais do Firestore:** caminho `users/{uid}` (não `utilizadores`), aulas em `aulasSemanais` (não `aulas`), tema em `configuracoes/dados` (não em `preferencias`).

---

## 4. REGRAS DE OURO

1. **Não quebres o que funciona.** Splash, Login, Onboarding, easter egg, Dashboard e Calendário já agradam. Melhora incrementalmente.
2. **Português de Portugal em toda a interface.** Sem PT-BR, sem inglês visível ao utilizador.
3. **Comentários no código em letra minúscula**, curtos e diretos. Sem comentários óbvios.
4. **Hardware modesto no PC de casa** (HP Pavilion g6). Proibido: Three.js, WebGL, Framer Motion, GSAP pago, bibliotecas de animação pesadas, Lottie, Moment.js. Permitido: CSS transforms/transitions/keyframes, `requestAnimationFrame`, SVG inline, `date-fns` (tree-shakeable), `vite-plugin-pwa`.
5. **Animações só em `transform` e `opacity`.** Nunca `width`, `height`, `top`, `left`, `margin`. Sempre `will-change` com parcimónia. Sempre `prefers-reduced-motion` respeitado.
6. **Nunca commitar o `.env`.** Verifica o `.gitignore` antes do primeiro commit.
7. **Ao fim de cada fase:** `npm run build` → corrigir → `git commit` → `firebase deploy` → resumo de cinco linhas → **PARAR e esperar confirmação**.
8. **Se tiveres dúvida sobre uma regra da FDUL, sobre dados dela, ou sobre uma decisão visual: PÁRA E PERGUNTA.** Nunca assumas.
9. **Nunca inventes legislação, artigos, jurisprudência ou regras de avaliação.** Usa exclusivamente as secções 5 a 7 deste documento.
10. **Frases motivacionais têm de ser originais.** Não reproduzas falas de séries, filmes ou música (Suits, Gossip Girl, Grey's Anatomy, etc.). São material protegido. Se o código atual tiver frases copiadas de séries, substitui por originais com o mesmo espírito.
11. **Uma função, uma responsabilidade.** O motor de avaliação não toca no Firestore. Os componentes não calculam notas.
12. **Nada de `console.log` no código final.**

---

## 5. DADOS OFICIAIS DA FDUL (verificados em 16-09-2026)

### 5.1 `src/data/calendarioEscolar.js`

Fonte: Despacho 54/2026 do Diretor da FDUL, calendário escolar da Licenciatura 2026/2027.

```js
// datas oficiais do ano letivo 2026/2027, despacho 54/2026
// as épocas de exames são indicativas e podem mudar

export const ANO_LETIVO = '2026/2027';

export const calendarioEscolar = {
  inicioAnoLetivo: '2026-09-07',
  fimAnoLetivo: '2027-07-30',
  semanaIntegracao: { inicio: '2026-09-01', fim: '2026-09-04' },
  ferias: {
    natal: { inicio: '2026-12-21', fim: '2027-01-03' },
    pascoa: { inicio: '2027-03-22', fim: '2027-03-29' },
  },
  semestres: [
    {
      numero: 1,
      inicio: '2026-09-07',
      fim: '2027-02-19',
      aulas: { inicio: '2026-09-07', fim: '2026-12-18' },
      provasAvaliacaoContinua: { inicio: '2026-11-30', fim: '2026-12-18' },
      exames: {
        escritosEpocaNormal: { inicio: '2027-01-04', fim: '2027-01-19' },
        escritosCoincidencia: { inicio: '2027-01-21', fim: '2027-01-27', previsivel: true },
        oraisEpocaNormal: { inicio: '2027-01-22', fim: '2027-02-12' },
        recurso: { inicio: '2027-02-15', fim: '2027-02-19' },
        recursoCoincidencia: { inicio: '2027-02-22', fim: '2027-02-25', previsivel: true },
      },
    },
    {
      numero: 2,
      inicio: '2027-02-22',
      fim: '2027-07-30',
      aulas: { inicio: '2027-02-22', fim: '2027-05-28' },
      provasAvaliacaoContinua: { inicio: '2027-05-10', fim: '2027-05-28' },
      exames: {
        escritosEpocaNormal: { inicio: '2027-06-07', fim: '2027-06-25' },
        escritosCoincidencia: { inicio: '2027-06-28', fim: '2027-07-02', previsivel: true },
        oraisEpocaNormal: { inicio: '2027-06-28', fim: '2027-07-16' },
        recurso: { inicio: '2027-07-19', fim: '2027-07-23' },
        recursoCoincidencia: { inicio: '2027-07-26', fim: '2027-07-30', previsivel: true },
      },
    },
  ],
};
```

Em qualquer ecrã que use estas datas, mostra uma linha discreta: *"datas das épocas de exames são indicativas, confirma no site da faculdade"*.

### 5.2 `src/data/planoEstudos2Ano.js`

Fonte: Programas e Regentes 2026/2027 da Licenciatura, FDUL.

> ⚠️ **O currículo muda por turma.** A TA tem as optativas no 1.º semestre e Finanças Públicas no 2.º. A TB tem exactamente o contrário. Escolher a turma errada estraga o calendário, as faltas e as notas.

```js
// plano oficial do 2.º ano, 2026/2027
// atenção: a distribuição por semestre muda conforme a turma

export const planoEstudos2Ano = {
  TA: {
    nome: 'Turma A',
    semestre1: {
      obrigatorias: [
        { nome: 'Direito das Obrigações I', abrev: 'DO I', regente: 'Diogo Costa Gonçalves' },
        { nome: 'Direito da Família', abrev: 'DF', regente: 'Jorge Duarte Pinheiro' },
        { nome: 'Direito Administrativo I', abrev: 'DA I', regente: 'Paulo Otero' },
        { nome: 'Direito Internacional Público I', abrev: 'DIP I', regente: 'Carlos Blanco de Morais' },
      ],
      optativas: [
        { nome: 'História do Pensamento Jurídico', abrev: 'HPJ', regente: 'António Pedro Barbas Homem' },
        { nome: 'História das Relações Internacionais', abrev: 'HRI', regente: 'Margarida Seixas e Filipe de Arede Nunes' },
        { nome: 'Ciência Política', abrev: 'CP', regente: 'Luís Pereira Coutinho' },
        { nome: 'Direito Comparado', abrev: 'DComp', regente: 'Catarina Salgado' },
      ],
    },
    semestre2: {
      obrigatorias: [
        { nome: 'Direito das Obrigações II', abrev: 'DO II', regente: 'Diogo Costa Gonçalves' },
        { nome: 'Direito das Sucessões', abrev: 'DS', regente: 'Jorge Duarte Pinheiro' },
        { nome: 'Direito Administrativo II', abrev: 'DA II', regente: 'Paulo Otero' },
        { nome: 'Direito da União Europeia', abrev: 'DUE', regente: 'José Renato Gonçalves' },
        { nome: 'Finanças Públicas', abrev: 'FP', regente: 'Nazaré Costa Cabral' },
      ],
      optativas: [],
    },
  },

  TB: {
    nome: 'Turma B',
    semestre1: {
      obrigatorias: [
        { nome: 'Direito das Obrigações I', abrev: 'DO I', regente: 'Paula Costa e Silva' },
        { nome: 'Direito da Família', abrev: 'DF', regente: 'Margarida Silva Pereira' },
        { nome: 'Direito Administrativo I', abrev: 'DA I', regente: 'Vasco Pereira da Silva' },
        { nome: 'Direito Internacional Público I', abrev: 'DIP I', regente: 'Lourenço Vilhena Freitas' },
        { nome: 'Finanças Públicas', abrev: 'FP', regente: 'Nazaré Costa Cabral' },
      ],
      optativas: [],
    },
    semestre2: {
      obrigatorias: [
        { nome: 'Direito das Obrigações II', abrev: 'DO II', regente: 'Paula Costa e Silva' },
        { nome: 'Direito das Sucessões', abrev: 'DS', regente: 'Margarida Silva Pereira' },
        { nome: 'Direito Administrativo II', abrev: 'DA II', regente: 'Vasco Pereira da Silva' },
        { nome: 'Direito da União Europeia', abrev: 'DUE', regente: 'Maria José Rangel de Mesquita' },
      ],
      optativas: [
        { nome: 'História das Relações Internacionais', abrev: 'HRI', regente: 'Margarida Seixas e Filipe de Arede Nunes' },
        { nome: 'História do Pensamento Jurídico', abrev: 'HPJ', regente: 'Isabel Graes' },
        { nome: 'Ciência Política', abrev: 'CP', regente: 'Vitalino Canas' },
        { nome: 'Direito Comparado', abrev: 'DComp', regente: 'Dário Moura Vicente' },
      ],
    },
  },

  TAN: {
    nome: 'Turma Noite',
    semestre1: {
      obrigatorias: [
        { nome: 'Direito das Obrigações I', abrev: 'DO I', regente: 'João Espírito Santo' },
        { nome: 'Direito da Família', abrev: 'DF', regente: 'Catarina Salgado' },
        { nome: 'Direito Administrativo I', abrev: 'DA I', regente: 'Maria João Estorninho' },
        { nome: 'Direito Internacional Público', abrev: 'DIP', regente: 'Maria Luísa Duarte' },
      ],
      optativas: [
        { nome: 'História do Pensamento Jurídico', abrev: 'HPJ', regente: 'Isabel Graes' },
        { nome: 'História das Relações Internacionais', abrev: 'HRI', regente: 'Ana Fouto' },
        { nome: 'Ciência Política', abrev: 'CP', regente: 'Kafft Kosta' },
        { nome: 'Direito Comparado', abrev: 'DComp', regente: 'Catarina Salgado' },
      ],
    },
    semestre2: {
      obrigatorias: [
        { nome: 'Direito das Obrigações II', abrev: 'DO II', regente: 'João Espírito Santo' },
        { nome: 'Direito das Sucessões', abrev: 'DS', regente: 'Sofia Casimiro' },
        { nome: 'Direito Administrativo II', abrev: 'DA II', regente: 'Maria João Estorninho' },
        { nome: 'Direito da União Europeia', abrev: 'DUE', regente: 'Maria Luísa Duarte' },
        { nome: 'Finanças Públicas', abrev: 'FP', regente: 'Guilherme W. Oliveira Martins' },
      ],
      optativas: [],
    },
  },
};

// cores por cadeira: manter a identidade FDUL (bordô e dourado) como base
// e dar a cada cadeira uma cor própria para o calendário e os gráficos
export const coresCadeiras = {
  'DO I': '#7B1E2B', 'DO II': '#7B1E2B',
  'DF': '#B5838D',
  'DA I': '#1F3A5F', 'DA II': '#1F3A5F',
  'DIP I': '#2E6F5E', 'DIP': '#2E6F5E',
  'DUE': '#3D5A80',
  'DS': '#8E5572',
  'FP': '#C9843E',
  'HPJ': '#7D6B91', 'HRI': '#5C8374', 'CP': '#A4633A', 'DComp': '#4A6670',
};
```

### 5.4 `src/data/dadosLeonor.js` — DADOS REAIS CONFIRMADOS

Fonte: horário oficial da FDUL para Licenciatura 2026/2027, 2.º ano, S1, Turma A, alterado a 14-09-2026, cruzado com a página de Programas e Regentes 2026/2027.

**Turma A · Subturma 7 · cinco cadeiras, todas em Método A.**

```js
// dados reais da leonor, 1.º semestre de 2026/2027
// turma a, subturma 7, tudo em método a

export const dadosLeonor = {
  turma: 'TA',
  subturma: 7,
  anoLetivo: '2026/2027',
  ano: 2,
  semestreAtual: 1,
};

// as cinco cadeiras do 1.º semestre
// aulasPraticasPrevistas: 2 por semana x 15 semanas de aulas (07/09 a 18/12)
// confirmar com a leonor no fim de outubro, porque as provas de avaliação
// contínua podem ocupar tempos de aula
export const cadeirasS1 = [
  {
    id: 'administrativo-1', codigo: 'A',
    nome: 'Direito Administrativo I', abrev: 'DA I',
    regente: 'Paulo Otero',
    colaboradores: ['Domingos Farinho', 'João Tiago Silveira', 'Mafalda Carmona'],
    metodo: 'A', optativa: false, cor: '#1F3A5F',
    pesos: { provaEscrita: 0.5, outrosElementos: 0.5 },
    aulasPraticasPrevistas: 30, aulasTeoricasPrevistas: 30,
  },
  {
    id: 'dip-1', codigo: 'B',
    nome: 'Direito Internacional Público I', abrev: 'DIP I',
    regente: 'Carlos Blanco de Morais',
    colaboradores: ['Vasco Becker-Weinberg'],
    metodo: 'A', optativa: false, cor: '#2E6F5E',
    pesos: { provaEscrita: 0.5, outrosElementos: 0.5 },
    aulasPraticasPrevistas: 30, aulasTeoricasPrevistas: 30,
  },
  {
    id: 'obrigacoes-1', codigo: 'C',
    nome: 'Direito das Obrigações I', abrev: 'DO I',
    regente: 'Diogo Costa Gonçalves',
    colaboradores: ['David Oliveira Festas'],
    metodo: 'A', optativa: false, cor: '#7B1E2B',
    pesos: { provaEscrita: 0.5, outrosElementos: 0.5 },
    aulasPraticasPrevistas: 30, aulasTeoricasPrevistas: 30,
  },
  {
    id: 'familia', codigo: 'D',
    nome: 'Direito da Família', abrev: 'DF',
    regente: 'Jorge Duarte Pinheiro',
    colaboradores: [],
    metodo: 'A', optativa: false, cor: '#B5838D',
    pesos: { provaEscrita: 0.5, outrosElementos: 0.5 },
    aulasPraticasPrevistas: 30, aulasTeoricasPrevistas: 30,
  },
  {
    id: 'hri', codigo: 'F',
    nome: 'História das Relações Internacionais', abrev: 'HRI',
    regente: 'Filipe de Arede Nunes',
    // a página de programas lista também margarida seixas como regente da turma a
    colaboradores: ['Luís Cabral de Oliveira'],
    metodo: 'A', optativa: true, cor: '#5C8374',
    pesos: { provaEscrita: 0.5, outrosElementos: 0.5 },
    aulasPraticasPrevistas: 30, aulasTeoricasPrevistas: 30,
  },
];

// tempos letivos da fdul: 50 minutos, com intervalo entre o 2.º e o 3.º
export const temposLetivos = [
  { id: 1, inicio: '14:00', fim: '14:50' },
  { id: 2, inicio: '15:00', fim: '15:50' },
  { id: 3, inicio: '16:10', fim: '17:00' },
  { id: 4, inicio: '17:10', fim: '18:00' },
];

// horário completo: 20 aulas por semana, 10 teóricas e 10 práticas
// diaSemana: 1 = segunda ... 5 = sexta
export const horarioS1 = [
  // segunda
  { diaSemana: 1, tempo: 1, cadeiraId: 'dip-1',        tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 1, tempo: 2, cadeiraId: 'obrigacoes-1', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 1, tempo: 3, cadeiraId: 'obrigacoes-1', tipo: 'pratica', sala: '12.02' },
  { diaSemana: 1, tempo: 4, cadeiraId: 'administrativo-1', tipo: 'pratica', sala: '12.34' },

  // terça
  { diaSemana: 2, tempo: 1, cadeiraId: 'familia',      tipo: 'pratica', sala: 'Anf.9' },
  { diaSemana: 2, tempo: 2, cadeiraId: 'hri',          tipo: 'pratica', sala: 'Anf.9' },
  { diaSemana: 2, tempo: 3, cadeiraId: 'administrativo-1', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 2, tempo: 4, cadeiraId: 'hri',          tipo: 'teorica', sala: 'Anf.9' },

  // quarta
  { diaSemana: 3, tempo: 1, cadeiraId: 'dip-1',        tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 3, tempo: 2, cadeiraId: 'familia',      tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 3, tempo: 3, cadeiraId: 'dip-1',        tipo: 'pratica', sala: '12.02' },
  { diaSemana: 3, tempo: 4, cadeiraId: 'obrigacoes-1', tipo: 'pratica', sala: '12.02' },

  // quinta
  { diaSemana: 4, tempo: 1, cadeiraId: 'dip-1',        tipo: 'pratica', sala: '10.11' },
  { diaSemana: 4, tempo: 2, cadeiraId: 'familia',      tipo: 'pratica', sala: '12.32' },
  { diaSemana: 4, tempo: 3, cadeiraId: 'administrativo-1', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 4, tempo: 4, cadeiraId: 'hri',          tipo: 'teorica', sala: 'Anf.9' },

  // sexta
  { diaSemana: 5, tempo: 1, cadeiraId: 'familia',      tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 5, tempo: 2, cadeiraId: 'obrigacoes-1', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 5, tempo: 3, cadeiraId: 'hri',          tipo: 'pratica', sala: '12.04' },
  { diaSemana: 5, tempo: 4, cadeiraId: 'administrativo-1', tipo: 'pratica', sala: '12.34' },
];
```

#### 5.4.1 Consequências para a app, a ter em conta em todas as fases

**A semana está cheia.** Quatro tempos ocupados, de segunda a sexta, sem um único furo entre as 14h e as 18h. As únicas janelas de estudo são a manhã e depois das 18h. Isto tem três implicações de produto:

1. O Dashboard, aberto entre as 14h e as 18h, tem de mostrar **a aula de agora e a seguinte**, com sala. É o uso mais frequente da app.
2. O bloco de sumários de aula (14.5, ponto 28) é a funcionalidade com maior retorno real: ela sai com quatro aulas na cabeça todos os dias, e são cerca de 300 aulas no semestre.
3. Nada na app deve assumir que ela tem tempo livre durante a tarde. Sem notificações de estudo entre as 14h e as 18h.

**Método A nas cinco cadeiras faz das faltas o segundo motor mais importante.** Com 30 aulas práticas previstas por cadeira:

- Exclui com **8 ou mais faltas injustificadas** às práticas (um quarto de 30 é 7,5)
- Exclui com **15 ou mais faltas totais** às práticas (metade das previstas)
- **Limite prático a mostrar na app: 7 faltas injustificadas por cadeira no semestre**

> ⚠️ Cuidado com o denominador. A regra do quarto incide sobre as aulas **lecionadas**, e em setembro isso são três ou quatro aulas por cadeira. Nessa fase uma única falta já passa os 25% e o semáforo daria vermelho sem razão. Por isso:
> - **Número principal na app:** faltas que ainda pode dar no semestre, calculado sobre as 30 previstas
> - **Número secundário, informativo:** proporção atual sobre as lecionadas até hoje
> - **Nunca** dar alerta vermelho antes de metade do semestre com base só na proporção corrente

**Pares teórica e prática no mesmo dia.** Obrigações I tem teórica à segunda às 15h e prática às 16h10. DIP I tem teórica à quarta às 14h e prática às 16h10. A app deve destacar estes dois momentos como os melhores da semana para consolidar, e sugerir ali o sumário de aula.

**Cinco provas escritas de avaliação contínua** entre 30 de novembro e 18 de dezembro, com pelo menos um dia de intervalo entre provas do mesmo ano curricular. As datas concretas ainda não saíram. Até saírem, o countdown do Dashboard aponta para 30 de novembro com a etiqueta "janela das frequências".

**Ela estuda por sebentas e casos práticos, no computador.** Isto reordena as prioridades dentro da Fase 7 e 8: o editor de anotações e a compilação de sebenta valem mais para ela do que os flashcards. E a lista agregada de dúvidas por esclarecer (14.6, ponto 32) é provavelmente a funcionalidade mais útil da app depois das notas e das faltas.

### 5.3 Regime de avaliação — texto de referência

Fonte: Regulamento de Avaliação de Conhecimentos do Curso de Licenciatura em Direito da FDUL, versão consolidada.

- Escala de 0 a 20 valores, aprovação a partir de 10.
- Dois métodos: **Método A** (avaliação contínua) e **Método B** (avaliação final).
- A inscrição no método faz-se na inscrição anual. Quem está em Método A pode passar a Método B até ao dia útil seguinte à publicação da nota dos outros elementos de avaliação contínua. Quem tem a cadeira em atraso fica em Método B, mas pode optar por Método A nas 3 primeiras semanas do período letivo.
- Subturmas de Método A têm no máximo 30 alunos.
- A avaliação contínua pressupõe que foram lecionados pelo menos **dois terços** das aulas previstas. Se forem menos, a aluna pode escolher ficar em Método A ou passar a Método B até ao fim das aulas.
- Elementos da avaliação contínua: uma prova escrita (90 minutos, sobre a matéria das teóricas até 6 dias corridos antes) e outros elementos (trabalhos de pesquisa, comentários de jurisprudência, resolução de hipóteses práticas, simulações de julgamento, debates, exposições orais, chamadas orais, assiduidade).
- **Ponderação supletiva:** metade prova escrita, metade outros elementos. A prova escrita **nunca** pode valer mais de metade.
- **Recurso da nota do escrito:** 2 dias úteis após a publicação, com taxa, com análise questão a questão face aos tópicos de correção publicados. Não suspende a data da oral. Em caso de indeferimento, a nota nunca desce.
- **Exames de recurso:** só para quem fica excluída. Máximo de **4 cadeiras por ano letivo**, divisíveis entre semestres. Inscrição em 5 dias após ficar excluída. Prova escrita, aprova com 10 ou mais, e essa passa a ser a nota final.
- **Exame de melhoria:** só **um por cadeira**, sempre prova oral, com taxa. Prevalece só se for superior. Pode ser na própria época (se tiver sido dispensada da oral) ou na época normal do ano letivo seguinte.
- **Época especial de setembro:** só para quem tenha apenas 2 cadeiras para terminar o curso. Aprova com 10.
- **Coincidências:** na época normal há coincidência se houver exame no mesmo dia **ou em dia consecutivo** com outra prova de qualquer época. Nas outras épocas, só no mesmo dia. Entre dois escritos ou duas orais faz-se o do ano mais avançado; entre escrito e oral faz-se o escrito.
- **Passagem de ano:** com no máximo 4 cadeiras semestrais em atraso inscreve-se em tudo. Com 4 ou mais, o total de inscrições somado aos atrasos não pode passar 10 cadeiras semestrais.
- **Classificação anual:** média aritmética das cadeiras do ano, sem arredondamento. **Acresce 0,6 valores** se concluir com aproveitamento todas as cadeiras do ano nesse mesmo ano letivo.
- **Escala qualitativa final:** 10 a 13 Suficiente · 14 a 15 Bom · 16 a 17 Muito Bom · 18 a 20 Excelente.

> ⚠️ **AVISO OBRIGATÓRIO NA APP**
> O regente pode fixar regras próprias na ficha da unidade curricular, e as optativas podem ter método especial de avaliação. Portanto: o motor tem de ser **configurável por cadeira** (pesos e limiares editáveis) e cada ecrã com resultado calculado tem de mostrar, discretamente: *"cálculo com base no regulamento geral, confirma sempre a ficha da tua cadeira"*.

---

## 6. MOTOR DE AVALIAÇÃO — `src/services/avaliacao.js`

Isto é o coração da app. **Função pura, sem Firebase, sem React, sem efeitos colaterais.** Tudo o que os componentes fazem é chamar e mostrar.

### 6.1 Arredondamento

```js
// arredonda ao inteiro mais próximo, com 0,5 sempre para cima
export function arredondar(valor) {
  return Math.floor(valor + 0.5);
}
```

### 6.2 Assinaturas

```js
/**
 * calcula a nota de avaliação contínua a partir dos elementos
 * pesos somam 1. o peso da prova escrita nunca pode passar 0.5
 */
export function calcularNotaAC({ provaEscrita, outrosElementos, pesos }) { }

/**
 * devolve o estado completo de uma cadeira
 * entrada:
 *   metodo: 'A' | 'B'
 *   notaAC: número 0-20 ou null
 *   exameEscrito: número 0-20 ou null
 *   exameOral: número 0-20 ou null
 *   exameRecurso: número 0-20 ou null
 *   melhoriaOral: número 0-20 ou null
 * saída: objeto EstadoCadeira (ver 6.3)
 */
export function avaliarCadeira(dados) { }

/**
 * calcula o que ela precisa no próximo momento de avaliação
 * para atingir notaDesejada. devolve null se for impossível.
 */
export function simularNotaNecessaria({ metodo, notaAC, exameEscrito, notaDesejada }) { }

/** média anual com o bónus de 0,6 explicado à parte */
export function calcularMediaAnual(cadeirasAprovadas, concluiuTudoNoAno) { }

/** 'Suficiente' | 'Bom' | 'Muito Bom' | 'Excelente' */
export function escalaQualitativa(nota) { }
```

### 6.3 Forma do objeto de saída

```js
{
  estado: 'aprovada' | 'admitidaEscrito' | 'admitidaOral' |
          'excluida' | 'passaMetodoB' | 'podeRecurso' |
          'emCurso' | 'semDados',
  notaFinal: número | null,
  notaEntradaOral: número | null,
  explicacao: 'texto em português claro, para mostrar tal e qual',
  proximoPasso: 'texto que diz o que acontece a seguir',
  podeRequererReinscricaoMetodoA: boolean,  // só quando AC é 8 ou 9
  avisos: ['array de avisos, ex: prazos'],
}
```

**A `explicacao` e o `proximoPasso` são gerados aqui, não nos componentes.** Exemplos do registo a usar:

- `'Aprovada com 14 valores. A tua nota de avaliação contínua chegou aos 12, por isso não tens de ir a exame.'`
- `'Vais a exame escrito. Ficaste com 11 na avaliação contínua, e com 10 ou 11 a faculdade manda-te a escrito.'`
- `'Vais a oral com 9 de entrada. Se tirares 11 ou mais na oral, a nota da oral substitui esta.'`
- `'Ficaste excluída com 6. Podes inscrever-te no exame de recurso, tens 5 dias para o fazer.'`

### 6.4 Árvore de decisão

**MÉTODO A**

```
notaAC = arredondar(provaEscrita * pesoEscrita + outrosElementos * pesoOutros)

notaAC >= 12       → aprovada. notaFinal = notaAC
notaAC 10 ou 11    → admitidaEscrito
notaAC <= 9        → passaMetodoB. notaFinal = notaAC
                     se notaAC for 8 ou 9:
                       podeRequererReinscricaoMetodoA = true
                       aviso: 'tens 24 horas para pedir reinscrição em Método A'
```

**MÉTODO A, depois do exame escrito** (só se `notaAC` era 10 ou 11)

```
media = (notaAC + exameEscrito) / 2

exameEscrito <= 7              → excluida. notaFinal = exameEscrito
notaAC >= 10 e escrito >= 10   → aprovada. notaFinal = arredondar(media)
arredondar(media) >= 12        → aprovada. notaFinal = arredondar(media)
restantes casos                → admitidaOral
                                 notaEntradaOral = arredondar(media)
```

**MÉTODO B, exame escrito**

```
exameEscrito >= 12    → aprovada. notaFinal = exameEscrito
exameEscrito 8 a 11   → admitidaOral. notaEntradaOral = exameEscrito
exameEscrito <= 7     → excluida. notaFinal = exameEscrito
```

**EXAME ORAL** (regra igual nos dois métodos)

```
entrada = notaEntradaOral
media   = arredondar((exameOral + entrada) / 2)

se exameOral >= 10 e exameOral > entrada
   → aprovada. notaFinal = exameOral    // a oral prevalece, é a hipótese melhor
senão se media >= 10
   → aprovada. notaFinal = media
senão
   → excluida. notaFinal = media
```

**EXAME DE RECURSO** (só para quem fica excluída)

```
exameRecurso >= 10 → aprovada. notaFinal = exameRecurso
exameRecurso <= 9  → excluida. notaFinal = exameRecurso
avisos: 'máximo de 4 cadeiras em recurso por ano letivo'
```

**MELHORIA DE NOTA**

```
melhoriaOral > notaFinalAnterior → notaFinal = melhoriaOral
senão                            → notaFinal mantém-se
avisos: 'só podes fazer uma melhoria por cadeira'
```

### 6.5 Casos de teste obrigatórios

Escreve estes testes (ficheiro `src/services/avaliacao.test.js`, ou um script simples se não quiseres montar Vitest) e garante que **todos passam** antes de considerares a Fase 2 concluída.

| # | Método | AC | Escrito | Oral | Estado esperado | Nota final |
|---|---|---|---|---|---|---|
| 1 | A | 14 | — | — | aprovada | 14 |
| 2 | A | 12 | — | — | aprovada | 12 |
| 3 | A | 11 | — | — | admitidaEscrito | null |
| 4 | A | 10 | — | — | admitidaEscrito | null |
| 5 | A | 9 | — | — | passaMetodoB (pode pedir reinscrição) | 9 |
| 6 | A | 8 | — | — | passaMetodoB (pode pedir reinscrição) | 8 |
| 7 | A | 7 | — | — | passaMetodoB (não pode pedir) | 7 |
| 8 | A | 11 | 14 | — | aprovada | 13 |
| 9 | A | 10 | 10 | — | aprovada | 10 |
| 10 | A | 11 | 7 | — | excluida | 7 |
| 11 | A | 10 | 8 | — | admitidaOral (entrada 9) | null |
| 12 | A | 11 | 9 | — | admitidaOral (entrada 10) | null |
| 13 | B | — | 12 | — | aprovada | 12 |
| 14 | B | — | 16 | — | aprovada | 16 |
| 15 | B | — | 11 | — | admitidaOral (entrada 11) | null |
| 16 | B | — | 8 | — | admitidaOral (entrada 8) | null |
| 17 | B | — | 7 | — | excluida | 7 |
| 18 | B | — | 3 | — | excluida | 3 |
| 19 | B | — | 10 | 14 | aprovada (oral prevalece) | 14 |
| 20 | B | — | 11 | 10 | aprovada (média) | 11 |
| 21 | B | — | 8 | 10 | aprovada (oral prevalece) | 10 |
| 22 | B | — | 8 | 9 | excluida | 9 |
| 23 | B | — | 10 | 8 | excluida | 9 |
| 24 | A | 10 | 8 | 12 | aprovada (oral prevalece) | 12 |
| 25 | A | 11 | 9 | 9 | excluida | 10 |

Nota sobre o caso 25: entrada 10, oral 9. A oral não é positiva, logo não prevalece. Média é 9,5 que arredonda para 10, mas a regra de aprovação exige que a média seja positiva **e** a lei diz "os restantes alunos ficam excluídos, sendo a nota final a média". Média arredondada é 10, que é positiva, logo **aprovada com 10**. Implementa a média arredondada como critério e confirma este caso com o Vini, porque é o único ambíguo na leitura do regulamento. Marca-o no código com `// caso limite: confirmar`.

### 6.6 Simulador ao contrário

```js
simularNotaNecessaria({ metodo: 'B', exameEscrito: null, notaDesejada: 14 })
// → { momento: 'exame escrito', notaNecessaria: 14,
//     texto: 'Precisas de 14 no escrito para ficares com 14.' }

simularNotaNecessaria({ metodo: 'A', notaAC: 10, notaDesejada: 16 })
// → { momento: 'exame escrito', notaNecessaria: 20,
//     texto: 'Com 10 na contínua, nem com 20 no escrito chegas aos 16.
//             O máximo possível é 15. Se quiseres os 16, o caminho é a melhoria de nota.',
//     impossivel: true, maximoPossivel: 15 }
```

Quando é impossível, **diz que é impossível e diz qual é o caminho alternativo**. Sem rodeios, mas com jeito. E nunca com linguagem de derrota.

---

## 7. MOTOR DE FALTAS — `src/services/faltas.js`

### 7.1 Regra

Fica excluída da cadeira quem faltar:
- **sem justificação** a um quarto ou mais das **aulas práticas efetivamente lecionadas**, ou
- a metade ou mais das **aulas práticas previstas no calendário escolar** (contando justificadas e injustificadas)

### 7.2 Assinatura

```js
export function estadoFaltas({
  aulasPraticasPrevistas,     // total do semestre
  aulasPraticasLecionadas,    // até hoje
  faltasInjustificadas,
  faltasJustificadas,
}) {
  // devolve:
  // {
  //   excluida: boolean,
  //   motivoExclusao: 'injustificadas' | 'totalPrevistas' | null,
  //   limiteInjustificadas,        // nº a partir do qual exclui (lecionadas / 4)
  //   limiteTotal,                 // nº a partir do qual exclui (previstas / 2)
  //   faltasRestantesInjustificadas,
  //   faltasRestantesTotal,
  //   faltasRestantes,             // o mínimo das duas, é este que se mostra
  //   semaforo: 'verde' | 'amarelo' | 'vermelho',
  //   explicacao: 'texto claro',
  //   aviso: 'texto ou null',
  // }
}
```

### 7.3 Cálculo das margens

```
// exclui quando faltasInj >= lecionadas / 4
// logo o máximo permitido é o maior inteiro estritamente abaixo desse valor
maxInjustificadas = Math.ceil(lecionadas / 4) - 1
   (se lecionadas/4 for inteiro exato, então maxInjustificadas = lecionadas/4 - 1)

maxTotal = Math.ceil(previstas / 2) - 1
   (mesma lógica)

faltasRestantesInjustificadas = max(0, maxInjustificadas - faltasInjustificadas)
faltasRestantesTotal          = max(0, maxTotal - (faltasInj + faltasJust))
faltasRestantes               = min das duas
```

**Semáforo:**
- verde: `faltasRestantes >= 3`
- amarelo: `faltasRestantes` é 1 ou 2
- vermelho: `faltasRestantes === 0` ou já excluída

### 7.4 Nuance importante a mostrar na app

No início do semestre o limite de um quarto é **muito** apertado, porque conta sobre as aulas já lecionadas. Com 8 aulas dadas, 2 faltas injustificadas são já 25%. Por isso a app tem de mostrar **dois números lado a lado**:

1. **Agora:** quantas faltas injustificadas a excluiriam hoje, com as aulas lecionadas até hoje
2. **No fim do semestre:** quantas poderá dar em total, contando as previstas

E uma frase que explique isto sem jargão: *"no início do semestre cada falta pesa mais, porque a conta é feita sobre as aulas que já foram dadas"*.

### 7.5 Casos de teste

| # | Previstas | Lecionadas | Injustif. | Justif. | Excluída | Restantes |
|---|---|---|---|---|---|---|
| 1 | 26 | 8 | 0 | 0 | não | 1 |
| 2 | 26 | 8 | 1 | 0 | não | 0 |
| 3 | 26 | 8 | 2 | 0 | sim (injustificadas) | 0 |
| 4 | 26 | 24 | 5 | 0 | não | 0 |
| 5 | 26 | 24 | 6 | 0 | sim (injustificadas) | 0 |
| 6 | 26 | 26 | 0 | 13 | sim (total previstas) | 0 |
| 7 | 26 | 26 | 0 | 12 | não | 0 |
| 8 | 26 | 20 | 2 | 3 | não | 2 |

### 7.6 Motivos de falta justificada (lista para o formulário)

Usa exactamente estes, com estas etiquetas:

1. Internamento hospitalar ou doença comprovada
2. Nascimento de filho, consultas pré-natais, amamentação ou assistência a filho
3. Falecimento de cônjuge, unido de facto ou parente até ao 2.º grau
4. Cumprimento de ordem de autoridade pública
5. Competição oficial (estatuto de estudante atleta)
6. Realização de prova de avaliação na Faculdade
7. Tomada de posse em órgão da Faculdade ou Universidade
8. Outro (a justificar ao docente)

**Prazo crítico a lembrar:** em caso de falta a exame, os comprovativos entregam-se na Divisão Académica **até às 24 horas do dia útil seguinte**. Sempre que ela registar uma falta a exame como justificada, cria automaticamente um lembrete com este prazo.

---

## 8. ARQUITETURA DE FICHEIROS

```
src/
  data/
    calendarioEscolar.js      datas oficiais 2026/2027
    planoEstudos2Ano.js       cadeiras, regentes, cores das 3 turmas
    frases.js                 banco de frases (mínimo 150, ver secção 16)
    ajuda.js                  textos de ajuda por ecrã e glossário de termos
    erros.js                  dicionário de erros (secção 13)
    motivosFalta.js           lista da secção 7.6
  services/
    firebase.js               mover de src/
    auth.js
    initFirestore.js          mover de src/
    initCalendario.js
    avaliacao.js              MOTOR DE NOTAS (puro)
    faltas.js                 MOTOR DE FALTAS (puro)
    repeticaoEspacada.js      intervalos dos flashcards (puro)
    coincidencias.js          deteção de coincidências de exames (puro)
    exportar.js               PDF, markdown, JSON
    notificacoes.js           registo e agendamento
    assistente.js             só a assinatura, ver secção 23
  hooks/
    useCalendario.js
    useCadeiras.js
    useNotas.js
    useFaltas.js
    useAnotacoes.js
    useCasos.js
    useTarefas.js
    useArtigos.js
    useFlashcards.js
    useFrase.js               rotação sem repetição
    useOffline.js             estado de rede
    useCronometro.js
    useDicaPrimeiraVez.js
  context/
    ThemeContext.jsx
    useTheme.js
    UtilizadorContext.jsx     perfil, preferências, alcunha
    ToastContext.jsx          toasts com desfazer
  components/
    NavBar.jsx / .css
    ModalBase.jsx / .css      base reutilizável, foco preso, escape fecha
    ModalCriarEvento.jsx / .css
    Toast.jsx / .css
    EstadoVazio.jsx / .css
    DicaPrimeiraVez.jsx / .css
    BotaoAjuda.jsx / .css
    BotaoOQueEIsto.jsx        explica um termo, inline
    MensagemCarinhosa.jsx / .css
    BotaoMotivacao.jsx / .css
    Celebracao.jsx / .css     confetti e checkmark
    EcraConsolo.jsx / .css
    SemaforoFaltas.jsx / .css
    ArvoreAvaliacao.jsx / .css  diagrama do estado da cadeira
    AnelCountdown.jsx         extrair do Dashboard, reutilizável
    CartaoCadeira.jsx
    EditavelNoSitio.jsx       toca e edita
    IndicadorOffline.jsx
  pages/
    SplashScreen · Login · Onboarding · Dashboard · Horario ·
    Cadeiras · Cadeira · Notas · Faltas · Calendario · Anotacoes ·
    Anotacao · Casos · Caso · Artigos · Glossario · Flashcards ·
    Leituras · Tarefas · Estudo · ModoFrequencia · Assistente · Perfil ·
    Ajuda · Pesquisa
  styles/
    tokens.css                variáveis (secção 10)
    animacoes.css             keyframes partilhados
    imprimir.css              estilos para exportação em PDF
```

### Convenções

- Componentes em `PascalCase.jsx`, hooks em `useCamelCase.js`, serviços em `camelCase.js`
- CSS ao lado do componente, com o mesmo nome
- Nomes de variáveis e funções **em português** (`calcularNotaAC`, `faltasRestantes`), para o código falar a mesma língua do domínio
- Providers de contexto em `.jsx`, hooks de contexto em `.js` (evita o aviso de fast refresh do Vite, problema já encontrado na sessão de 02-05)

---

## 9. MODELO DE DADOS FIRESTORE

> Esta secção descreve o que **está em produção** (auditado em 18-09-2026). O modelo teórico da versão original foi substituído. Tudo o que a app acrescentar daqui para a frente segue o mesmo padrão.

Tudo debaixo de `users/{uid}`. Nada global.

**Padrão do projeto:** cada subcoleção "de configuração" tem um único documento chamado `dados`. Os motores nunca guardam resultados calculados, só entradas em bruto.

```
users/{uid}
  ├── perfil/dados
  │     nome, curso, ano, turma ('Turma A'), subturma ('Subturma 7'), anoLetivo,
  │     objetivos: [], criadoEm, onboardingFeito,
  │     tutorialFeito: bool, dicasVistas: { [chave]: true }
  │
  ├── configuracoes/dados
  │     tema: 'dark'|'light', notificacoesAtivas: bool, emailNotificacoes
  │
  ├── cadeiras/{id}                        id: 'administrativo-1' | 'dip-1' |
  │     nome, abrev, cor, regente,                'obrigacoes-1' | 'familia' | 'hri'
  │     metodo: 'A'|'B', optativa: bool,
  │     aulasPraticasPrevistas, aulasTeoricasPrevistas
  │   ├── faltas/dados
  │   │     aulasPraticasLecionadas, faltasInjustificadas, faltasJustificadas
  │   └── avaliacao/dados
  │         provaEscrita, outrosElementos, exameEscrito, exameOral,
  │         exameRecurso, melhoriaOral          (todos number 0-20 ou null)
  │
  ├── aulasSemanais/{id}                   templates que se repetem toda a semana
  │     titulo, diaSemana (1-5), horaInicio, horaFim, cadeira (id da cadeira),
  │     sala, dataInicio (Timestamp), dataFim (Timestamp), contaFalta: bool
  │
  ├── eventos/{id}                         eventos únicos
  │     titulo, data (Timestamp), horaInicio, horaFim,
  │     tipo: 'aula'|'frequencia'|'oral'|'entrega'|'outro',
  │     cadeira (id), notas, importancia: 'baixa'|'media'|'alta',
  │     estado: 'pendente'|'concluido'|'cancelado', contaFalta: bool
  │
  ├── tarefas/{id}
  │     titulo, cadeira (id), tipo: 'resumo'|'caso'|'leitura'|'exercicio'|'outro',
  │     prioridade: 'alta'|'media'|'baixa', prazo ('yyyy-mm-dd'), notas,
  │     concluida: bool, criadoEm, atualizadoEm
  │
  ├── anotacoes/{id}      criadoEm, atualizadoEm + campos definidos em Anotacao.jsx
  ├── casos/{id}          criadoEm, atualizadoEm + campos definidos em Caso.jsx
  ├── glossario/{id}      dominado: bool + campos definidos em Glossario.jsx (termo, ...)
  ├── artigos/{id}        campos definidos em Artigos.jsx
  ├── leituras/{id}       capitulos: [], paginaAtual: 0 + campos definidos em Leituras.jsx
  ├── flashcards/{id}     nivel: 0-4, acertos, erros, proximaRevisao + frente/tras/cadeira
  └── sessoesEstudo/{id}
        cadeiraId|null, inicio (Timestamp), fim (Timestamp), minutos, pausasFeitas
```

Os campos das coleções de conteúdo (`anotacoes`, `casos`, `glossario`, `artigos`, `leituras`, `flashcards`) que não vêm dos hooks estão definidos nos formulários das respetivas páginas. Consultar o formulário antes de os usar.

**Ainda não existem** (planeadas): registo de faltas individuais, estado por ocorrência de aula (`estadoAula`), `sumarios`, `mensagensDele`, `feedback`, `registosDiarios` e `streakRegisto` (secção 25), `resumo/estado`, `alertas` e `sessaoAjuda` (secção 26). Nas secções 25 e 26 os caminhos vinham escritos com `utilizadores` em vez de `users` e foram corrigidos.

### 9.1 Regras de segurança — em produção

Ficheiro `firestore.rules`, publicado e verificado em 18-09-2026 (um pedido sem autenticação devolve `403 PERMISSION_DENIED`).

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

O `match /{document=**}` recursivo cobre as subcoleções e também os documentos aninhados (`cadeiras/{id}/faltas/dados`, `cadeiras/{id}/avaliacao/dados`). Não simplificar para uma regra mais permissiva.

Publicar com `firebase deploy --only firestore` (regras e índices juntos, porque `firebase.json` referencia os dois). **Não deixar em modo de teste.**

### 9.2 Índices

`firestore.indexes.json` está vazio. Criar índices compostos só para as consultas que os exigirem: o Firebase dá o link do índice no erro da consola.

### 9.3 Migração

`initFirestore.js` e `initCalendario.js` só correm no registo (`registar()` em `auth.js`). Uma conta já criada não é atualizada sozinha quando o esquema muda. Qualquer alteração de estrutura precisa de uma migração pensada à parte.

---

## 10. SISTEMA DE DESIGN — `src/styles/tokens.css`

> **Estado real (18-09-2026, fontes confirmadas em 22-09-2026):** hoje as variáveis vivem em `src/index.css` (`--burgundy: #6B0F1A`, `--gold: #C9A84C`, `--bg-light`, `--bg-dark`, `--text-light`, `--text-dark`, `--border-light`, `--border-dark`) e o corpo usa Georgia. `tokens.css` ainda **não** existe no código. Os valores abaixo são o alvo, exceto a tipografia: **fica Georgia**, como já fixado no `CLAUDE.md` — Playfair Display e Lato eram só uma sugestão desta spec, nunca chegaram a ser carregadas, e não há razão para trocar uma fonte já em uso por outra que exigiria carregar dois ficheiros novos.

Base: identidade FDUL, bordô `#6B0F1A` e dourado `#C9A84C`. A cor de destaque é configurável pela Leonor no Perfil (por defeito a cor preferida dela, campo da secção 2).

```css
:root {
  /* cores base fdul */
  --bordo-900: #4A1219;
  --bordo-700: #6B0F1A;   /* bordô principal, igual a --burgundy em index.css */
  --bordo-500: #A33241;
  --bordo-100: #F4E4E7;

  --dourado-700: #9A7A1E;
  --dourado-500: #C9A84C;  /* dourado principal, igual a --gold em index.css */
  --dourado-300: #E3C766;
  --dourado-100: #FAF3DE;

  /* cor de destaque, configurável no perfil */
  --destaque: var(--dourado-500);

  /* superfícies, modo claro por defeito */
  --fundo: #FBF9F7;
  --fundo-elevado: #FFFFFF;
  --fundo-vidro: rgba(255, 255, 255, 0.72);
  --borda: rgba(0, 0, 0, 0.08);
  --texto: #1A1618;
  --texto-suave: #5C5459;
  --texto-tenue: #8B8287;

  /* estados */
  --sucesso: #2E7D5B;
  --aviso: #C9843E;
  --perigo: #B3423A;
  --info: #3D5A80;

  /* tipografia — Georgia para tudo, confirmado em 22-09-2026 (ver nota no topo da secção) */
  --fonte-titulo: Georgia, 'Times New Roman', serif;
  --fonte-corpo: Georgia, 'Times New Roman', serif;
  --escala-letra: 1;          /* 1 | 1.125 | 1.25, controlado no perfil */
  --t-xs: calc(0.75rem * var(--escala-letra));
  --t-sm: calc(0.875rem * var(--escala-letra));
  --t-base: calc(1rem * var(--escala-letra));
  --t-lg: calc(1.25rem * var(--escala-letra));
  --t-xl: calc(1.5rem * var(--escala-letra));
  --t-2xl: calc(2rem * var(--escala-letra));

  /* espaçamentos, escala de 4 */
  --e-1: 4px;  --e-2: 8px;  --e-3: 12px; --e-4: 16px;
  --e-5: 24px; --e-6: 32px; --e-7: 48px; --e-8: 64px;

  /* raios e sombras */
  --raio-sm: 8px; --raio-md: 14px; --raio-lg: 22px; --raio-total: 999px;
  --sombra-sm: 0 1px 3px rgba(0,0,0,0.06);
  --sombra-md: 0 4px 16px rgba(0,0,0,0.08);
  --sombra-lg: 0 12px 40px rgba(0,0,0,0.12);

  /* movimento */
  --rapido: 150ms;
  --normal: 250ms;
  --lento: 400ms;
  --curva: cubic-bezier(0.22, 1, 0.36, 1);
  --curva-suave: cubic-bezier(0.4, 0, 0.2, 1);

  /* toque */
  --toque-min: 44px;
}

[data-tema='dark'] {
  --fundo: #14100F;
  --fundo-elevado: #1E1A19;
  --fundo-vidro: rgba(30, 26, 25, 0.72);
  --borda: rgba(255, 255, 255, 0.10);
  --texto: #F5F1EF;
  --texto-suave: #B8AFAB;
  --texto-tenue: #7E7571;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Regra:** nenhum componente escreve cores, tamanhos ou tempos à mão. Tudo sai daqui. Se precisares de um valor novo, adiciona-o aqui primeiro.

---

## 11. ROTAS

| Rota | Página | NavBar | Notas |
|---|---|---|---|
| `/` | SplashScreen | não | fundo sempre escuro |
| `/login` | Login | não | |
| `/onboarding` | Onboarding | não | |
| `/dashboard` | Dashboard | sim | |
| `/horario` | Horario | sim | |
| `/cadeiras` | Cadeiras | sim | lista |
| `/cadeiras/:id` | Cadeira | sim | tabs internas |
| `/notas` | Notas | sim | |
| `/faltas` | Faltas | sim | |
| `/calendario` | Calendario | sim | 4 vistas |
| `/anotacoes` | Anotacoes | sim | |
| `/anotacoes/:id` | Anotacao | sim | editor |
| `/casos` | Casos | sim | |
| `/casos/:id` | Caso | sim | |
| `/artigos` | Artigos | sim | |
| `/glossario` | Glossario | sim | |
| `/flashcards` | Flashcards | sim | |
| `/leituras` | Leituras | sim | |
| `/tarefas` | Tarefas | sim | |
| `/estudo` | Estudo | sim | cronómetro |
| `/frequencia` | ModoFrequencia | não | ecrã cheio, sem distrações |
| `/pesquisa` | Pesquisa | sim | resultados globais |
| `/ajuda` | Ajuda | sim | |
| `/assistente` | Assistente | sim | "em breve" |
| `/perfil` | Perfil | sim | |

A NavBar tem 6 itens principais no mobile. O resto vive dentro das páginas e da pesquisa. Escolhe os 6 com este critério: o que ela abre todos os dias. Sugestão: Início, Horário, Cadeiras, Calendário, Notas, Perfil. Confirma com o Vini antes de fixar.

### Menu + (as 6 opções a ligar)

| Opção | Ação |
|---|---|
| Nova Tarefa | modal de tarefa, com cadeira e prazo |
| Nova Anotação | vai para `/anotacoes/nova` com a cadeira da aula atual pré-escolhida |
| Nova Frequência | `ModalCriarEvento` com tipo já preenchido e data dentro da janela de 30/11 a 18/12 |
| Oral de Melhoria | modal que explica a regra (uma por cadeira, só prevalece se for superior) e agenda |
| Registar Falta | modal de falta em dois toques, com a aula de hoje pré-selecionada |
| Lançar Nota | modal de nota, que ao gravar corre o motor e mostra o resultado com celebração ou consolo |

---

## 12. CONTRATOS DOS COMPONENTES PARTILHADOS

```jsx
// base de todos os modais: foco preso, escape fecha, clique fora fecha,
// scroll do corpo bloqueado, animação de entrada scale + fade
<ModalBase aberto titulo="..." onFechar={fn} tamanho="sm|md|lg">

// toast com desfazer. o apagar real só acontece quando o toast expira
<Toast mensagem="Anotação apagada" acao={{ texto: 'Desfazer', fn }} duracao={5000} />

// estado vazio que ensina, nunca "sem resultados"
<EstadoVazio
  icone={<SvgQualquer />}
  titulo="Ainda não tens anotações nesta cadeira"
  texto="Toca no + para escreveres a primeira. Podes separar teóricas de práticas."
  acao={{ texto: 'Escrever a primeira', fn }}
/>

// dica que aparece uma vez por ecrã e nunca mais
<DicaPrimeiraVez id="notas-primeira-visita" texto="..." posicao="baixo" />

// explica um termo técnico em linguagem simples
<BotaoOQueEIsto termo="avaliacaoContinua" />

// edita no sítio: mostra texto, toca e passa a input, guarda ao sair
<EditavelNoSitio valor={x} onGuardar={fn} tipo="texto|numero|data" />

// semáforo de faltas com os dois números da secção 7.4
<SemaforoFaltas cadeiraId="..." />

// diagrama do estado da cadeira na árvore do regulamento
<ArvoreAvaliacao estado={objetoDeAvaliarCadeira} />

// celebração: confetti dourado + checkmark svg + frase dele
<Celebracao ativa nota={14} onTerminar={fn} />

// consolo: sem números grandes, sem vermelho agressivo
<EcraConsolo nota={7} proximoPasso="..." mensagem="..." />

// frase carinhosa contextual
<MensagemCarinhosa contexto="madrugada|posNotaBoa|sessaoLonga|..." />

// botão sempre acessível
<BotaoMotivacao />
```

---

## 13. DICIONÁRIO DE ERROS — `src/data/erros.js`

**Nenhum erro técnico chega aos olhos dela.** Tudo passa por aqui. Cada mensagem diz o que aconteceu **e o que fazer agora**.

```js
export const erros = {
  // autenticação
  'auth/invalid-email': 'Esse email não parece estar bem escrito. Confere e tenta outra vez.',
  'auth/email-already-in-use': 'Já existe uma conta com este email. Tenta entrar em vez de registar.',
  'auth/weak-password': 'A password precisa de ter pelo menos 6 caracteres.',
  'auth/wrong-password': 'Email ou password errados. Tenta outra vez.',
  'auth/invalid-credential': 'Email ou password errados. Tenta outra vez.',
  'auth/user-not-found': 'Não encontrei nenhuma conta com este email.',
  'auth/too-many-requests': 'Muitas tentativas seguidas. Espera um minuto e tenta outra vez.',
  'auth/network-request-failed': 'Parece que estás sem net. Tenta quando voltares a ter ligação.',
  'auth/requires-recent-login': 'Por segurança, volta a entrar antes de mudares isto.',

  // firestore
  'permission-denied': 'Não consegui guardar isto. Sai e volta a entrar. Se continuar, avisa o Vini.',
  'unavailable': 'Estás sem net. Guardei aqui no telefone e sincronizo quando voltares a ter ligação.',
  'deadline-exceeded': 'Isto está a demorar mais do que devia. Tenta outra vez dentro de um minuto.',
  'not-found': 'Não encontrei isso. Talvez já tenha sido apagado.',
  'already-exists': 'Isso já existe.',
  'resource-exhausted': 'Chegámos ao limite de utilização por hoje. Avisa o Vini.',
  'failed-precondition': 'Falta uma coisa para isto funcionar. Avisa o Vini com este ecrã aberto.',

  // genérico
  'desconhecido': 'Algo não correu bem, mas não perdeste nada. Tenta outra vez, e se continuar avisa o Vini.',
};

export function traduzirErro(codigoOuErro) {
  const codigo = codigoOuErro?.code ?? codigoOuErro;
  return erros[codigo] ?? erros.desconhecido;
}
```

Se um código não estiver na lista, cai no genérico **e grava o código em `feedback`** para o Vini ver depois. Nunca mostrar o código à Leonor.

---

## 14. FUNCIONALIDADES — ESPECIFICAÇÃO POR ECRÃ

> Ordem de implementação na secção 22. **Notas e avaliação vêm primeiro**, por decisão do Vini.

### 14.1 Notas (`/notas`) — PRIORIDADE MÁXIMA

1. **Cartão de estado por cadeira.** Texto claro em cima, número em baixo. Nunca só um número solto. Usa a `explicacao` do motor tal e qual.
2. **Diagrama da árvore.** `ArvoreAvaliacao` mostra onde ela está e o que acontece em cada ramo a seguir. Ramo atual destacado, os outros esbatidos.
3. **Simulador ao contrário.** Slider da nota desejada, resultado em tempo real, com a frase de impossibilidade quando for o caso.
4. **Lançar nota** com o modal do menu +. Ao gravar, corre o motor, mostra `Celebracao` se aprovada e `EcraConsolo` se excluída.
5. **Pesos editáveis** por cadeira (defeito 0,5 / 0,5, escrita nunca acima de 0,5), com aviso de confirmar na ficha da UC.
6. **Média anual** com o bónus de 0,6 mostrado como linha própria e explicado ("porque fechaste o ano todo sem atrasos").
7. **Histórico** em timeline, incluindo recursos e melhorias.
8. **Escala qualitativa** mostrada ao lado da média (Suficiente, Bom, Muito Bom, Excelente).

### 14.2 Faltas (`/faltas`)

9. **Semáforo por cadeira** com os dois números da secção 7.4.
10. **Registar falta em dois toques:** toca na cadeira, toca em "faltei". O motivo e a justificação ficam num segundo passo opcional.
11. **Lembrete do prazo de 24 horas** para comprovativo, criado automaticamente.
12. **Aviso aos 2 restantes:** notificação e banner.
13. **Histórico de faltas** por cadeira, com marcação de comprovativo entregue.
14. **Editar aulas lecionadas** por cadeira, porque o denominador muda ao longo do semestre e ninguém além dela sabe quantas aulas houve.

### 14.3 Horário (`/horario`)

15. **Grelha semanal** com cores por cadeira, teóricas e práticas visualmente distintas.
16. **Aula de agora e aula a seguir**, com sala e docente, também no Dashboard.
17. **Toque numa aula** abre ações rápidas: marcar falta, escrever sumário, criar anotação desta aula, ver cadeira.
18. **Editar o horário na app**, adicionar, mover e apagar aulas, sem depender de ninguém.
19. **Vista de hoje** por defeito no mobile, semana completa no desktop.

### 14.4 Cadeiras (`/cadeiras`, `/cadeiras/:id`)

20. **Lista** com cartões: cor, nome, estado de avaliação, semáforo de faltas, próxima aula.
21. **Página da cadeira com tabs:** Resumo · Anotações · Casos · Notas · Faltas · Leituras · Flashcards.
22. **Ficha da cadeira:** regente, docente das práticas, método, pesos, manual, aulas práticas previstas.
23. **Timeline de matéria dada** por data, alimentada pelos sumários de aula. Importante porque a prova de avaliação contínua só cobre matéria até 6 dias antes.

### 14.5 Anotações (`/anotacoes`)

24. **Editor** com separação clara entre teóricas e práticas.
25. **Guardar automático** com indicador discreto e recuperação de rascunho.
26. **Citar artigos** dentro do texto, com atalho que cria ou liga à biblioteca de artigos.
27. **Compilar sebenta:** junta as anotações de uma cadeira num documento único, ordenado por data, exportável.
28. **Sumário rápido de aula:** três bullets no fim da aula, que alimentam a timeline.
29. **Favoritos e etiquetas.**

### 14.6 Casos práticos (`/casos`)

30. **Ficha com estrutura jurídica:** factos, questão, enquadramento legal, subsunção, conclusão. Cada campo com uma dica curta do que ali vai.
31. **Estados:** por resolver, resolvido, corrigido, dúvida por esclarecer.
32. **Lista agregada de dúvidas** de todos os casos, para ela levar para a aula prática. Esta é uma das funcionalidades mais úteis da app toda.
33. **Nota do professor** guardada depois da correção.

### 14.7 Ferramentas jurídicas

34. **Biblioteca de artigos** (`/artigos`): código, número, epígrafe, nota pessoal dela, dificuldade, cadeiras ligadas. Pesquisável por número. **Não incluir o texto da lei**, só a referência e a nota dela.
35. **Glossário** (`/glossario`): termos e latim jurídico, com marcação de dominado.
36. **Flashcards** (`/flashcards`) com repetição espaçada. Intervalos por nível: 1, 3, 7, 16, 35 dias. Acerto sobe de nível, erro volta ao nível 0. Gerar cartões a partir de uma anotação selecionada.
37. **Leituras** (`/leituras`): manual por cadeira, capítulos, página atual, percentagem.
38. **Arquivo de enunciados** antigos por cadeira e regente, dentro da tab da cadeira.

### 14.8 Calendário e prazos

39. **Manter as 4 vistas** existentes e corrigir o preenchimento ao editar.
40. **Detetor de coincidências** (`src/services/coincidencias.js`): avisa quando há exames no mesmo dia ou em dias consecutivos na época normal, e explica a regra em linguagem simples.
41. **Prazos pré-carregados** do calendário oficial, com countdowns e a etiqueta de "datas indicativas".
42. **Modo Frequência** (`/frequencia`): a partir de 30 de novembro, ecrã cheio com a cadeira mais próxima, dias restantes, checklist da matéria e nada mais.

### 14.9 Tarefas e estudo

43. **Tarefas** com prazo, prioridade, cadeira e subtarefas.
44. **Cronómetro de estudo** por cadeira, com registo de sessões.
45. **Aviso de pausa** aos 90 minutos seguidos (configurável).
46. **Modo "estou a passar-me":** fundo calmo, respiração guiada simples em SVG, uma única ação sugerida.
47. **Marcos do semestre** com recompensa visual.

### 14.10 Perfil (`/perfil`)

48. Nome, alcunha, turma, subturma, ano letivo.
49. Tema (claro, escuro, automático pela hora), cor de destaque, tamanho de letra, animações ligadas ou desligadas.
50. Notificações e aviso de pausas.
51. **Exportar** (PDF, markdown) e **backup em JSON**.
52. Contador de dias juntos, discreto.
53. Carta escondida (secção 16).
54. Botão "algo está mal aqui".

---

## 15. CAMADA DE AJUDA

Sistema transversal, não ecrã a ecrã. Estes 20 pontos são requisitos, não sugestões.

1. **Onboarding sem nada obrigatório.** Tudo saltável, tudo editável depois no Perfil. O ecrã 4 (horário) e o 6 (notas) passam a ser úteis mas continuam saltáveis.
2. **Estados vazios que ensinam.** Nunca "sem tarefas". Sempre "ainda não tens tarefas, toca no + para criares a primeira".
3. **Dica de primeira visita** por ecrã, uma vez, nunca volta. *(No código está guardada em `perfil/dados.dicasVistas`, no Firestore, e não em `localStorage`, para não voltar a aparecer noutro dispositivo. Mantém-se assim.)*
4. **Desfazer em tudo o que apaga.** O apagar real no Firestore só acontece quando o toast de 5 segundos expira.
5. **Confirmação só onde dói.** Apagar uma anotação com mais de 200 caracteres pede confirmação. Apagar uma tarefa não.
6. **Guardar automático** com debounce de 800ms e indicador discreto "guardado".
7. **Recuperação de rascunho** a partir de `localStorage` se fechar a app a meio de escrever.
8. **Botão "o que é isto?"** em cada termo técnico: avaliação contínua, Método A, Método B, nota de entrada, oral de melhoria, recurso, época especial, coincidência.
9. **Zero erros técnicos.** Tudo pela secção 13.
10. **Indicador de offline** claro, não alarmista.
11. **Botão de ajuda fixo** que abre o guia **do ecrã atual**, não um manual genérico.
12. **Áreas de toque de 44px mínimo.** Verifica com as ferramentas de desenvolvimento.
13. **Formulários curtos**, com o opcional atrás de "mais detalhes".
14. **Datas em linguagem natural:** hoje, amanhã, quinta, na próxima semana. Só data absoluta quando passar de 7 dias, e mesmo aí com o dia da semana.
15. **Editar no sítio** com `EditavelNoSitio`, sem ir a um ecrã de configurações.
16. **Modo noite automático** pela hora (a partir das 19h), porque ela estuda depois de jantar.
17. **Botão "algo está mal aqui"** em cada ecrã, que grava na coleção `feedback` com o nome do ecrã.
18. **Tamanho de letra ajustável** via `--escala-letra`, aplicado globalmente.
19. **Sem jargão.** Proibido: sync, cache, token, query, upload, refresh, erro 404, timeout.
20. **Ações principais na metade de baixo do ecrã**, alcançáveis com o polegar.

---

## 16. CAMADA DE MIMO

Tão importante como o motor de notas. Mesmo nível de cuidado.

### 16.1 Banco de frases — `src/data/frases.js`

**Mínimo de 150 frases.** Esquema:

```js
{
  id: 'f001',
  texto: '...',
  tom: 'fofo' | 'romantico' | 'engracado' | 'provocador' | 'calmo' | 'encorajador',
  contexto: ['manha' | 'tarde' | 'noite' | 'madrugada' | 'preFrequencia' |
             'posNotaBoa' | 'posNotaMa' | 'sessaoLonga' | 'semMotivacao' |
             'marco' | 'qualquer'],
  autoria: 'dele' | 'geral',
}
```

**Quotas obrigatórias** (o Vini pediu diversidade enorme para ela não se cansar):

| Tom | Mínimo de frases |
|---|---|
| fofo | 25 |
| romantico | 25 |
| engracado | 30 |
| provocador | 20 |
| calmo | 25 |
| encorajador | 25 |

E por contexto, no mínimo: madrugada 10 · preFrequencia 15 · posNotaBoa 12 · posNotaMa 12 · sessaoLonga 10 · semMotivacao 25.

**Rotação sem repetição** (`src/hooks/useFrase.js`):
- Guarda em `localStorage` os ids já mostrados por contexto
- Só reinicia o conjunto quando esgotar
- **Nunca** a mesma frase duas vezes seguidas, nem que o conjunto tenha esgotado
- Filtra por tom conforme as preferências dela no Perfil, se ela quiser restringir

**Tratamento visual:** frases com `autoria: 'dele'` aparecem com assinatura e cor de destaque. São dele para ela e isso tem de ser visível.

**O que podes escrever tu:** frases originais, gerais, de motivação e de estudo, nos seis tons. Exemplos do registo certo:

```js
{ texto: 'Um artigo de cada vez. O código não vai a lado nenhum.', tom: 'calmo', contexto: ['qualquer'], autoria: 'geral' },
{ texto: 'Já percebeste coisas mais difíceis do que esta. Lembras-te do ano passado?', tom: 'encorajador', contexto: ['semMotivacao'], autoria: 'geral' },
{ texto: 'São duas da manhã. O Código Civil ainda lá está amanhã, prometo.', tom: 'calmo', contexto: ['madrugada'], autoria: 'geral' },
{ texto: 'Estás a estudar Direito das Obrigações. Tens a obrigação de beber água.', tom: 'engracado', contexto: ['sessaoLonga'], autoria: 'geral' },
{ texto: 'Essa nota não te define. Define-te o que fazes na segunda-feira.', tom: 'encorajador', contexto: ['posNotaMa'], autoria: 'geral' },
{ texto: 'Olha para isso. Olha bem. Foste tu que fizeste.', tom: 'provocador', contexto: ['posNotaBoa'], autoria: 'geral' },
```

**O que NÃO podes escrever:** nada que dependa de alcunhas, piadas internas, memórias, datas ou gostos dela. Essas ficam assim:

```js
{ texto: '[A PREENCHER]', tom: 'romantico', contexto: ['qualquer'], autoria: 'dele' },
// todo: pedir ao vini
```

Cria **pelo menos 30 entradas vazias** com `autoria: 'dele'`, distribuídas pelos contextos, para o Vini preencher. E um comentário no topo do ficheiro a explicar-lhe onde escrever.

**E outra vez:** frases originais. Não copies falas de séries, filmes ou música. Se o código atual tiver as 55 frases de Suits, Gossip Girl e afins, substitui por originais com o mesmo espírito.

### 16.2 As 15 coisas de mimo

1. **Botão "falta-me motivação"** — fixo, sempre acessível, em todos os ecrãs com NavBar. Dá uma frase com animação de entrada, nunca repete a anterior. Grava cada clique em `sessoesEstudo` ou coleção própria, para o Vini saber quando ela andou em baixo.
2. **Aviso aos 90 minutos** de estudo seguido: bebe água, levanta-te, já fizeste muito. Configurável no Perfil.
3. **Ecrã especial depois da 1h da manhã** — fundo calmo e diferente, mensagem dele a mandá-la dormir, botão "ok, vou dormir" e botão "só cinco minutos" (que dá mais uma frase e volta a aparecer aos 20 minutos).
4. **Contador de dias juntos**, discreto, no Perfil, calculado a partir do campo da secção 2.
5. **Mensagem no dia de cada frequência** — da coleção `mensagensDele`, com `dataAtivacao` igual ao dia da prova, aparece uma vez nesse dia.
6. **Celebração ao lançar nota positiva** — confetti dourado em canvas (reutiliza o código de partículas da Splash), checkmark SVG animado, frase de parabéns. Duração máxima de 2,5 segundos e com botão para saltar.
7. **Ecrã de consolo se a nota for negativa** — sem número grande, sem vermelho agressivo, sem emoji triste. Mensagem dele, e depois a informação prática: recurso, prazos, o que ainda é possível.
8. **Easter egg existente mantido** e alargado com uma quarta fase.
9. **Piadas internas como placeholders** dos campos de texto, em vez de "escreve aqui". Depende do bloco da secção 2, por isso deixa `[A PREENCHER]`.
10. **Carta escondida no Perfil** que só desbloqueia a 3 de janeiro de 2027, véspera do primeiro dia de exames escritos. Antes disso mostra um envelope fechado com "abre a 3 de janeiro".
11. **Marcos do semestre:** dez aulas sem falta · primeira sebenta compilada · primeiro caso corrigido · metade do semestre · dez flashcards dominados · primeira cadeira aprovada. Cada um com animação própria e frase.
12. **Modo "estou a passar-me"** — acessível do Dashboard e da NavBar. Fundo calmo, respiração guiada em SVG (4 segundos a inspirar, 4 a segurar, 6 a expirar), e depois **uma** ação sugerida, escolhida pela app: a tarefa mais urgente, ou o capítulo a seguir, ou simplesmente descansar.
13. **Cor de destaque escolhida por ela** no Perfil, com a cor preferida por defeito. Bordô e dourado ficam como base estrutural.
14. **Dedicatória no fundo de cada página** de PDF exportado.
15. **Saudação com a alcunha dela**, não o nome de batismo, e ajustada à hora do dia.

---

## 17. ANIMAÇÕES

Ela adora animações, o Vini foi explícito. Mas com disciplina de engenharia.

**Fazer:**
- Entradas com stagger em todas as listas e grelhas de cartões (atraso de 40ms por item, máximo de 8 itens animados, os restantes entram de uma vez)
- Transições entre páginas: fade mais slide subtil de 12px, 250ms, `--curva`
- Anel de countdown SVG animado: extrair do Dashboard para `AnelCountdown.jsx` e reutilizar
- Micro-interações em todos os botões: escala 0,97 ao tocar, resposta visual em menos de 100ms
- Partículas douradas: manter na Splash, usar na `Celebracao`. **Nunca** em ecrãs de trabalho
- Animações temáticas de direito, que estavam no plano original e ficaram por fazer:
  - abrir uma cadeira: livro a sair da prateleira
  - mudar de anotação: virar de página
  - concluir tarefa: martelo de juiz
  - Todas em CSS ou SVG, curtas (máximo 500ms), e saltáveis
- Skeletons em vez de spinners, sempre que houver carregamento de lista

**Não fazer:**
- Animar `width`, `height`, `top`, `left`, `margin`, `box-shadow`
- Animações que bloqueiem interação
- Mais de duas animações grandes simultâneas
- Animações em cada tecla escrita no editor

**Sempre:**
- `prefers-reduced-motion` respeitado em `tokens.css`
- Toggle de animações no Perfil, que aplica `data-animacoes="off"` no `<html>`
- Keyframes partilhados em `animacoes.css`, não repetidos por componente

---

## 18. PWA, OFFLINE E NOTIFICAÇÕES NO IPHONE

A Leonor usa iPhone. Isto é o que realmente importa:

### 18.1 Manifest

```json
{
  "name": "JurisLeo",
  "short_name": "JurisLeo",
  "description": "A tua faculdade, organizada.",
  "start_url": "/dashboard",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#14100F",
  "theme_color": "#6B0F1A",
  "icons": [
    { "src": "/icone-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icone-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icone-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Adiciona também as meta tags do iOS no `index.html`: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`.

### 18.2 Service worker

Usa `vite-plugin-pwa` com estratégia `generateSW`. Cache do shell da app e das fontes. **Não** faças cache de respostas do Firestore, que já tem a sua própria persistência.

### 18.3 Offline do Firestore

Ativa a persistência em IndexedDB no `firebase.js`. Ela escreve nas aulas sem rede e sincroniza depois. Testa a sério: desliga a rede nas ferramentas de desenvolvimento, cria uma anotação, fecha, volta a ligar, confirma que subiu.

### 18.4 Notificações — a parte que importa

**No iOS, notificações push só funcionam se a app estiver instalada no ecrã inicial.** Não há prompt automático, a instalação é manual. Portanto:

1. Cria um ecrã de ajuda com imagens que mostre: botão Partilhar → "Adicionar ao ecrã principal"
2. Deteta se está em `standalone` com `window.matchMedia('(display-mode: standalone)').matches` ou `navigator.standalone`
3. **Só pede permissão de notificações depois** de confirmar que está instalada
4. Se não estiver instalada, mostra os lembretes dentro da app (banner no Dashboard) e não insistas. Um convite discreto a instalar no Perfil, nada mais.

**Notificações que valem a pena:**
- Aula a começar em 15 minutos, com a sala
- Prazo de comprovativo de falta a acabar (as 24 horas)
- Frequência amanhã
- Exame amanhã
- Prazo de inscrição em recurso a acabar
- Mensagem dele desbloqueada
- Flashcards a rever hoje (no máximo uma vez por dia)

**Nunca notificar:** duas vezes pela mesma coisa, entre a 1h e as 8h, ou mais de três vezes por dia.

### 18.5 Riscos a mitigar

O iOS pode limpar o armazenamento de PWAs que não são abertas durante semanas. Ela vai abrir todos os dias, mas o **backup exportável (secção 19) não é opcional por causa disto**.

---

## 19. EXPORTAÇÃO E BACKUP — `src/services/exportar.js`

1. **PDF via `imprimir.css` e `window.print()`.** Sem bibliotecas pesadas. Folha A4, tipografia serif, cabeçalho com o nome da cadeira, numeração de página, e **a dedicatória no fundo de cada página**.
2. **Markdown** de uma cadeira ou de tudo, para ela levar para onde quiser.
3. **Backup JSON completo** com botão bem visível no Perfil. Exporta todas as coleções. E um importador que aceita o mesmo ficheiro.
4. **Sebenta compilada** por cadeira: anotações ordenadas por data, com os sumários de aula intercalados, os artigos citados em anexo e os casos práticos resolvidos no fim.
5. Nome dos ficheiros em formato `jurisleo-<cadeira>-DD-MM-AAAA.pdf`.

---

## 20. DESEMPENHO, ACESSIBILIDADE E CONVENÇÕES

**Desempenho**
- Sem dependências novas sem perguntares primeiro
- `React.lazy` nas páginas menos usadas (Artigos, Glossário, Flashcards, Leituras, Ajuda)
- Listas longas paginadas à mão, 30 itens por vez, sem bibliotecas de virtualização
- Ícones em SVG inline, nunca uma biblioteca de ícones inteira
- `npm run build` sem avisos ao fim de cada fase
- Bundle inicial abaixo de 300kb comprimido. Se passar, investiga.

**Acessibilidade**
- Contraste mínimo de 4,5:1 em texto normal, nos dois temas
- Todos os botões com `aria-label` quando são só ícone
- Modais com foco preso e `Escape` a fechar
- Navegação por teclado funcional no desktop
- `aria-live` nos toasts

**Testar antes de dar qualquer coisa por feita**
1. Ecrã de 375px de largura
2. Modo escuro e modo claro
3. Offline, com a rede desligada
4. Com `prefers-reduced-motion` ativo
5. Com o tamanho de letra no máximo

---

## 21. O QUE NÃO FAZER

- Não reescrevas a Splash, o Login, o Onboarding ou o easter egg de raiz
- Não mudes de stack, não introduzas TypeScript, não introduzas Tailwind a meio
- Não inventes dados dela, frases pessoais, artigos de lei ou regras de avaliação
- Não copies falas de séries, filmes ou música
- Não uses Three.js, WebGL, Framer Motion, Lottie nem Moment.js
- Não deixes as regras do Firestore em modo de teste
- Não commites o `.env`
- Não metas o assistente de IA a funcionar (secção 23)
- Não faças uma fase inteira sem commits pelo caminho
- Não mostres códigos de erro, jargão ou inglês à Leonor
- Não avances de fase sem o `npm run build` a passar

---

## 22. FASES DE TRABALHO E CRITÉRIOS DE ACEITAÇÃO

Ao fim de **cada fase**: `npm run build` → corrigir → `git add . && git commit -m "..."` → `npm run build && firebase deploy` → resumo de cinco linhas → **PARAR e esperar confirmação**.

Se uma fase envolver decisão visual nova (layout, paleta, tipo de animação), **gera primeiro uma página HTML estática com três variantes** para o Vini escolher, e só depois escreve o código real. Isto é regra dele e não se salta.

| Fase | Conteúdo | Critério de aceitação | Commit |
|---|---|---|---|
| **0** | Limpeza e dívida técnica: mover ficheiros, criar estrutura da secção 8, corrigir os 8 pontos da secção 3.3, regras do Firestore endurecidas e publicadas | build passa, app abre igual ao que era, regras publicadas, `.env` fora do Git | `fase 0: limpeza, estrutura de pastas e regras do firestore` |
| **1** | Dados oficiais: `calendarioEscolar.js`, `planoEstudos2Ano.js`, `tokens.css`, seed do 2.º ano correto para a turma dela, Dashboard ligado ao Firestore | Dashboard mostra o nome real, as cadeiras reais dela e o countdown real para 30 de novembro | `fase 1: dados oficiais fdul e dashboard ligado ao firestore` |
| **2** | **Motor de avaliação** e página de Notas (14.1) | os 25 casos de teste da secção 6.5 passam todos | `fase 2: motor de avaliação e página de notas` |
| **3** | Motor de faltas e página de Faltas (14.2) | os 8 casos de teste da secção 7.5 passam todos | `fase 3: motor de faltas e semáforo por cadeira` |
| **4** | Horário (14.3) e Cadeiras com tabs (14.4) | horário editável na app, página da cadeira com as 7 tabs | `fase 4: horário editável e páginas de cadeira` |
| **5** | Camada de ajuda (secção 15), toda | os 20 pontos verificáveis um a um | `fase 5: camada de ajuda transversal` |
| **6** | Camada de mimo (secção 16): frases, botão de motivação, celebração, consolo, ecrã de madrugada | 150 frases com as quotas cumpridas, rotação sem repetição a funcionar | `fase 6: camada de mimo e banco de frases` |
| **7** | Anotações, sebentas, pesquisa global (14.5) | guardar automático, rascunho recuperado, pesquisa encontra tudo | `fase 7: anotações, sebentas e pesquisa global` |
| **8** | Casos práticos (14.6) | estrutura jurídica completa e lista agregada de dúvidas | `fase 8: casos práticos` |
| **9** | Artigos, glossário, flashcards, leituras (14.7) | repetição espaçada com os intervalos certos | `fase 9: ferramentas jurídicas` |
| **10** | Coincidências, prazos, Modo Frequência (14.8) | detetor avisa em dias consecutivos, modo frequência funcional | `fase 10: prazos, coincidências e modo frequência` |
| **11** | Tarefas, cronómetro, pausas, modo "estou a passar-me" (14.9) | aviso aos 90 minutos a funcionar | `fase 11: tarefas e ferramentas de estudo` |
| **12** | PWA, offline, notificações, ecrã de instalação no iOS (secção 18) | instala no iPhone, funciona offline, notifica depois de instalada | `fase 12: pwa, offline e notificações` |
| **13** | Exportação e backup (secção 19) | PDF com dedicatória, JSON exporta e importa | `fase 13: exportar e backup` |
| **14** | Animações temáticas de direito, marcos, carta escondida, polimento final | passa os 5 testes da secção 20 | `fase 14: animações temáticas e polimento final` |

### 22.1 Estado das fases (auditado em 22-09-2026)

A numeração acima é a da spec. O prompt de trabalho da sessão de 18-09-2026 usa outra (blocos A a D). Legenda: ✅ feito · ⚠️ parcial · ❌ por fazer.

*Esta tabela ficou desatualizada logo a seguir a ser escrita: foi gravada a meio da sessão de 18-09-2026 (16:45), antes de essa mesma sessão construir Notas, Faltas, Horário e as tabs da cadeira (17:18–17:36). A revisão de 22-09-2026 junta esse trabalho e o da tarefa 14/15 (família no calendário, calendário escolar, coincidências, eventos multi-dia, feriados/épocas visíveis). Tudo isto está na branch `fase-2`, nunca mergeado nem publicado — ver `docs/handoff-18-09-2026.md` para o histórico completo.*

| Fase | Estado | O que existe e o que falta |
|---|---|---|
| **0** | ⚠️ quase | 6 dos 8 pontos de 3.3 feitos, regras publicadas, `.env` fora do Git. "Oral de Melhoria" já abre o modal certo (22-09); "Registar Falta" e "Lançar Nota" navegam para `/faltas` e `/notas`, que agora são páginas reais, não stubs. Falta só a estrutura de pastas da secção 8 |
| **1** | ⚠️ parcial | ✅ seed do 2.º ano, Dashboard ligado, countdown para 30/11, `calendarioEscolar.js` (22-09, com `epocasDoDia`/`naEpocaNormal`). ❌ `planoEstudos2Ano.js`, `tokens.css` |
| **2** | ✅ | motor de avaliação e testes (caso 25 confirmado: fica "aprovada com 10"), página `/notas` com árvore do regulamento, simulador, pesos editáveis e média anual, celebração/consolo ligados |
| **3** | ✅ | motor de faltas reescrito, cumpre o ponto 7.4 (número principal sobre as 30 previstas). Página `/faltas`: registo em dois toques, lembrete das 24h, histórico |
| **4** | ✅ | lista de cadeiras com semáforo e estado, tabs da cadeira (7), horário editável e ligado ao Firestore, vista de hoje no telemóvel, aula de agora e seguinte no Dashboard |
| **5** | ⚠️ parcial | ✅ dica de primeira visita, botão de ajuda por ecrã, central de Ajuda, tutorial. Os 20 pontos por verificar um a um |
| **6** | ⚠️ parcial | ✅ ~120 frases originais, celebração, consolo, mensagem carinhosa. ❌ 150 frases com tons e quotas, autoria "dele", botão de motivação, ecrã da 1h |
| **7** | ⚠️ parcial | ✅ anotações e pesquisa global. ❌ sebenta compilada, sumários de aula. Guardar automático e rascunho por verificar |
| **8** | ✅ | casos práticos com estrutura jurídica, estados e painel de dúvidas agregadas |
| **9** | ✅ | artigos, glossário, flashcards, leituras. Intervalos corrigidos para 1,3,7,16,35 (ver 3.4) |
| **10** | ⚠️ parcial | ✅ `coincidencias.js` (22-09): choques no mesmo dia (sempre) e em dias consecutivos (época normal), aviso em tempo real no modal, nunca bloqueia. ❌ Modo Frequência |
| **11** | ⚠️ parcial | ✅ tarefas e cronómetro de estudo. ❌ subtarefas, aviso dos 90 min, modo "estou a passar-me" |
| **12** | ⚠️ parcial | ✅ PWA instalável e offline (`persistentLocalCache`). ❌ notificações e ecrã de instalação para iOS |
| **13** | ⚠️ parcial | ✅ backup JSON e impressão limpa. ❌ importador, markdown, dedicatória, sebenta |
| **14** | ❌ | animações temáticas, marcos, carta escondida |
| — | ⚠️ parcial | Calendário (fora da numeração 1–14, tarefa 15 da sessão de 18-09): ✅ famílias com filtro (22-09), eventos multi-dia, feriados e faixa de época visíveis nas células (22-09). ❌ Modo Frequência, mostrar choques na própria vista do calendário (só no modal por agora) |
| — | ❌ | **Secções 25 e 26** (registo de bem-estar e consola do Vini) não têm fase atribuída na tabela acima e não existem no código. A secção 26 (consola, com PIN) é um mal-entendido comum — não existe rota `/consola` nem nada parecido em produção nem na `fase-2`, só na spec |

---

## 23. ASSISTENTE DE IA — NÃO IMPLEMENTAR

Não há API gratuita viável neste momento. Portanto:

- Entrada na navegação com o nome "Assistente" e o rótulo **"em breve"**
- Ao tocar, um ecrã bonito que explica que está a caminho, com uma mensagem dele
- **Não** escrevas integração, não guardes chaves, não deixes código morto
- Deixa o sítio preparado: `src/services/assistente.js` apenas com a assinatura da função e um comentário. Nada mais.

```js
// assistente de ia, ainda não implementado
// não há api gratuita viável em 09/2026
// quando houver: recebe pergunta e contexto da cadeira, devolve resposta
export async function perguntarAssistente({ pergunta, cadeiraId, contexto }) {
  throw new Error('nao implementado');
}
```

---

---

## 25. REGISTO DIÁRIO DE BEM-ESTAR

Esta é a funcionalidade mais delicada da app. O enquadramento correto é **ela contar ao Vini como está**, não o Vini monitorizá-la. Toda a linguagem da interface tem de refletir isso.

### 25.1 Onde vive

Cartão no topo do Dashboard. Não é página própria, não é ecrã cheio obrigatório.

### 25.2 Quando aparece

- **Primeira abertura antes do meio-dia** → versão curta da manhã
- **Primeira abertura depois das 19h** → versão completa da noite
- Uma vez por janela, por dia
- Se ela ignorar, **insiste uma vez** e depois cala-se até à janela seguinte. Nunca mais do que isso.

### 25.3 Os três campos obrigatórios

Sempre presentes, nas duas janelas:

| Campo | Entrada |
|---|---|
| Humor | 5 emojis grandes, estilo Twemoji, com rótulo em texto por baixo |
| Energia | 5 níveis, mesmo padrão visual |
| Motivação | 5 níveis, mesmo padrão visual |

Área de toque de 56px por emoji. É o gesto mais frequente da app.

### 25.4 O campo de texto livre

Rótulo exacto: **"conta ao Vini o que te chateou hoje"**. Opcional, uma ou duas linhas, sem limite rígido.

O rótulo é assim de propósito. É sempre partilhado com ele, e por isso o campo tem de dizer que é uma mensagem para ele, não um diário privado. Nunca usar "o que te chateou hoje" sozinho.

### 25.5 Campos opcionais — ela escolhe quais ativar

Ela liga e desliga cada um no Perfil. Por defeito vêm todos desligados excepto sono.

**Corpo:** horas de sono · qualidade do sono · comeu hoje (sim, mal, não) · água · dores de cabeça · dores de costas · cansaço físico

**Cabeça:** ansiedade · stress · capacidade de foco · irritabilidade · vontade de estar com pessoas

**Faculdade:** aulas a que foi · quanto percebeu da matéria · medo da frequência mais próxima · sensação de estar atrasada · confiança na cadeira mais difícil

**Vida:** tempo com amigos · tempo livre para ela · estado da casa e do quarto · dinheiro · tempo de trajeto

> ⚠️ **Na parte da comida, tudo qualitativo.** Nunca calorias, nunca peso, nunca quantidades, nunca metas. Só "comeste hoje?" com três respostas. Não construir nada que possa virar contagem.

### 25.6 Versão da manhã (curta)

Humor, energia, motivação, sono. Quatro toques e fecha. Máximo 15 segundos.

### 25.7 Versão da noite (completa)

Os três obrigatórios, o texto livre, e todos os opcionais que ela tenha ativado.

### 25.8 Resposta imediata da app

**Só quando ela está em baixo.** Se humor, energia ou motivação vierem nos dois níveis mais baixos, aparece uma `MensagemCarinhosa` do contexto certo, com uma frase dele. Se ela estiver bem, a app agradece em uma linha e sai da frente.

Nunca celebrar um registo mau. Nunca dar conselhos não pedidos.

### 25.9 Como o registo ajusta a app

Com humor, energia ou motivação em baixo:

1. **Aligeira a lista de tarefas.** Mostra as duas mais urgentes em vez de todas. O resto atrás de "ver tudo".
2. **Sugere pausas e descanso.** O aviso dos 90 minutos passa a 45. O modo "estou a passar-me" fica em destaque.
3. **Muda o tom, não o conteúdo.** Nada de esconder faltas ou prazos. A informação é a mesma, a forma de a dizer é mais suave.

E o mais importante: **as mensagens de cobrança da consola (secção 26.7) ficam bloqueadas.** Ver as condições de bloqueio ali.

### 25.10 Streak

- Conta **dias em que registou**, não dias em que esteve bem. Um registo em baixo mantém a série intacta.
- Falhar um dia quebra a série, mas ela pode **restaurar até 3 vezes por semestre**, como no TikTok mas com menos tolerância.
- Restauros usados ficam visíveis, para ter peso.
- Se os 3 acabarem, a série recomeça e não há drama nenhum na interface.

### 25.11 Editar e apagar

Pode editar e apagar qualquer registo, sempre, sem confirmação pesada.

Quando apaga: o dia fica marcado como apagado **na app dela e na consola**, sem o conteúdo em lado nenhum. Ela vê a mesma marca que ele vê. Não existe cópia oculta do valor apagado, em sítio nenhum. Se apagar significasse guardar em segredo, era exactamente o oposto do que esta funcionalidade é.

### 25.12 Histórico dela

Gráfico completo no Perfil, com as três linhas obrigatórias e as opcionais que tiver ativado. Filtro de 7, 30 e 90 dias. **É o mesmo componente que a consola usa**, com os mesmos dados. Não há informação sobre ela que ele veja e ela não.

### 25.13 Alerta de persistência

Dispara quando humor **ou** energia **ou** motivação estiverem nos dois níveis mais baixos **3 dias seguidos**.

O que acontece:
1. Notificação ao Vini, com qual dos três campos e há quantos dias
2. Mensagem de mimo a ela, da categoria `posNotaMa` ou `semMotivacao`
3. **Ela vê que ele foi avisado.** Uma linha discreta: "o Vini foi avisado que a semana está a ser dura". Nunca um alerta silencioso.
4. Não volta a disparar nos 3 dias seguintes, para não virar ruído

### 25.14 Apoio, e onde fica

Por decisão do Vini, a app **não** sugere apoio profissional proativamente. Ele assume esse papel.

Existe, em contrapartida, uma entrada discreta na secção de Ajuda, ao lado dos outros contactos e prazos da faculdade, com o **Gabinete de Apoio Psicológico da FDUL**, que é um serviço que a própria faculdade dela oferece. Sem texto alarmista, sem destaque, sem aparecer sozinho. Está lá se ela precisar.

### 25.15 Modelo de dados

```
users/{uid}/registosDiarios/{data}   // id = 'AAAA-MM-DD'
  manha:  { humor, energia, motivacao, sono, preenchidoEm }
  noite:  { humor, energia, motivacao, texto, opcionais: {}, preenchidoEm }
  apagado: bool
  apagadoEm: timestamp
  // quando apagado é true, manha e noite são removidos por completo

users/{uid}/streakRegisto
  diasSeguidos, ultimoRegisto, restaurosUsados, restaurosDisponiveis
```

---

## 26. CONSOLA DO VINI

Rota `/consola`. Sem link em lado nenhum. Se a Leonor chegar lá, redireciona em silêncio para o Dashboard, sem mensagem de erro, para não criar curiosidade.

### 26.1 Princípio que governa tudo nesta secção

**Ela sabe que a consola existe e sabe o que lá aparece.** Uma entrada no Perfil dela lista, em texto simples, tudo o que ele vê. As estatísticas são as mesmas que ela tem no Perfil, com o mesmo componente.

A consola não serve para ele descobrir coisas sobre ela às escondidas. Serve para ele a ajudar e para ela saber que alguém está do outro lado. É por isso que existem as piadas da secção 26.7.

### 26.2 Autenticação — email nas regras mais PIN

Regras do Firestore (substituem as da secção 9.1). *Corrigidas em 18-09-2026: o caminho é `users/{uid}` como em produção, e a regra genérica passou a `{documento=**}`. A versão original, com `{doc}`, só cobria um nível e teria negado o acesso a `cadeiras/{id}/faltas/dados` e `cadeiras/{id}/avaliacao/dados`. `EMAIL_DO_VINI_AQUI` continua por preencher e exige que o Vini tenha a sua própria conta no Firebase Auth, com o email verificado.*

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function ehDono(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    // o email é assinado pelo firebase auth, não se falsifica no cliente
    function ehAdmin() {
      return request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email in ['EMAIL_DO_VINI_AQUI'];
    }

    match /users/{uid} {
      allow read:  if ehDono(uid) || ehAdmin();
      allow write: if ehDono(uid);

      // canal de mensagens: só o admin cria, ela só marca como lida
      match /mensagensDele/{doc} {
        allow read:   if ehDono(uid) || ehAdmin();
        allow create: if ehAdmin();
        allow delete: if ehAdmin();
        allow update: if ehAdmin() || (ehDono(uid)
          && request.resource.data.diff(resource.data)
               .affectedKeys().hasOnly(['lida', 'aberta']));
      }

      // sessão de ajuda: os dois podem abrir e fechar
      match /sessaoAjuda/{doc} {
        allow read, write: if ehDono(uid) || ehAdmin();
      }

      // tudo o resto: ela escreve, ele só lê (recursivo, para apanhar também
      // cadeiras/{id}/faltas/dados e cadeiras/{id}/avaliacao/dados)
      match /{colecao}/{documento=**} {
        allow read:  if ehDono(uid) || ehAdmin();
        allow write: if ehDono(uid) && !(colecao in ['mensagensDele']);
      }
    }
  }
}
```

> ⚠️ **Detalhe crítico e silencioso.** No Firestore as regras aninhadas **somam-se**, não substituem. Sem o `!(colecao in ['mensagensDele'])` na regra genérica, ela conseguiria escrever no canal de mensagens por essa via, e o desenho de "só o admin escreve mensagens" falhava sem dar erro nenhum. Testa isto explicitamente no simulador de regras.

**O admin lê, não escreve nos dados dela.** A única coleção onde escreve é `mensagensDele`. Isto protege os dois: se aparecer uma nota errada, nunca foi ele.

**PIN, com honestidade sobre o que faz.** Protege o caso real de o telefone dela ter a sessão dele aberta, ou do PC desbloqueado. Não é uma medida criptográfica: seis dígitos num frontend quebram-se em segundos. A segurança real são as regras acima.

- Hash SHA-256 com salt aleatório, gerado na primeira definição, guardado em `localStorage` **só no dispositivo dele**
- Pedido à entrada e outra vez após 15 minutos de inatividade
- Três tentativas erradas fecham a rota por uma hora, também em `localStorage`
- Sem recuperação. Esquecer o PIN significa limpar os dados do site e definir outro

### 26.3 Modelo de acesso — as duas coisas

**Permanente, sem ela fazer nada:** sistema, erros, sincronização, versão da app, backups, estado académico, notas, faltas, prazos, e todas as estatísticas agregadas, incluindo os registos diários.

**Só durante a sessão de ajuda, aberta por ela:** o ecrã onde ela está neste momento, o detalhe do último erro com o contexto completo, e a capacidade de criar coisas por ela.

**Mecânica da sessão de ajuda:**
- Ela prime "preciso de ajuda" em qualquer ecrã
- Abre janela de 30 minutos, com contagem visível para os dois
- Ele recebe notificação
- Ela vê um banner: "o Vini está a ver contigo, faltam 24 minutos"
- Expira sozinha; qualquer um dos dois pode fechar antes
- Fica registada, para ele saber com que frequência ela precisa de ajuda e em que ecrãs

### 26.4 Blocos de informação

**A · Sistema**
Online ou offline e há quanto tempo sincronizou · escritas pendentes não enviadas · erros com código, ecrã, hora e contagem · mensagens do botão "algo está mal aqui" com o ecrã · versão instalada contra versão publicada · PWA instalada ou não · notificações autorizadas ou não · tamanho dos dados locais e risco de limpeza pelo iOS · último backup e há quantos dias

**B · Académico**
Estado de cada cadeira com a explicação em texto · média atual e projetada · faltas por cadeira com a margem · próxima aula · próxima frequência com countdown · datas de frequências ainda em falta · coincidências detetadas · prazos a expirar (as 24 horas do comprovativo, os 5 dias do recurso)

**C · Estatísticas**
Horas de estudo por cadeira e semana · número de sessões e duração média · anotações e palavras por cadeira · casos resolvidos contra por resolver · dúvidas por esclarecer com a lista · flashcards dominados · progresso de leitura por manual · sumários preenchidos contra aulas dadas · dias seguidos a abrir a app

**D · Bem-estar**
As três linhas obrigatórias em gráfico · opcionais ativados · textos livres dela, por data · streak e restauros usados · dias marcados como apagados, sem conteúdo · alertas de persistência disparados

**E · Sinais**
Cliques no "falta-me motivação" por dia · sessões depois da 1h · sessões longas sem pausa · cadeira com menos tempo e menos anotações

**F · Ajudar à distância**
Enviar mensagem que aparece na app dela · agendar mensagem para data futura · criar evento, tarefa ou entrada no horário por ela · preencher as datas das frequências quando saírem · adicionar artigos à biblioteca dela · botão "explicar este ecrã" que lhe manda o guia do ecrã onde está · forçar recarregamento se ficou numa versão antiga · reenviar a migração de dados · abrir e fechar a sessão de ajuda

### 26.5 Correlações — regra de honestidade estatística

Um semestre dá cerca de 100 registos. **É pouco para afirmar relações.** Por isso:

- Mostrar as séries **sobrepostas**, para ele olhar e concluir
- Só usar a palavra "padrão" com 30 pontos ou mais na mesma combinação
- Sempre com a ressalva à vista: "padrão aparente, poucos dados"
- **Nunca** escrever frases do tipo "estudas menos quando dormes mal" como se fossem factos. Uma consola que afirma isso a partir de 15 dias leva-o a conclusões erradas sobre ela.

### 26.6 Conteúdo das anotações — decisão de produto

As regras dão-lhe acesso de leitura a tudo, incluindo o texto das anotações. **Recomendação forte: a consola mostra quantas anotações e quantas palavras, não o texto.**

O motivo é utilidade, não privacidade abstrata. As anotações são onde ela escreve mal, desorganizado, com dúvidas idiotas e conclusões erradas, que é como se aprende. Se souber que ele lê, escreve para ser lida, e as anotações ficam piores. Perde-se mais do que se ganha.

A decisão final é do Vini. Se ele quiser o conteúdo, tem de constar da lista que ela vê no Perfil.

### 26.7 Banco de piadas — `src/data/piadasVini.js`

**Mínimo de 120 mensagens.** Rotação sem repetição em `localStorage`, máximo uma por dia, nunca duas na mesma sessão.

```js
{
  id: 'v001',
  texto: '...',
  gatilho: 'presencaVini' | 'estudouBem' | 'semAparecer' |
           'sumariosEmFalta' | 'faltasAsubir' | 'notaBoa' |
           'sessaoLonga' | 'aleatorio',
  intensidade: 'suave' | 'media' | 'provocadora',
  bloqueadaEmMaMare: bool,   // true em todas as de cobrança
}
```

**Condição de bloqueio, obrigatória.** As mensagens com `bloqueadaEmMaMare: true` não aparecem quando:
1. Há risco de exclusão por faltas em qualquer cadeira
2. Houve nota negativa nos últimos 3 dias
3. Ela clicou no botão de motivação mais de 2 vezes em 48 horas
4. **O alerta de persistência da secção 25.13 está ativo**

Nesses períodos só aparecem as de apoio. Uma app a dizer a alguém que está em baixo que vai ficar de castigo deixa de ter graça e passa a ser mais uma voz a pressioná-la.

**Âmbito das piadas.** Cobrem estudo, horas, sumários e faltas. **Não cobrem o bloco de bem-estar nem o de sinais.** Piada sobre não abrir o livro lê-se muito diferente de piada sobre o estado emocional dela. Sobre esses, o Perfil diz simplesmente o que aparece na consola.

**45 escritas, 75 a escrever seguindo os mesmos gatilhos:**

```js
// presença em tempo real
'O Vini está a ver isto agora. Comporta-te.'
'Alguém abriu a consola. Sim, é ele. Sim, está a ver.'
'Em direto para o Vini.'
'Tens público.'
'Ele está do outro lado. Diz olá.'
'Atenção, adulto responsável a observar.'
'Isto agora é televisão.'

// estudou bem
'Duas horas hoje. Estou impressionado, e não é fácil.'
'Isto é que é estudar. Guardei print.'
'Vou ter de inventar um castigo novo, porque este já não se aplica.'
'Olha-me esta. A estudar e tudo.'
'Três dias seguidos. Quem és tu e o que fizeste à Leonor.'
'Se continuares assim vou ter de te elogiar em público.'
'Confirmo oficialmente que andas a trabalhar. Fica registado.'
'Estava à espera de te apanhar a fugir e falhei. Parabéns.'

// sem aparecer  [bloqueadaEmMaMare]
'Dois dias sem aparecer. O Código Civil mandou cumprimentos.'
'Estou a ver-te. Ou melhor, não estou, e é isso o problema.'
'Não andas a estudar, né? Vais ficar de castigo.'
'A app está aqui sozinha há três dias. Sente-se não usada.'
'Recebi zero atividade. Zero. Nem um clique.'
'As obrigações não se cumprem sozinhas. Piada jurídica, desculpa.'
'Passaram quatro dias. Já pensei em chamar as autoridades.'
'Fiz uma app inteira e tu não abres. Estou bem, obrigado por perguntares.'
'O Direito da Família não te vai visitar a casa.'

// sumários em falta  [bloqueadaEmMaMare]
'Doze aulas sem sumário. O Vini já viu, só para saberes.'
'Aulas dadas 40, sumários escritos 3. Contas são contas.'
'Os sumários estão em branco e o dezembro está a chegar.'
'Três bullets. Três. Não te peço mais nada.'

// faltas a subir  [bloqueadaEmMaMare]
'Três faltas em Administrativo. Estou a contar.'
'O Paulo Otero não perdoa e eu também não.'
'Mais uma e vamos ter uma conversa.'
'Estou a ver as faltas. Sim, todas.'

// nota boa
'Já vi a nota. Já contei a todos. Desculpa.'
'Sabia. Sempre soube. Nunca duvidei.'
'Isto merece jantar fora e eu pago.'
'Guardei isso no painel para sempre.'

// sessão longa
'Duas horas seguidas. Levanta-te, eu vejo tudo.'
'Já bebeste água? É a sério.'
'Pausa. Não é sugestão.'

// aleatórias, perfil e toasts
'Esta app foi feita por alguém que te ama e que vê as tuas estatísticas. As duas coisas.'
'Sim, ele vê quanto tempo estudaste. Não, não te podes queixar, ele fez a app.'
'Transparência total: ele vê os erros, as horas, as faltas e as notas.'
'O painel dele tem gráficos. Gráficos sobre ti. Assustador e fofo ao mesmo tempo.'
'Há alguém a torcer por ti com acesso a dados.'
```

As que dependerem de piadas internas ficam `[A PREENCHER]`.

**Onde aparecem:** toast ao abrir a app, uma vez por dia · banner durante a sessão de ajuda · cartão de estatísticas do Perfil · estado vazio dos sumários · ecrã de faltas quando o semáforo passa a amarelo.

### 26.8 Layout — DECIDIDO: semáforo primeiro, bem-estar no topo

A consola não é um painel de números para explorar, é uma triagem. Abre a responder a uma pergunta só: **preciso de fazer alguma coisa agora?**

**Ordem de leitura, de cima para baixo:**

**1. Como ela está** (primeiro elemento, por decisão explícita do Vini: antes dos erros, antes da faculdade)
- Uma linha em destaque com o estado dos últimos dias, a partir dos registos diários da secção 25
- As três linhas obrigatórias (humor, energia, motivação) num gráfico pequeno de 7 dias
- Se houver texto livre novo dela, aparece aqui, em destaque
- Se o alerta de persistência da secção 25.13 estiver ativo, este bloco fica com borda de aviso

**2. O que precisa de ti**
- Uma frase, em grande: "está tudo bem" ou "três coisas a precisar de ti"
- Se houver, lista curta e acionável, cada item com o botão que o resolve: erro novo · pedido de ajuda · faltas no limite · prazo a expirar · datas de frequência em falta · versão da app desatualizada
- Se não houver nada, o bloco é uma linha só e não ocupa espaço

**3. O resto, a pedido**
- Académico, estatísticas, sinais e sistema ficam acessíveis mas **fechados por defeito**
- Não competem pela atenção quando não há nada errado

**Critério de sucesso deste layout:** ele abre a consola do estágio, numa pausa de cinco minutos, e em três segundos sabe se tem de agir.

**Telefone:** uma coluna. Blocos 1 e 2 sempre expandidos, o resto em cartões colapsados. Quatro separadores em baixo: Bem-estar · Alertas · Academia · Ajudar. Puxar para baixo atualiza. Ponto de presença a pulsar no topo quando ela está online.

**Computador:** blocos 1 e 2 em banda larga no topo, a toda a largura. O resto em grelha de três colunas por baixo. Sidebar à esquerda com as secções e indicador de presença. Gráficos maiores, tabelas com todas as colunas.

**Animações:** números a contar de zero até ao valor · gráficos a desenhar-se da esquerda para a direita · cartões a entrar em cascata · ponto de presença a pulsar · transição suave entre secções · brilho discreto no bloco 2 quando aparece um alerta novo. Tudo em SVG desenhado à mão, sem bibliotecas de gráficos.

### 26.9 Estrutura de dados da consola

> ⚠️ **Problema a resolver antes de escrever uma linha.** Se a consola ler as dez coleções dela em direto a cada abertura, demora segundos a carregar e gasta milhares de leituras do Firestore por mês. A conta grátis tem 50 mil leituras por dia, e uma consola ingénua aberta 20 vezes ao dia come isso sem esforço.
>
> **Solução obrigatória: documento de resumo.** A app dela mantém um único documento agregado, atualizado quando ela grava qualquer coisa. A consola lê esse documento mais o de alertas, dois documentos no total, e só vai buscar detalhe quando ele abre um cartão.

```
users/{uid}/resumo/estado
  atualizadoEm
  presenca: { online, ultimaAtividade, ecraAtual, versaoApp, pwaInstalada }
  bemEstar: {
    ultimos7: [{ data, humor, energia, motivacao, temTexto, apagado }],
    textoNovo: { data, texto, lidoPeloVini },
    streak, restaurosUsados,
    alertaAtivo, alertaDesde, alertaCampo
  }
  academico: {
    cadeiras: [{ id, abrev, estado, notaFinal, faltasRestantes, semaforo }],
    mediaAtual, mediaProjetada,
    proximaAula: { cadeiraId, hora, sala },
    proximaFrequencia: { cadeiraId, data, diasRestantes }
  }
  estudo: {
    minutosEstaSemana, minutosPorCadeira: {},
    sumariosFeitos, aulasDadas,
    casosResolvidos, casosPorResolver, duvidasAbertas,
    anotacoesTotal, palavrasTotal,
    diasSeguidosAAbrir
  }
  sinais: {
    cliquesMotivacao7dias, sessoesDepoisDa1h, sessoesLongasSemPausa,
    cadeiraMenosTrabalhada
  }
  sistema: {
    ultimaSincronizacao, escritasPendentes,
    ultimoBackup, tamanhoDadosLocais
  }

users/{uid}/alertas/{id}
  tipo: 'erro' | 'pedidoAjuda' | 'faltasNoLimite' | 'prazoAExpirar' |
        'datasEmFalta' | 'versaoAntiga' | 'bemEstar3Dias'
  severidade: 'info' | 'aviso' | 'urgente'
  titulo, detalhe, ecra, criadoEm
  resolvido: bool, resolvidoEm, resolvidoPor: 'vini' | 'auto'
  acao: { tipo, payload }   // o que o botão do alerta faz
```

**Quem escreve o resumo.** A app dela, num único sítio: `src/services/resumo.js`, com uma função `atualizarResumo(campos)` chamada depois de cada gravação relevante. Escrita com debounce de 3 segundos, para não fazer dez escritas quando ela grava uma anotação. Nunca a consola. A consola só lê, excepto em `mensagensDele` e no fecho de alertas.

**Consistência.** Se o resumo divergir da verdade (ela usou offline, falhou uma escrita), há um botão "recalcular" na consola que corre a agregação de raiz a partir das coleções. Não é automático, porque é caro.

### 26.10 Inventário de cartões

Cada cartão é um componente próprio em `src/components/consola/`. Todos recebem os dados do resumo, nenhum faz queries próprias, excepto quando expandido.

**Bloco 1, sempre expandido**

| Cartão | Conteúdo | Ação |
|---|---|---|
| `CartaoComoElaEsta` | Frase de estado, gráfico de 7 dias das três linhas, streak | Abre o histórico completo |
| `CartaoTextoDela` | Só aparece se houver texto livre não lido. Data e texto | Marcar como lido, responder |

**Bloco 2, sempre expandido**

| Cartão | Conteúdo | Ação |
|---|---|---|
| `CartaoTriagem` | "Está tudo bem" ou lista de alertas por severidade | Cada alerta tem o seu botão |

**Bloco 3, colapsados**

| Cartão | Conteúdo | Ação |
|---|---|---|
| `CartaoCadeiras` | Estado, nota e semáforo de faltas por cadeira | Abre detalhe da cadeira |
| `CartaoMedias` | Média atual, projetada, bónus de 0,6 à parte | Ver o cálculo |
| `CartaoPrazos` | Prazos a expirar, com countdown | Preencher datas |
| `CartaoEstudo` | Horas por cadeira e semana, gráfico de barras | Ver por semana |
| `CartaoProducao` | Anotações, palavras, casos, dúvidas, sumários | Ver dúvidas abertas |
| `CartaoSinais` | Cliques na motivação, madrugadas, cadeira evitada | Sem ação, é leitura |
| `CartaoSistema` | Sincronização, versão, PWA, backup, dados locais | Forçar recarregamento |
| `CartaoErros` | Lista de erros com código, ecrã, hora e contagem | Marcar resolvido |
| `CartaoAjudar` | As nove ações da secção 26.4, bloco F | Cada uma abre o seu modal |

### 26.11 Contratos das ações de ajudar

Todas em `src/services/consola.js`. Todas escrevem só onde podem escrever.

```js
// mensagem que aparece na app dela
enviarMensagem({ texto, tipo, dataAtivacao })

// evento, tarefa ou aula criados por ele
criarPorEla({ colecao, dados })   // só 'eventos', 'tarefas', 'aulas', 'artigos'

// preencher as datas das frequências quando saírem
preencherFrequencias([{ cadeiraId, data, hora, sala }])

// manda-lhe o guia do ecrã onde ela está agora
explicarEcra(ecraAtual)

// força a app dela a recarregar, se ficou numa versão antiga
forcarRecarregamento()

// corre de novo a migração de dados
reenviarMigracao()

// abre ou fecha a sessão de ajuda
abrirSessaoAjuda(minutos)
fecharSessaoAjuda()

// recalcula o resumo de raiz, caro, só manual
recalcularResumo()
```

> ⚠️ `criarPorEla` é a única função que escreve fora de `mensagensDele`, e por isso é a excepção mais perigosa do desenho. As regras da secção 26.2 **não permitem** esta escrita: a consola tem de a fazer criando uma mensagem do tipo `acao` que a app dela executa ao abrir, com confirmação dela. Ela vê "o Vini criou-te um evento, aceitas?". Nunca aparece nada nos dados dela sem ela saber.

### 26.12 Notificações ao Vini

Canal: web push na PWA dele, mais email de reserva para as urgentes.

| Gatilho | Severidade | Imediata |
|---|---|---|
| Ela pediu ajuda | urgente | sim |
| Alerta de 3 dias em baixo | urgente | sim |
| Erro novo que nunca aconteceu | aviso | sim |
| Erro repetido | info | agrupado, uma vez por dia |
| Faltas a uma do limite | aviso | sim |
| Nota nova lançada | info | sim |
| Texto livre novo dela | info | sim |
| Prazo a expirar em 24h 

<!-- ATENÇÃO: o texto foi cortado outra vez ao ser colado (limite de 50 000 caracteres), a meio da tabela da secção 26.12. Faltam: o resto da 26.12 e tudo o que vem depois. Também não chegaram as secções 24 (critérios de conclusão), 27 e 28 (calendário: 28.1 famílias, 28.2 estados de aula, 28.5 eventos de vários dias, 28.8 choques), que o prompt da sessão cita. Colar essas partes e acrescentar aqui. -->
