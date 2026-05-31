-- ============================================================
-- Migration 0015 — Atribuição da manutenção (Auditoria, 1d)
-- Projeto: CoolTrack
-- ------------------------------------------------------------
-- registrado_por = quem registrou a manutenção (= o técnico, agora que
-- há login). Valor AUTOMÁTICO do usuário logado (default auth.uid());
-- FK para perfis permite mostrar o NOME pela relação. O RLS de insert
-- passa a exigir registrado_por = auth.uid() — não dá para registrar
-- como outra pessoa.
-- Como aplicar: SQL Editor do Supabase > cole > Run (logado).
-- ============================================================

alter table public.manutencoes
  add column registrado_por uuid
    references public.perfis (id)
    default auth.uid();

-- Recria o insert exigindo que registrado_por seja o próprio usuário.
drop policy if exists "manutencoes insert (autenticado)" on public.manutencoes;
create policy "manutencoes insert (autenticado)"
  on public.manutencoes
  for insert
  to authenticated
  with check (registrado_por = auth.uid());
