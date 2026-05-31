-- ============================================================
-- Migration 0016 — Papéis (admin/técnico) — Parte 2
-- Projeto: CoolTrack
-- ------------------------------------------------------------
-- Adiciona role ao perfil e restringe a EXCLUSÃO de equipamento ao
-- admin (única ação destrutiva/irreversível). Demais ações seguem
-- liberadas ao técnico (cadastrar, editar, registrar manutenção).
-- IMPORTANTE: depois de rodar, promova seu usuário a admin (ver fim).
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

-- 1) role no perfil (padrão técnico).
alter table public.perfis
  add column role text not null default 'tecnico'
  check (role in ('admin', 'tecnico'));

-- 2) is_admin(): o usuário logado é admin? security definer + stable
--    para ler perfis sem recursão de RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- 3) Excluir equipamento: só admin. (A função de cascata é security
--    invoker, então respeita esta regra: técnico que tentar, o banco
--    recusa e a transação inteira volta atrás.)
drop policy if exists "equipamentos delete (autenticado)" on public.equipamentos;
create policy "equipamentos delete (admin)"
  on public.equipamentos
  for delete
  to authenticated
  using (public.is_admin());

-- 4) BOOTSTRAP — defina o primeiro admin (troque pelo SEU e-mail):
-- update public.perfis set role = 'admin' where email = 'seu@email.com';
