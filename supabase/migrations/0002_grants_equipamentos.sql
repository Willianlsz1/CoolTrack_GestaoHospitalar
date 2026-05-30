-- ============================================================
-- Migration 0002 — GRANTs da tabela equipamentos
-- Projeto: HospTrack — Fase 1
-- ------------------------------------------------------------
-- Corrige o erro "permission denied for table equipamentos".
--
-- Contexto: no Postgres há DUAS camadas de permissão separadas:
--   1. GRANT  → se o papel pode TOCAR na tabela (privilégio).
--   2. RLS    → QUAIS LINHAS o papel vê/grava (política).
-- A migração 0001 ligou o RLS e criou as políticas (camada 2),
-- mas faltou o GRANT (camada 1) para o papel `anon` — o papel
-- que a chave pública usa. Sem o GRANT, qualquer query devolve
-- "permission denied for table" (erro 42501), antes mesmo do RLS.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

-- Permite que os papéis enxerguem o schema public.
grant usage on schema public to anon, authenticated;

-- Concede SELECT e INSERT — exatamente as operações que já têm
-- política RLS na 0001. update/delete ficam de fora até terem
-- a própria política (princípio do menor privilégio).
grant select, insert on public.equipamentos to anon, authenticated;
