-- ============================================================
-- Migration 0020 — Checklist na manutenção (PMOC)
-- Projeto: CoolTrack — Fase B do checklist digital (decisão 0006)
-- ------------------------------------------------------------
-- Guarda a evidência do checklist preenchido NA manutenção preventiva
-- (unificado: completar o checklist = uma preventiva). É um SNAPSHOT
-- imutável dos itens no momento da execução — mudar o modelo depois não
-- altera evidências passadas.
--
-- Formato do jsonb:
--   { "frequencia": "mensal",
--     "itens": [ { "procedimento": "...", "servico": "...", "ok": true },
--                { "procedimento": "...", "servico": "...", "ok": false,
--                  "obs": "vazamento de gás" } ] }
--
-- Nullable: só a preventiva-via-checklist preenche; corretiva/preditiva e
-- as preventivas antigas ficam com checklist = null. Os grants/RLS de
-- manutencoes já cobrem a coluna (authenticated insere/lê).
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

alter table public.manutencoes
  add column if not exists checklist jsonb;
