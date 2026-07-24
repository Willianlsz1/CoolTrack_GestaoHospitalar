-- ============================================================
-- Migration 0027 — Manutenção indelével (evidência não se apaga)
-- Projeto: CoolTrack — hardening pré-piloto
-- ------------------------------------------------------------
-- PROBLEMA: a 0009 concedeu `delete` em manutencoes ao papel anon/
-- authenticated e a 0013 recriou a política como `using (true)`. Ou seja:
-- QUALQUER usuário logado apagava QUALQUER serviço — inclusive os que não
-- registrou, inclusive os já aprovados. Todo o resto do sistema (assinatura
-- amarrada ao autor na 0024, trilha append-only na 0026) protege contra
-- ALTERAR a evidência, mas nada impedia de FAZÊ-LA SUMIR. Apagar é a edição
-- mais radical que existe.
--
-- Agravante: aprovacoes_log referencia manutencoes com `on delete cascade`.
-- Apagar o serviço levava junto a trilha de quem o aprovou — o log
-- append-only tinha uma porta dos fundos.
--
-- CORREÇÃO: ninguém apaga manutenção pela API. O registro do serviço passa a
-- ser indelével, como convém a um documento de compliance (o PMOC precisa
-- provar a SEQUÊNCIA de higienizações; um buraco no histórico é exatamente o
-- que a fiscalização procura).
--
-- E a exclusão de equipamento? Continua existindo (cadastro duplicado/errado
-- acontece), mas agora só o admin, e só pela função de cascata — que deixa de
-- ser `security invoker` (rodava com a permissão do chamador, que acabou de
-- perder o delete) e vira `security definer` com guarda explícita de admin.
-- A decisão fica assim: técnico não apaga nada; admin não apaga um serviço
-- isolado; admin apaga o equipamento INTEIRO com todo o seu histórico — ato
-- deliberado, visível e já reconhecido na 0016 como a única ação destrutiva.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

-- 1) TIRA O DELETE DE MANUTENCOES -----------------------------
-- Duas camadas, como sempre: o GRANT (checado antes do RLS) e a POLÍTICA.
-- Revogar só o grant bastaria hoje, mas deixar a política `using (true)`
-- viva é uma armadilha para o próximo que reconceder o grant sem ler isto.
revoke delete on public.manutencoes from authenticated;
revoke delete on public.manutencoes from anon;

drop policy if exists "manutencoes delete (autenticado)" on public.manutencoes;
drop policy if exists "exclusao publica (fase sem auth)" on public.manutencoes;

-- 2) CASCATA SÓ PARA ADMIN ------------------------------------
-- security definer: roda com a permissão do DONO da função, que tem delete na
-- tabela. Por isso a guarda de admin precisa ser explícita aqui dentro — sem
-- ela, a função viraria justamente o buraco que a etapa 1 acabou de fechar.
-- `set search_path = public` fecha o vetor clássico de sequestro de função em
-- security definer (mesmo cuidado que a is_admin() da 0016 já toma).
create or replace function public.excluir_equipamento_em_cascata(eq_id uuid)
returns void
language plpgsql
security definer
set search_path = public
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

-- Reafirma o menor privilégio: o Postgres concede execute a PUBLIC por padrão
-- ao (re)criar a função — a mesma pegadinha que a 0013 corrigiu.
revoke execute on function public.excluir_equipamento_em_cascata(uuid) from public;
grant execute on function public.excluir_equipamento_em_cascata(uuid) to authenticated;

-- ============================================================
-- COMO CONFERIR (logado como TÉCNICO, no console do navegador)
--
--   // deve falhar: sem grant de delete
--   await window.supabase.from('manutencoes').delete().eq('id','ID').select()
--
--   // deve falhar: "Apenas administradores podem excluir equipamentos."
--   await window.supabase.rpc('excluir_equipamento_em_cascata',
--     { eq_id: 'ID_DE_UM_EQUIPAMENTO' })
--
--   // teste POSITIVO (não pode ter quebrado): registrar serviço funciona
--   await window.supabase.from('manutencoes').insert({ ... }).select()
-- ============================================================
