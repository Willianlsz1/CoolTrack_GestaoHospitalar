-- ============================================================
-- Migration 0004 — Reconciliar a tabela equipamentos
-- Projeto: HospTrack — Fase 1
-- ------------------------------------------------------------
-- Contexto: o banco vivo foi criado com uma versão ANTIGA do
-- schema (antes do alinhamento ao Documento Fundacional). Esta
-- migração ajusta as colunas para o schema canônico SEM recriar
-- a tabela (preserva os dados já cadastrados).
--
-- É idempotente nos dois caminhos:
--   - Banco divergente (antigo): conserta.
--   - Banco novo (criado pela 0001 já correta): vira no-op.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

-- 1) Renomeia numero_serie -> serie (PRESERVA o dado existente).
--    DO block torna o rename idempotente (rodar 2x não quebra).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'equipamentos'
      and column_name = 'numero_serie'
  ) then
    alter table public.equipamentos rename column numero_serie to serie;
  end if;
end $$;

-- 2) Remove a coluna que nunca fez parte do schema canônico
--    (decisão registrada em docs/decisoes/0001). Destrutivo, mas
--    a coluna está vazia.
alter table public.equipamentos drop column if exists temperatura_alvo;

-- 3) Adiciona as colunas que faltaram (idempotente).
alter table public.equipamentos add column if not exists patrimonio text;
alter table public.equipamentos add column if not exists andar text;
alter table public.equipamentos add column if not exists sala text;
alter table public.equipamentos add column if not exists data_garantia date;
alter table public.equipamentos add column if not exists foto_url text;
alter table public.equipamentos add column if not exists qr_code text;
