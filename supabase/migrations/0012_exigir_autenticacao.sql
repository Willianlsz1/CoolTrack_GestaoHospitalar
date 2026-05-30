-- ============================================================
-- Migration 0012 — Exigir autenticação (Auth-b)
-- Projeto: CoolTrack
-- ------------------------------------------------------------
-- Tira o acesso do papel anônimo. A camada GRANT bloqueia antes do
-- RLS, então revogar os privilégios do `anon` já barra qualquer
-- acesso sem login. O papel `authenticated` mantém os grants das
-- migrações anteriores — o app logado continua funcionando.
-- IMPORTANTE: rode com o app LOGADO para confirmar que não quebrou.
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

-- 1) Tabelas: revoga o anon.
revoke select, insert, update, delete on public.equipamentos from anon;
revoke select, insert, update, delete on public.manutencoes from anon;
revoke execute
  on function public.excluir_equipamento_em_cascata(uuid)
  from anon;

-- 2) Storage: escrita só para autenticados. A LEITURA continua pública
--    (bucket public — decisão de manter as fotos visíveis por URL).
drop policy if exists "upload publico de fotos (fase 1 - sem auth)"
  on storage.objects;
drop policy if exists "exclusao publica de fotos (fase 1 - sem auth)"
  on storage.objects;

create policy "upload de fotos (autenticado)"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'equipamentos');

create policy "exclusao de fotos (autenticado)"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'equipamentos');
