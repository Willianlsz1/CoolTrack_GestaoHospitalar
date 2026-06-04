-- ============================================================
-- Migration 0024 — Amarra a assinatura da aprovação ao autor logado
-- Projeto: CoolTrack — endurecimento da review de segurança (S1)
-- ------------------------------------------------------------
-- A policy de update de aprovação (0023) exigia is_admin(), mas NÃO amarrava
-- `aprovado_por` ao usuário logado. Um admin poderia gravar `aprovado_por` com
-- o id de OUTRO admin, falsificando a "assinatura" mostrada na ficha.
--
-- Correção: o WITH CHECK passa a exigir aprovado_por = auth.uid() — a
-- assinatura só pode ser do próprio decisor (mesmo padrão da 0015 para
-- registrado_por no insert). O cliente já envia aprovado_por = user.id, então
-- o uso legítimo não muda.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

drop policy if exists "manutencoes update aprovacao (admin)" on public.manutencoes;
create policy "manutencoes update aprovacao (admin)"
  on public.manutencoes for update to authenticated
  using (public.is_admin())
  with check (public.is_admin() and aprovado_por = auth.uid());
