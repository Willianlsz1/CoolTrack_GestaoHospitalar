-- ============================================================
-- Migration 0003 — Storage para fotos de equipamentos
-- Projeto: HospTrack — Fase 1
-- ------------------------------------------------------------
-- Mesma lógica de GRANT + RLS da tabela, agora para ARQUIVOS.
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

-- 1) O BUCKET ------------------------------------------------
-- Bucket público: as fotos são servidas por URL direta, sem
-- precisar de URL assinada. on conflict do nothing torna a
-- migração segura de rodar mais de uma vez.
insert into storage.buckets (id, name, public)
values ('equipamentos', 'equipamentos', true)
on conflict (id) do nothing;

-- 2) POLÍTICA DE UPLOAD -------------------------------------
-- storage.objects já vem com RLS ligado pelo Supabase. Sem uma
-- política de insert, o papel anon não consegue subir arquivo.
-- Esta política libera upload SOMENTE neste bucket.
-- (Leitura é automática por ser bucket público; update/delete
--  ficam de fora até terem necessidade — menor privilégio.)
create policy "upload publico de fotos (fase 1 - sem auth)"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'equipamentos');
