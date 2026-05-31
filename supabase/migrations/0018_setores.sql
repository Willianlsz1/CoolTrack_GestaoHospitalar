-- ============================================================
-- Migration 0018 — Setores + cadência/specs no equipamento
-- Projeto: CoolTrack — Fase 1 (Compliance PMOC)
-- ------------------------------------------------------------
-- Implementa a decisão 0005: setor vira ENTIDADE (tabela `setores`),
-- fonte do intervalo PADRÃO de manutenção. O intervalo EFETIVO vive no
-- equipamento (par mensal + anual), nascendo do default do setor.
-- Também adiciona os atributos de HVAC vistos no PMOC real (carga, área).
--
-- Sem seed: os setores são cadastrados pelo admin conforme a demanda.
-- A coluna antiga `equipamentos.setor` (texto) é MANTIDA por enquanto —
-- será removida num passo de limpeza depois que a UI usar `setor_id`.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

-- 1) TABELA setores -----------------------------------------
create table public.setores (
  id uuid primary key default gen_random_uuid(),
  -- Nome único evita "CME" e "cme" virarem setores distintos.
  nome text not null unique,
  -- Intervalo PADRÃO (mensal, em dias) dos equipamentos do setor.
  -- CME = 15; demais = 30. É só o default — o valor efetivo fica no
  -- equipamento (intervalo_mensal).
  intervalo_dias int not null default 30 check (intervalo_dias > 0),
  created_at timestamptz not null default now()
);

-- 2) RLS + GRANTS de setores --------------------------------
-- Leitura: todo autenticado. Escrita (criar/editar/excluir): só admin.
alter table public.setores enable row level security;

grant select, insert, update, delete on public.setores to authenticated;

create policy "setores select (autenticado)"
  on public.setores for select to authenticated using (true);

create policy "setores insert (admin)"
  on public.setores for insert to authenticated with check (public.is_admin());

create policy "setores update (admin)"
  on public.setores for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "setores delete (admin)"
  on public.setores for delete to authenticated using (public.is_admin());

-- 3) Colunas novas em equipamentos --------------------------
-- setor_id: referência ao setor. on delete set null — apagar um setor
-- não bloqueia nem apaga equipamentos; eles ficam "sem setor".
alter table public.equipamentos
  add column if not exists setor_id uuid references public.setores(id) on delete set null,
  -- Cadência efetiva (par mensal + anual). mensal nasce do setor ao
  -- atribuir; anual padrão 365 (PMOC).
  add column if not exists intervalo_mensal int check (intervalo_mensal is null or intervalo_mensal > 0),
  add column if not exists intervalo_anual int not null default 365 check (intervalo_anual > 0),
  -- Atributos de HVAC (do PMOC): carga em BTU e área climatizada em m².
  add column if not exists carga_btu int check (carga_btu is null or carga_btu >= 0),
  add column if not exists area_m2 numeric check (area_m2 is null or area_m2 >= 0);

-- Índice para o join equipamento -> setor (lista, ficha, relatório).
create index if not exists equipamentos_setor_id_idx
  on public.equipamentos (setor_id);
