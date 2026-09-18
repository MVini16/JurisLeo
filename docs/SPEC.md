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
- **Inconsistência interna desta spec, faltas:** a tabela 7.5 usa 26 aulas previstas, a secção 5.4 usa 30. Os testes em `faltas.test.js` seguem a tabela (26). Os dados reais da Leonor usam 30.
- **Modelo de dados:** a secção 9 descreve o que está em produção. As coleções `notas`, `faltas`, `aulas`, `sumarios`, `mensagensDele` e `feedback` da versão original **não existem**.
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

**Ainda não existem** (planeadas para as fases seguintes): coleção de registo de faltas individuais, estado por ocorrência de aula (`estadoAula`), sumários de aula, `mensagensDele`, `feedback`.

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

> **Estado real (18-09-2026):** hoje as variáveis vivem em `src/index.css` (`--burgundy: #6B0F1A`, `--gold: #C9A84C`, `--bg-light`, `--bg-dark`, `--text-light`, `--text-dark`, `--border-light`, `--border-dark`) e o corpo usa Georgia. `tokens.css`, Playfair Display e Lato ainda **não** existem no código nem estão carregadas em `index.html`. Os valores abaixo são o alvo. Antes de trocar a fonte, confirmar com o Vini: o `CLAUDE.md` do projeto fixa Georgia.

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

  /* tipografia */
  --fonte-titulo: 'Playfair Display', Georgia, serif;
  --fonte-corpo: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

**N

<!-- ATENÇÃO: o texto foi cortado ao ser colado (limite de 50 000 caracteres). As secções 13 a 24 não chegaram. Colar o resto e acrescentar aqui, sobretudo a 14 (funcionalidades por ecrã), a 22 (fases) e a 28 (calendário). -->
