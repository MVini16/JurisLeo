# Citações com fonte

As frases do ecrã de início podem misturar as do Vini (`src/data/frases.js`, originais) com citações (`src/data/citacoes.js`). Ela escolhe em Definições: misturadas, só as do Vini ou só citações, e pode desligar as falas de séries.

## O que está lá e como foi verificado (21-09-2026)

| Tipo | Quantas | Verificação |
|---|---|---|
| Direito romano (Ulpiano, Celso, Cícero) | 4 | `primaria`: o texto está no [Digesto](https://www.thelatinlibrary.com/justinian/digest1.shtml) (1.1.1 e 1.1.10) e em Pro Cluentio 146 |
| Brocardos latinos de uso corrente | 9 | `tradicao`: sem autor certo. O significado em português é tradução nossa |
| Falas de séries (Suits, The Vampire Diaries) | 3 | `wikiquote`: só confirmadas numa página do Wikiquote, aberta a 21-09-2026. Fonte secundária, sem número de episódio |

**Limites, ditos com franqueza:**
- Não confirmei nenhuma fala de Gossip Girl: a página principal do Wikiquote não traz as falas (estão nas páginas de cada temporada).
- Numa das falas de Suits as duas fontes que consultei davam versões ligeiramente diferentes, e essa ficou de fora. Só entraram as que apareceram de forma consistente.
- A verificação das séries passou por uma ferramenta que resume a página, não por ver o episódio. Antes de contar com elas, vê o episódio ou abre o link.

## Porque não há 10 000 frases
O que evita a repetição é o método, não o número: cada frase sai uma vez antes de qualquer uma voltar (`escolherSemRepetir`, com testes). Com 400 frases e três aberturas por dia passa mais de um ano sem repetir. Falas de séries e filmes são texto protegido por direitos de autor: só se guardam falas curtas, com fonte, em pouca quantidade.

## Como acrescentar uma citação
1. Falas curtas (até 25 palavras), com personagem, série e ligação para a fonte.
2. Copiar o texto tal e qual, sem corrigir nem traduzir (o teste falha se uma fala de série tiver tradução).
3. Só usar `primaria` se o texto estiver na obra original, com a referência.
4. Nunca inventar nem "arredondar" uma citação.
