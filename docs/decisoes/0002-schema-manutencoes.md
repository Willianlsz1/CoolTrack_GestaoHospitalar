# Decisão 0002 — Schema da tabela `manutencoes`

**Data:** 2026-05-30
**Fase:** 3 — Manutenções
**Status:** Aceita

## Contexto

Primeiro relacionamento do projeto: `1 equipamento → N manutenções`
(Documento Fundacional, seção 3.3). Cada visita técnica vira um registro
no histórico do equipamento.

## Decisões

1. **FK `equipamento_id` com `ON DELETE RESTRICT`**. Não deixa apagar um
   equipamento que tenha manutenções — protege o histórico de sumir por
   engano (contexto hospitalar/auditoria). Implicação: excluir um
   equipamento com manutenções falha no banco; a UI deve dar uma mensagem
   amigável no futuro.

2. **`tecnico` como texto livre** (não FK para `usuarios`). A tabela
   `usuarios` + login vêm numa fase futura; por ora, texto livre mantém o
   escopo fechado ("uma coisa por vez"). Vira referência quando houver auth.

3. **`tipo` com `CHECK`** (`preventiva / corretiva / preditiva`), não enum
   — mesmo padrão da tabela `equipamentos`.

4. **`data` como `date`** (sem hora), default `current_date`. O doc cita
   "data, hora", mas hora foi adiada para manter o formulário simples;
   fácil de adicionar depois.

5. **Obrigatórios:** `equipamento_id`, `tipo`, `data`. Demais campos
   opcionais (lenient, como na tabela equipamentos).

6. **RLS ligado** com políticas públicas de `select`/`insert` + GRANT ao
   `anon` (fase sem auth). `update`/`delete` ficam para quando houver
   necessidade (menor privilégio).

## Adiado / fora de escopo

- Fotos antes/depois da intervenção → passo 3d (Storage).
- `update`/`delete` de manutenção.
- Vínculo do técnico com a tabela `usuarios` → fase de Auth.
