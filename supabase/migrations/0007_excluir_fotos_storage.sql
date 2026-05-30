-- ============================================================
-- Migration 0007 — Permitir exclusão de fotos no Storage
-- Projeto: HospTrack — Fase 1
-- ------------------------------------------------------------
-- A 0003 deu ao papel anon só o INSERT em storage.objects. Para
-- apagar o arquivo quando o equipamento é excluído (ou a foto é
-- trocada/removida), falta a política de DELETE neste bucket.
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

create policy "exclusao publica de fotos (fase 1 - sem auth)"
  on storage.objects
  for delete
  to anon, authenticated
  using (bucket_id = 'equipamentos');
