-- ============================================================
-- Migration 0013 — Hardening da autenticação (review)
-- Projeto: CoolTrack
-- ------------------------------------------------------------
-- B) O Postgres concede EXECUTE de função a PUBLIC por padrão. A 0012
--    só revogou do anon, então o grant PUBLIC continuava. Revoga de
--    PUBLIC e concede só ao authenticated.
-- E) As políticas das tabelas eram `using(true)` sem `to authenticated`
--    (valiam para PUBLIC). Recria com `to authenticated` — 2ª tranca
--    (defesa em profundidade) caso o anon seja re-concedido por engano.
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

-- B) Função de cascata: execute só para authenticated.
revoke execute
  on function public.excluir_equipamento_em_cascata(uuid)
  from public;
grant execute
  on function public.excluir_equipamento_em_cascata(uuid)
  to authenticated;

-- E) equipamentos — recria as políticas com `to authenticated`.
drop policy if exists "leitura publica (fase 1 - sem auth)" on public.equipamentos;
drop policy if exists "escrita publica (fase 1 - sem auth)" on public.equipamentos;
drop policy if exists "exclusao publica (fase 1 - sem auth)" on public.equipamentos;
drop policy if exists "atualizacao publica (fase 1 - sem auth)" on public.equipamentos;

create policy "equipamentos select (autenticado)"
  on public.equipamentos for select to authenticated using (true);
create policy "equipamentos insert (autenticado)"
  on public.equipamentos for insert to authenticated with check (true);
create policy "equipamentos update (autenticado)"
  on public.equipamentos for update to authenticated using (true) with check (true);
create policy "equipamentos delete (autenticado)"
  on public.equipamentos for delete to authenticated using (true);

-- E) manutencoes — idem (sem update; nunca houve política de update).
drop policy if exists "leitura publica (fase sem auth)" on public.manutencoes;
drop policy if exists "escrita publica (fase sem auth)" on public.manutencoes;
drop policy if exists "exclusao publica (fase sem auth)" on public.manutencoes;

create policy "manutencoes select (autenticado)"
  on public.manutencoes for select to authenticated using (true);
create policy "manutencoes insert (autenticado)"
  on public.manutencoes for insert to authenticated with check (true);
create policy "manutencoes delete (autenticado)"
  on public.manutencoes for delete to authenticated using (true);
