-- ============================================================
-- Migration 0026 — Trilha de auditoria das aprovações (S3)
-- Projeto: CoolTrack — fix de segurança do review
-- ------------------------------------------------------------
-- Problema: as 4 colunas de aprovação vivem na própria manutencoes e guardam
-- só a ÚLTIMA decisão. Aprovar e depois reprovar sobrescreve a anterior — sem
-- rastro. Para auditoria de PMOC, é preciso provar a SEQUÊNCIA de decisões
-- ("quem decidiu o quê e quando"), de forma imutável.
--
-- Correção: tabela append-only aprovacoes_log, alimentada por TRIGGER no
-- banco (não no app, que seria burlável). Toda mudança nas colunas de
-- aprovação vira uma linha nova. Em lote, é uma linha por serviço (a trigger
-- roda por linha). Ninguém edita nem apaga o log pela API; só admin lê.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

-- 1) TABELA append-only -------------------------------------
create table public.aprovacoes_log (
  id bigint generated always as identity primary key,
  manutencao_id uuid not null references public.manutencoes (id) on delete cascade,
  status_anterior text,
  status text not null,
  motivo text,
  decidido_por uuid references public.perfis (id),
  decidido_em timestamptz not null default now()
);

create index aprovacoes_log_manutencao_idx
  on public.aprovacoes_log (manutencao_id, decidido_em);

alter table public.aprovacoes_log enable row level security;

-- Só admin LÊ (dado de auditoria). Sem grant de insert/update/delete para
-- authenticated => append-only: só a trigger (abaixo) escreve, e ninguém
-- altera ou apaga linha de log pela API.
grant select on public.aprovacoes_log to authenticated;

create policy "aprovacoes_log select (admin)"
  on public.aprovacoes_log for select to authenticated
  using (public.is_admin());

-- 2) TRIGGER que registra cada decisão ----------------------
-- security definer para inserir no log ignorando o (ausente) grant de insert.
-- Dispara só quando uma coluna de aprovação muda de fato.
create function public.registrar_aprovacao_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.aprovacoes_log
    (manutencao_id, status_anterior, status, motivo, decidido_por)
  values
    (new.id, old.aprovacao_status, new.aprovacao_status,
     new.aprovacao_motivo, new.aprovado_por);
  return new;
end;
$$;

create trigger manutencoes_aprovacao_log
  after update on public.manutencoes
  for each row
  when (
    old.aprovacao_status is distinct from new.aprovacao_status
    or old.aprovado_por is distinct from new.aprovado_por
    or old.aprovacao_motivo is distinct from new.aprovacao_motivo
  )
  execute function public.registrar_aprovacao_log();
