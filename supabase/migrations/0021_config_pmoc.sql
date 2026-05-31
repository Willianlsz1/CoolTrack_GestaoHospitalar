-- ============================================================
-- Migration 0021 — Configuração do PMOC (estabelecimento + RT)
-- Projeto: CoolTrack — Fase D do checklist digital (decisão 0006)
-- ------------------------------------------------------------
-- Dados que a lei exige no documento PMOC: identificação do
-- estabelecimento e do responsável técnico (RT) com ART/TRT.
-- É um cadastro ÚNICO do hospital (singleton: sempre id = 1).
--
-- Leitura para todo autenticado (o cabeçalho do relatório usa);
-- escrita só admin.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

create table public.config_pmoc (
  -- Singleton: uma linha só (id = 1).
  id smallint primary key default 1,

  -- Estabelecimento.
  hospital_nome text,
  hospital_cnpj text,
  hospital_endereco text,

  -- Responsável Técnico.
  rt_nome text,
  rt_conselho text, -- CREA / CFT (texto livre)
  rt_registro text, -- nº de registro no conselho
  rt_documento text, -- nº da ART/TRT

  atualizado_em timestamptz not null default now(),

  constraint config_pmoc_singleton check (id = 1)
);

-- RLS + GRANTS: leitura autenticada; escrita só admin.
alter table public.config_pmoc enable row level security;

grant select, insert, update on public.config_pmoc to authenticated;

create policy "config_pmoc select (autenticado)"
  on public.config_pmoc for select to authenticated using (true);

create policy "config_pmoc insert (admin)"
  on public.config_pmoc for insert to authenticated
  with check (public.is_admin());

create policy "config_pmoc update (admin)"
  on public.config_pmoc for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Semeia a linha única (vazia) para o app sempre ter id = 1 para editar.
insert into public.config_pmoc (id) values (1) on conflict (id) do nothing;
