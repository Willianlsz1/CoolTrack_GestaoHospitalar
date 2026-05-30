-- ============================================================
-- Migration 0001 — Tabela de inventário de equipamentos
-- Projeto: HospTrack (Gestão de Ativos Hospitalares)
-- Fase 1 — Inventário de Equipamentos
-- ------------------------------------------------------------
-- Schema alinhado ao Documento Fundacional v1.0 (seções 3.1 e 5.3).
-- Como aplicar:
--   1. Painel do Supabase > SQL Editor > New query
--   2. Cole TODO este arquivo e clique em "Run"
-- ============================================================

-- 1) A TABELA ------------------------------------------------
create table public.equipamentos (
  -- Chave primária. uuid em vez de número sequencial:
  -- não vaza "quantos equipamentos existem" e evita colisão.
  -- gen_random_uuid() já vem nativo no Postgres do Supabase.
  id uuid primary key default gen_random_uuid(),

  -- Identificação do ativo
  nome text not null,                       -- ex.: "Freezer Vacinas - Sala 3"
  tipo text not null,                       -- ver CHECK abaixo
  marca text,
  modelo text,
  serie text,                               -- número de série do fabricante
  patrimonio text,                          -- nº de patrimônio interno do hospital

  -- Localização física (texto livre na Fase 1; vira tabela
  -- "setores" numa fase futura, conforme decidido).
  setor text,                               -- ex.: "Centro Cirúrgico", "Farmácia"
  andar text,                               -- texto: aceita "Térreo", "1º", "Subsolo"
  sala text,

  -- Operação
  status text not null default 'ativo',     -- ver CHECK abaixo
  data_instalacao date,
  data_garantia date,                       -- fim da garantia, se houver

  -- Mídia e identificação por QR (foto: Fase 1 / qr_code: Fase 2)
  foto_url text,                            -- URL da foto no Supabase Storage
  qr_code text,                             -- preenchido na Fase 2 (nullable agora)

  -- Auditoria: quando o registro foi criado.
  -- timestamptz guarda o fuso, evita confusão de horário.
  created_at timestamptz not null default now(),

  -- 2) REGRAS DE INTEGRIDADE (CHECKs) -----------------------
  -- CHECK com lista de valores (em vez de enum do Postgres,
  -- que é trabalhoso de alterar). Garante no banco que ninguém
  -- grave um tipo/status inválido, mesmo por engano.
  constraint equipamentos_tipo_check
    check (tipo in ('geladeira', 'freezer', 'camara_fria', 'ar_condicionado', 'climatizador', 'outro')),

  constraint equipamentos_status_check
    check (status in ('ativo', 'manutencao', 'inativo'))
);

-- 3) ÍNDICE para ordenação por data -------------------------
-- buscarEquipamentos() ordena por created_at DESC. Um índice
-- deixa essa ordenação rápida quando a tabela crescer.
create index equipamentos_created_at_idx
  on public.equipamentos (created_at desc);

-- ============================================================
-- 4) ROW LEVEL SECURITY (RLS)
-- ============================================================
-- O Supabase EXIGE RLS em tabelas públicas. Com RLS ligado e
-- SEM políticas, a chave anônima (a do seu .env.local) não lê
-- NEM escreve nada — e NÃO dá erro, só volta vazio. Por isso
-- ligamos o RLS e criamos políticas explícitas.
alter table public.equipamentos enable row level security;

-- ATENÇÃO: estas políticas liberam leitura e escrita para
-- QUALQUER um com a chave anônima. Adequado AGORA (Fase 1, sem
-- login). Quando entrar o Supabase Auth (Fase de autenticação),
-- trocamos por políticas baseadas em usuário autenticado.
create policy "leitura publica (fase 1 - sem auth)"
  on public.equipamentos
  for select
  using (true);

create policy "escrita publica (fase 1 - sem auth)"
  on public.equipamentos
  for insert
  with check (true);
