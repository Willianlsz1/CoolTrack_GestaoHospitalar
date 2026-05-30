-- ============================================================
-- Migration 0005 — Permitir exclusão de equipamentos
-- Projeto: HospTrack — Fase 1
-- ------------------------------------------------------------
-- Mesma dupla de sempre: política RLS (quais linhas) + GRANT
-- (privilégio de tabela), agora para a operação DELETE.
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

-- Política RLS: libera exclusão de qualquer linha (fase sem auth).
-- Quando entrar o Supabase Auth, restringimos por usuário.
create policy "exclusao publica (fase 1 - sem auth)"
  on public.equipamentos
  for delete
  using (true);

-- GRANT: concede o privilégio de DELETE ao papel anon.
grant delete on public.equipamentos to anon, authenticated;
