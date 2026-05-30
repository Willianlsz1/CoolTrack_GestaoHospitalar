-- ============================================================
-- Migration 0006 — Permitir atualização de equipamentos
-- Projeto: HospTrack — Fase 1
-- ------------------------------------------------------------
-- Política RLS (quais linhas) + GRANT (privilégio), para UPDATE.
-- update precisa de USING (quais linhas posso alterar) e
-- WITH CHECK (validar o resultado da alteração).
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

create policy "atualizacao publica (fase 1 - sem auth)"
  on public.equipamentos
  for update
  using (true)
  with check (true);

grant update on public.equipamentos to anon, authenticated;
