-- ============================================================
-- Migration 0017 — Corrige escalada de privilégio em perfis
-- Projeto: CoolTrack — fix CRÍTICO do review de segurança
-- ------------------------------------------------------------
-- Problema: o RLS é por LINHA (não por coluna). A política
-- "perfis update proprio" + o GRANT UPDATE amplo deixavam o usuário
-- editar QUALQUER coluna da própria linha — inclusive `role` (criada
-- na 0016). Um técnico podia se auto-promover a admin pela API:
--   update perfis set role = 'admin' where id = auth.uid()
-- Correção: GRANT por COLUNA — authenticated só atualiza `nome`.
-- (Promover admin continua via SQL direto, papel postgres, não
--  afetado por este grant.)
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

revoke update on public.perfis from authenticated;
grant update (nome) on public.perfis to authenticated;
