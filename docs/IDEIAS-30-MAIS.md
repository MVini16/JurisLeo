---
data: 21-09-2026
projeto: JurisLeo
tipo: proposta (nada disto está implementado)
---

# Mais 30 ideias: detalhes que qualquer app de estudo tem e coisas só dela

A primeira lista (`IDEIAS-30.md`) era de funcionalidades. Esta é de **detalhes**: o que se espera de uma app bem feita, e o que a torna dela. Cada uma nasce como módulo ligável, como as outras. Esforço: **P** uma sessão · **M** algumas · **G** uma fase.

## A. Detalhes que quase todas as apps de estudo têm

| # | Ideia | Porquê | Esforço |
|---|---|---|---|
| 1 | **Desfazer depois de apagar** | Um toque a mais e perde-se uma anotação. Aparece "Desfazer" durante 6 segundos | P |
| 2 | **"Continuar onde ficaste"** | Ao abrir a app, um cartão com a última anotação, caso ou cartão que tinha aberto | P |
| 3 | **Estado da ligação e da sincronização** | Um ponto discreto: "guardado", "a guardar", "sem ligação, guardo quando voltares". A app já funciona offline | P |
| 4 | **Lembretes no telemóvel** | Aviso das 24 h do comprovativo, de uma frequência a chegar e do fim do dia. Depende da fase 12 (PWA) | G |
| 5 | **Atalhos no ícone da app** | Premir o ícone e escolher "Nova anotação" ou "Registar falta" | P |
| 6 | **Tamanho da letra** | Três tamanhos nas Definições. Ajuda a ler à noite ou cansada | M |
| 7 | **Cor de destaque à escolha** | Bordô, azul, verde ou roxo. O dourado fica sempre | M |
| 8 | **Tema pela hora** | Escuro depois das 20h, claro de manhã, sem ela mexer | P |
| 9 | **Modo foco** | Esconde a barra e os cartões e deixa só o cronómetro e a anotação | M |
| 10 | **Pesquisa com realce** | Nos resultados, a palavra procurada aparece marcada | P |
| 11 | **Formatação nas anotações** | Negrito, listas, títulos, sem ser um editor pesado | M |
| 12 | **Contador de palavras e tempo de leitura** | Por anotação, e o total por cadeira | P |
| 13 | **Ordenar à mão** | Arrastar para reordenar tarefas, etiquetas e checklists | M |
| 14 | **Cópia de segurança automática** | Uma vez por semana, o ficheiro de backup é preparado e ela só toca em "guardar" | M |
| 15 | **Instalar no iPhone, explicado** | Ecrã com o passo a passo (Partilhar, Adicionar ao ecrã principal). A spec pede-o (18.4) | P |

## B. Coisas só dela

| # | Ideia | O que faz | Esforço |
|---|---|---|---|
| 16 | **Cápsula do tempo** | O Vini escreve uma mensagem que só abre no fim do semestre, ou no dia da última frequência | M |
| 17 | **Mensagem de boa sorte** | Na véspera de uma frequência, aparece uma mensagem do Vini (agendável, spec 26.4) | P |
| 18 | **"O teu semestre em números"** | No fim, um resumo bonito: horas estudadas, cartões, anotações, dias seguidos, a cadeira em que mais evoluiu | M |
| 19 | **Datas especiais no calendário** | Aniversários e datas que só os dois conhecem, numa família à parte e discreta | P |
| 20 | **Contador de dias juntos** | Discreto, no Perfil (spec 52). Só aparece se ela ligar | P |
| 21 | **Carta escondida** | Aparece ao cumprir um marco (spec 53). Uma carta escrita pelo Vini | P |
| 22 | **Frases dele, por gatilho** | Uma frase que só aparece depois de uma frequência ou de uma sessão longa. Já há banco de frases; falta o gatilho | M |
| 23 | **Lista de coisas boas** | Cada dia, uma linha sobre algo bom. Ao fim de um mês pode relê-las | P |
| 24 | **Playlist de estudo** | Uma ligação para a playlist dela, aberta ao iniciar o cronómetro | P |
| 25 | **Pausa com carinho** | Depois de 90 minutos seguidos, a app sugere levantar-se, beber água e respirar (a página Respirar já existe) | P |
| 26 | **Dia de descanso a sério** | Ela marca um dia como descanso: a app esconde tarefas e só mostra uma frase simpática | P |
| 27 | **Metas dela, não da app** | Ela escreve a sua meta do semestre ("acabar com 14 a Administrativo") e a app acompanha-a nas Notas | M |
| 28 | **Fundo à escolha** | Uma imagem ou padrão discreto no ecrã de início, escolhido por ela | M |
| 29 | **Cartões de marcos para partilhar** | "Passei a 1.ª frequência": uma imagem bonita para enviar ao Vini ou às amigas | M |
| 30 | **Modo "estou a passar-me" completo** | Junta a respiração, uma frase e uma única ação sugerida (spec 46) | P |

## Cuidados

- **Privacidade:** nada que o Vini veja passa a existir sem constar da lista do Perfil (spec 26.1). As ideias 16, 17 e 23 são dele para ela, ou só dela; nenhuma vai para a consola sem ela saber.
- **Sem pressão:** nenhuma destas ideias cria ligas, rankings ou avisos de "estás atrasada".
- **Ordem sugerida:** 1, 2, 3, 15, 8 e 12 (pequenas e úteis); depois 16, 17, 18 e 22 (as que a vão surpreender).
