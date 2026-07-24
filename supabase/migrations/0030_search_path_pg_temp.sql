-- ============================================================
-- Migration 0030 — search_path à prova de tabela temporária
-- Projeto: CoolTrack — defesa em profundidade
-- ------------------------------------------------------------
-- CONTEXTO: toda função SECURITY DEFINER roda com o privilégio do DONO
-- (postgres, que ignora RLS). Se o corpo cita uma tabela SEM schema
-- (`perfis` em vez de `public.perfis`), quem decide onde o Postgres procura
-- é o `search_path` — que é config de SESSÃO, ou seja, do CHAMADOR. O
-- atacante aponta o nome para uma tabela dele e a função lê dados forjados
-- com poder de dono.
--
-- O QUE ESTAVA PELA METADE: as funções usam `set search_path = public`, que
-- NÃO fecha o vetor. O schema temporário (`pg_temp`) é pesquisado PRIMEIRO
-- quando não aparece na lista, e é gravável por qualquer um — a doc do
-- PostgreSQL destaca isso justamente em "Writing SECURITY DEFINER Functions
-- Safely". Criar tabela em `public` o Supabase barra; criar tabela
-- TEMPORÁRIA, em geral, não.
--
-- A forma canônica é `pg_temp` como ÚLTIMO item: forçado para o fim da fila,
-- deixa de mascarar `public`.
--
-- IMPORTANTE — isto NÃO corrige uma brecha aberta: todas as cinco funções já
-- qualificam cada referência (`public.perfis`, `public.manutencoes`, ...), e
-- nome qualificado não passa por search_path nenhum. É a segunda tranca, para
-- o dia em que uma função nova esquecer de qualificar. As duas defesas são
-- independentes de propósito.
--
-- Só o `set` muda; os corpos são idênticos aos das migrações de origem
-- (0016, 0025, 0026, 0027). `create or replace` preserva o OID, então a
-- trigger manutencoes_aprovacao_log continua apontando para a função — não
-- precisa recriar a trigger.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

-- 1) is_admin() — origem: 0016 -------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2) meu_perfil() — origem: 0025 -----------------------------
create or replace function public.meu_perfil()
returns public.perfis
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select * from public.perfis where id = auth.uid();
$$;

-- 3) listar_usuarios() — origem: 0025 ------------------------
create or replace function public.listar_usuarios()
returns table (id uuid, nome text, email text, role text)
language plpgsql
security definer
set search_path = public, pg_temp
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

-- 4) registrar_aprovacao_log() — origem: 0026 ----------------
create or replace function public.registrar_aprovacao_log()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.aprovacoes_log
    (manutencao_id, status_anterior, status, motivo, decidido_por)
  values
    (new.id, old.aprovacao_status, new.aprovacao_status,
     new.aprovacao_motivo, new.aprovado_por);
  return new;
end;
$$;

-- 5) excluir_equipamento_em_cascata() — origem: 0027 ---------
create or replace function public.excluir_equipamento_em_cascata(eq_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem excluir equipamentos.'
      using errcode = '42501'; -- insufficient_privilege
  end if;

  delete from public.manutencoes where equipamento_id = eq_id;
  delete from public.equipamentos where id = eq_id;
end;
$$;

-- `create or replace` NÃO mexe nos grants existentes, mas reafirmá-los é
-- barato e documenta quem pode chamar o quê (menor privilégio explícito).
revoke execute on function public.excluir_equipamento_em_cascata(uuid) from public;
grant execute on function public.excluir_equipamento_em_cascata(uuid) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.meu_perfil() to authenticated;
grant execute on function public.listar_usuarios() to authenticated;

-- ============================================================
-- COMO CONFERIR
--
--   select p.proname, p.proconfig
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and p.prosecdef;
--
-- Esperado: as cinco com proconfig = {"search_path=public, pg_temp"}.
-- Se aparecer alguma função SECURITY DEFINER fora dessa lista, ela ficou
-- para trás — é o que esta consulta serve para pegar no futuro.
--
-- Teste de não-regressão (o app não pode ter quebrado):
--   - login como técnico: dashboard e histórico carregam;
--   - login como admin: painel de Usuários lista, aprovar serviço grava no
--     log, excluir equipamento com histórico funciona.
-- ============================================================
