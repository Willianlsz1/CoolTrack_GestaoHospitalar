-- ============================================================
-- Migration 0023 — Aprovação de serviços (manutenções)
-- Projeto: CoolTrack — fila de aprovação do gestor
-- ------------------------------------------------------------
-- O gestor (admin) revisa cada serviço registrado pelo técnico e o
-- APROVA ou REPROVA (com motivo). É uma camada de AUDITORIA: NÃO mexe na
-- cadência do PMOC (o serviço conta para o relógio assim que registrado).
--
-- Estados: pendente (default) -> aprovado | reprovado.
-- reprovado exige motivo (constraint).
--
-- Segurança: só admin atualiza (policy is_admin), e o GRANT é por COLUNA —
-- ninguém (nem o admin) edita o serviço em si por aqui, só os 4 campos de
-- aprovação. Técnico não tem grant de update -> não se auto-aprova.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

-- 1) Colunas de aprovação ------------------------------------
alter table public.manutencoes
  add column if not exists aprovacao_status text not null default 'pendente',
  add column if not exists aprovado_por uuid references public.perfis (id),
  add column if not exists aprovado_em timestamptz,
  add column if not exists aprovacao_motivo text;

-- 2) Constraints (idempotentes) ------------------------------
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'manutencoes_aprovacao_status_check'
  ) then
    alter table public.manutencoes
      add constraint manutencoes_aprovacao_status_check
      check (aprovacao_status in ('pendente', 'aprovado', 'reprovado'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'manutencoes_reprovado_motivo_check'
  ) then
    alter table public.manutencoes
      add constraint manutencoes_reprovado_motivo_check
      check (aprovacao_status <> 'reprovado' or aprovacao_motivo is not null);
  end if;
end $$;

-- 3) Índice para a fila de pendentes -------------------------
create index if not exists manutencoes_aprovacao_status_idx
  on public.manutencoes (aprovacao_status);

-- 4) Permissão: só admin atualiza, e só as colunas de aprovação
grant update (aprovacao_status, aprovado_por, aprovado_em, aprovacao_motivo)
  on public.manutencoes to authenticated;

drop policy if exists "manutencoes update aprovacao (admin)" on public.manutencoes;
create policy "manutencoes update aprovacao (admin)"
  on public.manutencoes for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
