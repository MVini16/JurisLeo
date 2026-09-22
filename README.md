# JurisLeo

App pessoal de organização académica para a Leonor, estudante de Direito na FDUL (2.º ano). Regista horário, cadeiras, tarefas, calendário e faltas, e calcula sozinha o estado de avaliação e de faltas de cada cadeira segundo o regulamento real da faculdade.

É uma app de uma só utilizadora, feita por medida para ela — não um produto para terceiros.

## Stack

React 19 + Vite + Firebase (Firestore + Authentication) + Firebase Hosting. Projeto Firebase: `jurisleo-67124`.

## Arrancar localmente

```bash
npm install
cp .env.example .env   # preenche com a configuração do Firebase (jurisleo-67124)
npm run dev
```

A app assume-se mobile-first — testa sempre num viewport de telemóvel.

## Testes e lint

```bash
npm test        # vitest — motores de negócio (avaliação, faltas, etc.) são funções puras e testadas
npm run lint     # eslint
npm run build    # build de produção (vite)
```

## Deploy

Só manual, nunca automático:

```bash
npm run build && firebase deploy --only firestore,hosting
```

`firestore` inclui as regras (`firestore.rules`) e os índices — nunca fazer deploy só do hosting quando eles mudarem.

## Estrutura

- `src/pages/` — um componente por rota
- `src/components/` — peças reutilizáveis entre páginas
- `src/services/` — lógica pura de negócio (avaliação, faltas, etc., sem Firebase nem React) e os wrappers do Firebase
- `src/hooks/` — hooks que ligam a UI aos dados do Firestore
- `src/context/` — estado partilhado entre páginas (tema)
- `src/data/` — dados fixos e reais da Leonor (cadeiras, motivos de falta, calendário escolar)

Mais contexto e as regras de trabalho deste projeto estão em `CLAUDE.md`.
