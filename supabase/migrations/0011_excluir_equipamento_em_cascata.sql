-- ============================================================
-- Migration 0011 — Exclusão em cascata atômica (função)
-- Projeto: HospTrack — correção do review da Fase 3
-- ------------------------------------------------------------
-- A exclusão em cascata era feita em 2 passos no app (apaga
-- manutenções, depois o equipamento). Se o 2º falhasse, ficava
-- "meio apagado". Esta função faz as duas exclusões numa ÚNICA
-- transação (funções no Postgres são atômicas) — ou apaga tudo,
-- ou nada.
--
-- security invoker: roda com as permissões de quem chama (anon),
-- então as políticas RLS continuam valendo.
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

create or replace function public.excluir_equipamento_em_cascata(eq_id uuid)
returns void
language plpgsql
security invoker
as $$
begin
  delete from public.manutencoes where equipamento_id = eq_id;
  delete from public.equipamentos where id = eq_id;
end;
$$;

grant execute on function public.excluir_equipamento_em_cascata(uuid)
  to anon, authenticated;
