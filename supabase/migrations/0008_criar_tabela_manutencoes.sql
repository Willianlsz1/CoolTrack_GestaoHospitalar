-- ============================================================
-- Migration 0008 — Tabela de manutenções
-- Projeto: HospTrack — Fase 3 (Manutenções)
-- ------------------------------------------------------------
-- Primeiro relacionamento do projeto: 1 equipamento → N manutenções.
-- Schema alinhado ao Documento Fundacional (seção 3.3).
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- ============================================================

create table public.manutencoes (
  id uuid primary key default gen_random_uuid(),

  -- Chave estrangeira para o equipamento. ON DELETE RESTRICT: não
  -- deixa apagar um equipamento que tenha manutenções (protege o
  -- histórico de sumir por engano — importante para auditoria).
  equipamento_id uuid not null
    references public.equipamentos (id) on delete restrict,

  tipo text not null,                       -- ver CHECK abaixo
  data date not null default current_date,  -- quando a visita ocorreu
  tecnico text,                             -- nome do responsável (texto livre por ora)
  descricao text,                           -- o que foi feito
  pecas text,                               -- peças trocadas + referência
  proxima_manutencao date,                  -- próxima agendada

  created_at timestamptz not null default now(),

  constraint manutencoes_tipo_check
    check (tipo in ('preventiva', 'corretiva', 'preditiva'))
);

-- Índice para listar o histórico de um equipamento rápido e ordenado
-- por data (mais recente primeiro).
create index manutencoes_equipamento_id_idx
  on public.manutencoes (equipamento_id, data desc);

-- ============================================================
-- RLS — mesma postura da Fase 1 (sem auth ainda): políticas
-- públicas explícitas + GRANT. Trocar por políticas baseadas em
-- usuário quando entrar o Supabase Auth.
-- ============================================================
alter table public.manutencoes enable row level security;

create policy "leitura publica (fase sem auth)"
  on public.manutencoes
  for select
  using (true);

create policy "escrita publica (fase sem auth)"
  on public.manutencoes
  for insert
  with check (true);

grant select, insert on public.manutencoes to anon, authenticated;
