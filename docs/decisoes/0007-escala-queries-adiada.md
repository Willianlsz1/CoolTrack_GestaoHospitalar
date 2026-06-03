# Decisão 0007 — Escala das consultas adiada (pré-lançamento)

**Data:** 2026-06-03
**Status:** Aceita (trabalho adiado, com gatilho definido)

## Contexto

A review de fluxo apontou que `buscarTodasManutencoes` faz `select('*')` com 3
joins sobre a tabela **inteira** de `manutencoes`, e é consumida por 6 telas
(Dashboard, Ronda, Setores, Usuários, Aprovações, Relatório). Cada tela usa só
um recorte (a última preventiva por equipamento, ou os pendentes, ou os serviços
por técnico), mas baixa tudo e descarta no cliente. Com **volume real** (anos de
preventivas mensais + corretivas), isso vira payload grande, parse lento e
memória no celular — o gargalo central de escala.

Parte da dor já foi tratada na **Fase C1**:

- `staleTime` de 30s no QueryClient — para de re-baixar a mesma query a cada
  navegação curta entre telas.
- Code-splitting por rota — bundle inicial caiu de ~1011 KB para ~529 KB; o
  scanner (`html5-qrcode`, 370 KB) só baixa em `/escanear`.

## Decisão

**Adiar o refatoramento de consultas (C3) para antes do lançamento com dados
reais.** Não fazer agora.

### Por quê adiar

1. **Otimização prematura.** Na escala atual (dezenas a poucos milhares de
   linhas) "carregar tudo" funciona, e o C1 já removeu a dor prática do dia a dia.
2. **Risco alto, benefício adiado.** A regra de cadência foi unificada e coberta
   por testes em JS (decisão da Fase #2). Movê-la para uma **RPC/view SQL** abre
   espaço para banco e app **divergirem** — o tipo de bug que a rodada de
   gargalos veio matar. O ganho só aparece em escala que ainda não existe.

## Trabalho adiado (o que fazer quando o gatilho disparar)

1. **RPC/view "última preventiva por equipamento"** (1 linha por equipamento,
   com o filtro de reprovado/aprovado), consumida por Dashboard/Ronda/Setores/
   Relatório no lugar de carregar todas as manutenções.
2. **Aprovações server-side:** aba Pendentes filtra `.eq('aprovacao_status',
'pendente')` no banco; abas Aprovados/Reprovados com paginação.
3. **Usuários:** agregação de serviços por técnico no banco (não no cliente).
4. **Paginação na lista de equipamentos** (`.range()` ou virtualização).
5. **Invalidação cirúrgica:** registrar/aprovar deixa de invalidar
   `['manutencoes']` inteiro; invalida só a chave do equipamento + as contagens
   leves (ou `setQueryData` otimista).

## Gatilho (quando retomar)

Qualquer um dos sinais abaixo:

- A tabela `manutencoes` passar de ~5.000 linhas, **ou**
- O app entrar em produção com inventário real (centenas de equipamentos), **ou**
- Lentidão perceptível para carregar Dashboard/Ronda no celular.

## Já feito nesta rodada (não confundir com o adiado)

- Duplicação de "loading/erro" centralizada em `<Carregando>`/`<Erro>`
  (Fase A11y) — item de boilerplate que a review listava junto da escala.
- `staleTime` + code-splitting (Fase C1).
