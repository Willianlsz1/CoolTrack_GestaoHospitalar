-- ============================================================
-- Migration 0019 — Modelos de checklist (PMOC)
-- Projeto: CoolTrack — Fase A do checklist digital (decisão 0006)
-- ------------------------------------------------------------
-- Define O QUE o técnico cumpre por tipo de equipamento × frequência.
-- Um modelo (ex.: ar_condicionado/mensal) tem uma lista ordenada de
-- itens {procedimento, servico}. Todos os equipamentos do tipo herdam.
--
-- Escrita só admin (igual setores); leitura para todo autenticado
-- (o técnico precisa ler o modelo para executar o checklist).
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

create table public.modelos_checklist (
  id uuid primary key default gen_random_uuid(),
  -- Mesmo conjunto de tipos do equipamento.
  tipo text not null,
  -- Frequência da rotina. O PMOC do hospital usa mensal + anual.
  frequencia text not null,
  -- Lista ORDENADA de itens: [{ "procedimento": "...", "servico": "..." }].
  -- servico = tipo de serviço (LIMPEZA, VERIFICAÇÃO, MEDIÇÃO…), texto livre.
  itens jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),

  constraint modelos_checklist_tipo_check
    check (tipo in ('geladeira', 'freezer', 'camara_fria', 'ar_condicionado', 'climatizador', 'outro')),
  constraint modelos_checklist_frequencia_check
    check (frequencia in ('mensal', 'anual')),
  -- Um modelo por combinação tipo + frequência.
  unique (tipo, frequencia)
);

-- RLS + GRANTS: leitura autenticada; escrita só admin.
alter table public.modelos_checklist enable row level security;

grant select, insert, update, delete on public.modelos_checklist to authenticated;

create policy "modelos_checklist select (autenticado)"
  on public.modelos_checklist for select to authenticated using (true);

create policy "modelos_checklist insert (admin)"
  on public.modelos_checklist for insert to authenticated
  with check (public.is_admin());

create policy "modelos_checklist update (admin)"
  on public.modelos_checklist for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "modelos_checklist delete (admin)"
  on public.modelos_checklist for delete to authenticated
  using (public.is_admin());
