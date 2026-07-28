-- ============================================================
-- AMBIENTE DEMO (projeto cooltrack-demo) — conta do visitante,
-- reset noturno automático e trava anti-sequestro.
--
-- SÓ RODAR NO PROJETO DEMO. Nunca no banco de produção: a
-- função demo_reset() APAGA TODOS os dados das tabelas e
-- remove usuários.
--
-- Este script é re-rodável: pode colar de novo a qualquer
-- momento no SQL Editor do projeto demo.
--
-- O que ele faz:
--   1. Fixa a identidade do visitante (UUID, não e-mail).
--   2. Trava as três formas de sequestrar a conta pública:
--      trocar o e-mail, trocar a senha e zerar senha_trocada_em.
--   3. demo_reset(): zera tudo, remove usuários criados por
--      visitantes, restaura a conta pública e re-semeia.
--   4. Agenda o reset diário às 03:00 (horário de Brasília).
-- ============================================================

-- ------------------------------------------------------------
-- 1) IDENTIDADE DO VISITANTE, POR UUID
-- ------------------------------------------------------------
-- Por que UUID e não e-mail: o app permite `updateUser({ email })`,
-- então um visitante pode trocar o próprio e-mail. Um reset que
-- procura por e-mail passaria a casar ZERO linhas e a conta
-- pública ficaria quebrada para sempre — nem o cron consertaria.
-- O UUID é imutável.
create or replace function public.demo_visitante_id()
returns uuid
language sql
immutable
as $$ select '2358b49b-98aa-44d8-a2ed-80909f895e78'::uuid $$;

revoke execute on function public.demo_visitante_id() from public, anon, authenticated;

-- ------------------------------------------------------------
-- 2) TRAVAS ANTI-SEQUESTRO
-- ------------------------------------------------------------
-- O reset noturno cura o estado dos DADOS, mas não adianta curar
-- os dados se a conta de entrada estiver quebrada — a pessoa nem
-- chega no app. Estas travas impedem que o dano dure até as 03:00.

-- 2a) auth.users: bloqueia troca de e-mail e de senha da conta
--     pública. Um trigger BEFORE UPDATE que devolve os valores
--     antigos: a chamada da API "funciona" (não quebra a UI com
--     erro feio), mas não muda nada.
create or replace function public.demo_protege_visitante()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.id = public.demo_visitante_id() then
    new.email             := old.email;
    new.encrypted_password := old.encrypted_password;
    new.phone             := old.phone;
  end if;
  return new;
end;
$$;

drop trigger if exists demo_protege_visitante on auth.users;
create trigger demo_protege_visitante
  before update on auth.users
  for each row
  execute function public.demo_protege_visitante();

-- 2b) perfis: a 0029 concede `update (senha_trocada_em)` ao
--     authenticated. Zerar essa coluna joga o visitante na tela
--     de troca obrigatória de senha e, pela 0031, bloqueia
--     registrar manutenção. Mesma técnica: devolve o valor antigo.
create or replace function public.demo_protege_perfil_visitante()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.id = public.demo_visitante_id() then
    new.senha_trocada_em := old.senha_trocada_em;
    new.role             := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists demo_protege_perfil_visitante on public.perfis;
create trigger demo_protege_perfil_visitante
  before update on public.perfis
  for each row
  execute function public.demo_protege_perfil_visitante();

-- 2c) Estado inicial correto da conta pública.
update public.perfis
set nome = 'Visitante (demo)',
    role = 'admin',
    senha_trocada_em = now()
where id = public.demo_visitante_id();

-- ------------------------------------------------------------
-- 3) A FUNÇÃO DE RESET
-- ------------------------------------------------------------
create or replace function public.demo_reset()
returns void
language plpgsql
security definer
set search_path = public, pg_temp   -- pg_temp por último (padrão da 0030)
as $$
declare
  v_id uuid := public.demo_visitante_id();
begin
  -- 3a) Zera os dados de negócio (ordem respeita as FKs).
  delete from public.manutencoes;
  delete from public.equipamentos;
  delete from public.setores;

  -- 3b) Remove TODA conta que não seja a do visitante.
  --     O visitante é admin no demo e pode criar usuários pelo
  --     painel; sem isto, contas criadas por estranhos (com nomes
  --     que ninguém escolheu) sobreviveriam a todos os resets e
  --     apareceriam na demonstração. O delete em auth.users
  --     cascateia para public.perfis (FK da 0014).
  delete from auth.users where id <> v_id;

  -- 3c) Restaura a conta pública por UUID. Cobre o caso de alguém
  --     ter alterado algo antes de as travas da seção 2 existirem.
  --     O trigger de proteção é BEFORE UPDATE e devolveria os
  --     valores antigos, então desliga-se a sessão para este
  --     update — é o único ponto que legitimamente escreve aqui.
  set local session_replication_role = replica;

  update auth.users
  set email = 'visitante@cooltrack.demo',
      encrypted_password = extensions.crypt(
        'visitante-cooltrack-2026', extensions.gen_salt('bf')
      )
  where id = v_id;

  update public.perfis
  set nome = 'Visitante (demo)',
      role = 'admin',
      senha_trocada_em = now(),
      email = 'visitante@cooltrack.demo'
  where id = v_id;

  set local session_replication_role = origin;

  -- 3d) Re-semeia. Datas relativas a current_date, então o
  --     dashboard nunca "envelhece": sempre há atrasado, a vencer
  --     e em dia. Mesmo conteúdo de seed_demo.sql.
  insert into public.setores (nome, intervalo_dias) values
    ('CME', 15), ('CTI Neonatal', 15), ('Centro Cirúrgico', 30),
    ('CTI Adulto', 30), ('Radiologia', 30), ('Pronto Socorro', 30),
    ('Hemodinâmica', 30), ('Farmácia', 30)
  on conflict (nome) do nothing;

  insert into public.equipamentos
    (nome, tipo, marca, modelo, patrimonio, andar, sala, status,
     setor_id, intervalo_anual, carga_btu, area_m2, data_instalacao)
  select v.nome, v.tipo, v.marca, v.modelo, v.pat, v.andar, v.sala, v.status,
         s.id, 365, v.btu, v.m2, current_date - v.inst
  from (values
    ('Self CME - Sala de Lavagem','ar_condicionado','Trane','SXR-300','SEED-0001','Térreo','Lav-01','ativo','CME',300000,90,400),
    ('Câmara CME - Esterilização','camara_fria','Elgin','FRC-60','SEED-0002','Térreo','Est-02','ativo','CME',60000,20,400),
    ('Self CTI Neonatal','ar_condicionado','Carrier','40XB-180','SEED-0003','2º','Neo-01','ativo','CTI Neonatal',180000,60,400),
    ('Climatizador CTI Neonatal','climatizador','Munters','MX-90','SEED-0004','2º','Neo-02','ativo','CTI Neonatal',90000,40,200),
    ('Self Sala Cirúrgica 1','ar_condicionado','Trane','SXR-300','SEED-0005','3º','SC-01','ativo','Centro Cirúrgico',300000,120,400),
    ('Self Sala Cirúrgica 2','ar_condicionado','Trane','SXR-300','SEED-0006','3º','SC-02','ativo','Centro Cirúrgico',300000,120,400),
    ('Self Recuperação Pós-Anestésica','ar_condicionado','Carrier','40XB-150','SEED-0007','3º','RPA-01','ativo','Centro Cirúrgico',150000,70,400),
    ('Self CTI Adulto - Geral','ar_condicionado','Hitachi','RPI-240','SEED-0008','4º','CTI-G','ativo','CTI Adulto',240000,100,400),
    ('Self CTI Adulto - Leitos 1-10','ar_condicionado','Hitachi','RPI-240','SEED-0009','4º','CTI-L','manutencao','CTI Adulto',240000,100,400),
    ('Self Tomografia','ar_condicionado','Carrier','40XB-120','SEED-0010','1º','Tomo-01','ativo','Radiologia',120000,50,400),
    ('Self Ressonância Magnética','ar_condicionado','Trane','SXR-180','SEED-0011','1º','RM-01','ativo','Radiologia',180000,80,400),
    ('Self Pronto Socorro - Geral','ar_condicionado','Hitachi','RPI-240','SEED-0012','Térreo','PS-G','ativo','Pronto Socorro',240000,110,400),
    ('Geladeira Medicações PS','geladeira','Indrel','RVV-16','SEED-0013','Térreo','PS-Med','ativo','Pronto Socorro',16000,5,400),
    ('Self Hemodinâmica','ar_condicionado','Carrier','40XB-150','SEED-0014','1º','Hemo-01','ativo','Hemodinâmica',150000,70,400),
    ('Câmara Fria Farmácia','camara_fria','Elgin','FRC-60','SEED-0015','Térreo','Farm-CF','ativo','Farmácia',60000,25,100),
    ('Freezer Imunobiológicos','freezer','Indrel','RVV-18','SEED-0016','Térreo','Farm-Imuno','ativo','Farmácia',18000,8,400)
  ) as v(nome,tipo,marca,modelo,pat,andar,sala,status,setor_nome,btu,m2,inst)
  join public.setores s on s.nome = v.setor_nome;

  update public.equipamentos e
  set intervalo_mensal = s.intervalo_dias
  from public.setores s
  where e.setor_id = s.id and e.patrimonio like 'SEED-%';

  insert into public.manutencoes (equipamento_id, tipo, data, descricao, tecnico)
  select e.id, 'preventiva', current_date - v.dias,
         'Higienização mensal preventiva (PMOC)', 'Equipe PMOC'
  from (values
    ('SEED-0001', 40), ('SEED-0002', 12), ('SEED-0003', 11), ('SEED-0005', 45),
    ('SEED-0006', 10), ('SEED-0007', 27), ('SEED-0008', 20), ('SEED-0009', 60),
    ('SEED-0010', 25), ('SEED-0011', 5),  ('SEED-0012', 50), ('SEED-0013', 14),
    ('SEED-0014', 28), ('SEED-0016', 18)
  ) as v(pat, dias)
  join public.equipamentos e on e.patrimonio = v.pat;

  insert into public.manutencoes (equipamento_id, tipo, data, descricao, tecnico)
  select e.id, 'preventiva', current_date - v.dias,
         'Higienização mensal preventiva (PMOC)', 'Equipe PMOC'
  from (values
    ('SEED-0005', 78), ('SEED-0008', 52), ('SEED-0009', 95), ('SEED-0012', 85)
  ) as v(pat, dias)
  join public.equipamentos e on e.patrimonio = v.pat;

  -- Uma corretiva recente: NÃO zera o relógio do PMOC (só preventiva
  -- conta na conformidade) — é o detalhe que a demo prova.
  insert into public.manutencoes (equipamento_id, tipo, data, descricao, tecnico)
  select e.id, 'corretiva', current_date - 3,
         'Troca de capacitor do compressor', 'Equipe PMOC'
  from public.equipamentos e where e.patrimonio = 'SEED-0009';
end;
$$;

-- Ninguém chama pela API — só o cron, que roda como dono da função.
revoke execute on function public.demo_reset() from public, anon, authenticated;

-- ------------------------------------------------------------
-- 4) AGENDAMENTO
-- ------------------------------------------------------------
create extension if not exists pg_cron;

-- 06:00 UTC = 03:00 em Brasília (o Brasil não tem horário de verão).
-- O unschedule antes torna o script re-rodável sem duplicar o job.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'demo-reset-noturno') then
    perform cron.unschedule('demo-reset-noturno');
  end if;
end $$;

select cron.schedule('demo-reset-noturno', '0 6 * * *', 'select public.demo_reset()');

-- 5) Roda uma vez agora: deixa o ambiente limpo e prova a função.
select public.demo_reset();
