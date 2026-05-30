-- ============================================================
-- Migration 0009 — Permitir exclusão de manutenções
-- Projeto: HospTrack — Fase 3
-- ------------------------------------------------------------
-- A 0008 deu ao anon só select/insert em manutencoes. Para a
-- exclusão em cascata controlada pelo app (apagar as manutenções
-- antes do equipamento, no caso de registro errado), falta a
-- política + GRANT de delete.
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

create policy "exclusao publica (fase sem auth)"
  on public.manutencoes
  for delete
  using (true);

grant delete on public.manutencoes to anon, authenticated;
