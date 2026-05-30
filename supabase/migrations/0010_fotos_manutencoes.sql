-- ============================================================
-- Migration 0010 — Fotos antes/depois nas manutenções
-- Projeto: HospTrack — Fase 3 (passo 3d)
-- ------------------------------------------------------------
-- Duas colunas de URL de foto (antes e depois da intervenção). As
-- fotos são guardadas no bucket público "equipamentos" já existente
-- (decisão: sem bucket novo), então não há mudança de Storage aqui.
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

alter table public.manutencoes
  add column if not exists foto_antes_url text;

alter table public.manutencoes
  add column if not exists foto_depois_url text;
