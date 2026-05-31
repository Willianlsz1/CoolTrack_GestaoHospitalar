-- ============================================================
-- Migration 0022 — Responsável do setor
-- Projeto: CoolTrack — melhoria da tela de Setores
-- ------------------------------------------------------------
-- Cada setor passa a ter UM responsável (um usuário do sistema). É um
-- vínculo opcional: setor sem responsável é válido.
--
-- on delete set null: apagar o usuário NÃO apaga nem trava o setor —
-- apenas esvazia o responsável (fica "sem responsável").
--
-- RLS: a tabela `setores` já tem escrita restrita a admin (migração 0018)
-- e o RLS vale por LINHA, então a coluna nova é coberta automaticamente.
-- A FK garante que o responsável é um perfil real.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

alter table public.setores
  add column if not exists responsavel_id uuid
    references public.perfis (id) on delete set null;

-- Índice para o join setor -> responsável (lista de setores).
create index if not exists setores_responsavel_id_idx
  on public.setores (responsavel_id);
