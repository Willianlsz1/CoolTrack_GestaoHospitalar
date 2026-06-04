-- ============================================================
-- Migration 0025 — Fecha o vazamento de email/role em perfis (S2)
-- Projeto: CoolTrack — fix de segurança do review
-- ------------------------------------------------------------
-- Problema: a policy "perfis select (autenticado) using(true)" + o GRANT
-- SELECT na tabela inteira deixavam QUALQUER autenticado ler email e role
-- de TODOS os usuários pela API (dado pessoal — LGPD). A UI esconde, mas a
-- parede real (RLS) não segura, porque RLS filtra LINHA, não COLUNA.
--
-- Correção: segurança de COLUNA é por GRANT, e GRANT vale por papel do banco
-- (admin e técnico são o mesmo papel `authenticated`). Então:
--   1) authenticated só LÊ id e nome da tabela (o que todo mundo precisa
--      para mostrar nomes nos registros). email/role somem da tabela.
--   2) Os dois casos legítimos voltam por funções SECURITY DEFINER, que
--      rodam como dono (ignoram o grant de coluna) e checam o acesso na mão:
--        - meu_perfil(): devolve a PRÓPRIA linha (com role/email).
--        - listar_usuarios(): só responde se is_admin(); devolve todos.
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

-- 1) TRAVA POR COLUNA ---------------------------------------
-- Tira o select amplo e reabre só id e nome. A policy de SELECT continua
-- `using(true)`: todo mundo enxerga as LINHAS, mas só estas colunas.
revoke select on public.perfis from authenticated;
grant select (id, nome) on public.perfis to authenticated;

-- 2) MEU PERFIL ---------------------------------------------
-- A própria linha, completa (id, nome, email, role, created_at). Alimenta a
-- detecção de admin e a tela "Meu perfil". security definer p/ ler as colunas
-- sensíveis; sempre restrito a auth.uid(), então só vê o seu.
create or replace function public.meu_perfil()
returns public.perfis
language sql
security definer
set search_path = public
stable
as $$
  select * from public.perfis where id = auth.uid();
$$;

grant execute on function public.meu_perfil() to authenticated;

-- 3) LISTAR USUÁRIOS (admin) --------------------------------
-- Lista de todos com email/role, para o painel de Usuários. Recusa quem não
-- for admin (a checagem é no banco, não na UI).
create or replace function public.listar_usuarios()
returns table (id uuid, nome text, email text, role text)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'apenas admin';
  end if;
  return query
    select p.id, p.nome, p.email, p.role
    from public.perfis p
    order by p.nome;
end;
$$;

grant execute on function public.listar_usuarios() to authenticated;
