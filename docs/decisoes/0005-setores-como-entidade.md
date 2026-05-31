# Decisão 0005 — Setor vira entidade (tabela `setores` com intervalo)

**Data:** 2026-05-31
**Status:** Aceita — **supersede o item 3 da decisão 0001**

## Contexto

A decisão 0001 deixou `setor` como **texto livre** no equipamento e adiou uma
tabela `setores`, por falta de motivo concreto para estruturá-lo.

O motivo concreto apareceu: o controle de compliance **PMOC** calcula
"manutenção atrasada" a partir de um **intervalo que pertence ao setor**
(CME = 15 dias; demais = 30 dias; setores podem ter cadência própria; mais um
ciclo anual). Com `setor` como texto livre, "CME"/"cme"/"C.M.E." seriam setores
distintos e o cálculo de conformidade fica não-confiável.

## Decisão

`setor` passa a ser uma **entidade própria**: tabela `setores`
(nome + `intervalo_dias`), com **tela de gestão** para o gestor ver/editar as
cadências. O equipamento **referencia** um setor (seleção, não digitação).

## Consequências

- Migração: criar `setores`, semear os setores reais com seus intervalos, e
  migrar os valores de texto livre existentes para referências.
- O campo "Setor" do formulário de equipamento vira um **select**.
- Habilita o Dashboard como painel de **compliance PMOC** (atrasada = passou do
  intervalo do setor desde a última higienização).

## Addendum (PMOC real — HFR 2026)

Um PMOC real mostrou que a **periodicidade é rastreada por equipamento**, como
um par "30 / 365" (mensal + anual), uniforme dentro de uma categoria e com o
setor numa coluna à parte (localização). Reconciliação adotada:

- O **intervalo efetivo vive no equipamento** (par mensal + anual).
- O **setor fornece o default** (CME = 15; demais = 30) ao cadastrar/atribuir.
- A tabela `setores` continua valendo — como fonte do default e unidade de
  gestão/relatório —, mas **não é a dona exclusiva** do intervalo.

## Implementado (Fase 1)

- Tabela `setores` + tela de gestão admin-only; equipamento referencia setor.
- Cadência **no equipamento** (mensal + anual), default do setor.
- Atributos de HVAC (carga em BTU, área em m²) — admin-only na UI.
- "Atrasada" = dias desde a última **preventiva** > intervalo; + "vence em breve".
- **Relatório PMOC lite** (exportável) + seed de demonstração.

## Pendente — "PMOC documento completo" (próxima fase)

Para o relatório valer como documento oficial, faltam:

- **Cabeçalho institucional**: hospital, empresa responsável, responsável
  técnico + ART/CREA, vigência.
- **Checklists de procedimentos** (mensal 9 itens, anual 28 itens) por
  categoria — a prova do que foi executado.
- **Agrupamento por categoria** de equipamento (como o PMOC oficial).
- Campo de **assinatura**.
- **Trava de coluna no banco** para os campos admin-only (intervalo, carga,
  área) — hoje só UI; vira grant por coluna na Fase 3 (hardening).
