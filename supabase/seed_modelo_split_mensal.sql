-- ============================================================
-- Seed — Modelo de checklist REAL: Ar-condicionado (split) / Mensal
-- Projeto: CoolTrack — PMOC do hospital
-- ------------------------------------------------------------
-- Espelha o documento real "MAREF-008 — SPLITS — PREVENTIVA MENSAL".
-- Upsert (on conflict tipo+frequencia): cria o modelo se não existir, ou
-- substitui os itens (ex.: troca o modelo de teste pelo oficial). Re-rodável.
--
-- Roda como `postgres` no SQL Editor (bypassa o RLS de escrita admin-only).
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

insert into public.modelos_checklist (tipo, frequencia, itens)
values (
  'ar_condicionado',
  'mensal',
  '[
    {"procedimento": "Ligar o equipamento", "servico": "Verificação"},
    {"procedimento": "Testar o funcionamento", "servico": "Verificação"},
    {"procedimento": "Verificar as condições físicas do equipamento", "servico": "Verificação"},
    {"procedimento": "Desligar o equipamento", "servico": "Operação"},
    {"procedimento": "Limpar ou lavar o(s) filtro(s) de ar", "servico": "Limpeza"},
    {"procedimento": "Limpar ou lavar o painel frontal", "servico": "Limpeza"},
    {"procedimento": "Remover o(s) filtro(s) de ar", "servico": "Limpeza"}
  ]'::jsonb
)
on conflict (tipo, frequencia) do update
  set itens = excluded.itens;
