# Decisão 0006 — Checklist digital de manutenção (PMOC)

**Data:** 2026-05-31
**Status:** Aceita (desenho; implementação em fases)

## Contexto

O PMOC exige **evidência de execução** das manutenções (Portaria 3.523/98).
Hoje isso é papel: o técnico assina centenas de folhas à mão por mês — inviável
em um hospital com 1000+ equipamentos. Existem **dois documentos**: o
**analítico** (inventário, já gerado pelo CoolTrack) e o **checklist** (a folha
de procedimentos executada e assinada). O alvo é digitalizar o segundo.

## Decisões

1. **Checklist = preventiva (unificado).** Completar o checklist de um
   equipamento **cria uma manutenção preventiva**, que zera o relógio do PMOC
   (cadência já existente). Sem sistema paralelo — dashboard, "atrasada/vence em
   breve" e relatório reaproveitam tudo. Só a **preventiva** carrega checklist;
   corretiva/preditiva seguem como hoje.

2. **Modelo de checklist por tipo de equipamento × frequência.** O admin/RT
   cadastra os itens `{procedimento, tipo de serviço}` por tipo (geladeira, ar
   central, câmara fria…) e frequência (mensal/anual). Tamanho varia por tipo.
   Todos os equipamentos do tipo herdam.

3. **Assinatura eletrônica por atestação**, não rabisco desenhado: identidade
   autenticada (quem está logado) + carimbo de tempo + itens cumpridos. Um toque
   de "confirmar" por equipamento. Reduz papel/custo — o diferencial do produto.

4. **Preenchimento "tudo OK + observação".** O caso comum é um toque; exceções
   (anomalias) vão num campo de observação que vira ocorrência/histórico.

5. **Acesso por QR + ronda do mês.** A ficha do equipamento ganha **duas abas**:
   _Registros_ (histórico) e _Checklist_ (status do mês: feito ou não, com a
   execução). A "ronda do mês" lista os equipamentos com checklist vencendo.

6. **Evidência imutável.** No momento da execução, os itens do modelo são
   **snapshotados** na preventiva — mudar o modelo depois não altera evidências
   passadas.

## Fora de escopo

- **Qualidade do ar (QAI)** — laudos laboratoriais semestrais, de empresa
  distinta (NBR 17037). Não é manutenção mecânica.
- **Fotos no documento PMOC** — inviável com 1000+ equipamentos; fotos seguem
  como uso interno.
- Árvore completa NBR 13971 (componente/P-S) — usamos o checklist plano por
  categoria, como o PMOC real do hospital.

## Responsável Técnico

Configurável (nome, conselho CREA/CFT, registro, nº da ART/TRT). Hoje é um
técnico externo contratado; técnico de refrigeração pode assinar via CFT/CRT
(TRT, Resolução CFT 068/2019). Entra no cabeçalho e na assinatura do documento.
