-- ============================================================
-- Migration 0014 — Perfis de usuário (Auditoria, Parte 1)
-- Projeto: CoolTrack
-- ------------------------------------------------------------
-- Cada usuário ganha um perfil com NOME próprio (o e-mail é o login,
-- mas o nome é o que aparece nos registros). Base também para os
-- papéis (admin/técnico) da Parte 2.
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

-- 1) TABELA -------------------------------------------------
-- id = id do usuário no Auth (1 perfil por usuário).
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- Todos os autenticados LEEM os perfis (para mostrar nomes nos registros).
create policy "perfis select (autenticado)"
  on public.perfis for select to authenticated using (true);

-- Cada um edita APENAS o próprio perfil.
create policy "perfis update proprio"
  on public.perfis for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

grant select, update on public.perfis to authenticated;

-- 2) TRIGGER ------------------------------------------------
-- Ao criar um usuário no Auth, cria o perfil automaticamente. O nome
-- vem do metadata informado no cadastro (raw_user_meta_data->>'nome').
-- security definer: roda como dono da função (ignora RLS) para poder
-- inserir o perfil em nome do sistema de Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome, email)
  values (new.id, new.raw_user_meta_data ->> 'nome', new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 3) BACKFILL -----------------------------------------------
-- Cria perfis para usuários que JÁ existiam (o trigger só pega novos).
-- Ficam sem nome até a pessoa preencher em "Meu perfil".
insert into public.perfis (id, email)
select id, email from auth.users
on conflict (id) do nothing;
