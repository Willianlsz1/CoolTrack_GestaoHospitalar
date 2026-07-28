-- ============================================================
-- AMBIENTE DEMO (projeto cooltrack-demo) — perfil do visitante
-- e reset noturno automático.
--
-- SÓ RODAR NO PROJETO DEMO. Nunca no banco de produção: a
-- função demo_reset() APAGA TODOS os dados das tabelas.
--
-- O que este script faz:
--   1. Marca o perfil do visitante (nome, admin, senha ok).
--   2. Cria a função demo_reset(): zera tudo e re-semeia com
--      os mesmos dados do seed_demo.sql (datas relativas a
--      current_date, então o dashboard fica sempre "vivo").
--      Também restaura a senha e o perfil do visitante, caso
--      alguém os tenha alterado pelo app.
--   3. Agenda o reset diário às 03:00 (horário de Brasília)
--      via pg_cron.
-- ============================================================

-- 1) Perfil do visitante ------------------------------------
-- admin para a demonstração mostrar o produto INTEIRO
-- (aprovações, relatório, usuários). Os dados são fictícios e
-- o reset noturno desfaz qualquer estrago.
update public.perfis
set nome = 'Visitante (demo)',
    role = 'admin',
    senha_trocada_em = now()
where email = 'visitante@cooltrack.demo';

-- 2) Função de reset ----------------------------------------
create or replace function public.demo_reset()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Zera tudo (ordem respeita as FKs).
  -- Nota: fotos subidas por visitantes NÃO são apagadas aqui — o Supabase
  -- bloqueia delete direto em storage.objects via SQL (só pela Storage API).
  -- Ficam como objetos órfãos no bucket demo, sem efeito no app.
  delete from public.manutencoes;
  delete from public.equipamentos;
  delete from public.setores;

  -- Restaura o visitante: senha pública padrão e perfil, caso
  -- alguém tenha mudado pelo app (o app permite trocar senha e
  -- nome do próprio usuário).
  update auth.users
  set encrypted_password = extensions.crypt('visitante-cooltrack-2026', extensions.gen_salt('bf'))
  where email = 'visitante@cooltrack.demo';

  update public.perfis
  set nome = 'Visitante (demo)', role = 'admin', senha_trocada_em = now()
  where email = 'visitante@cooltrack.demo';

  -- ---- SEED (mesmo conteúdo do seed_demo.sql) ----
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

  insert into public.manutencoes (equipamento_id, tipo, data, descricao, tecnico)
  select e.id, 'corretiva', current_date - 3,
         'Troca de capacitor do compressor', 'Equipe PMOC'
  from public.equipamentos e where e.patrimonio = 'SEED-0009';
end;
$$;

-- Ninguém chama a função pela API — só o cron (roda como dono).
revoke execute on function public.demo_reset() from anon, authenticated, public;

-- 3) Agendamento diário -------------------------------------
create extension if not exists pg_cron;

-- 06:00 UTC = 03:00 em Brasília. unschedule antes torna o
-- script re-rodável sem duplicar o job.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'demo-reset-noturno') then
    perform cron.unschedule('demo-reset-noturno');
  end if;
end $$;

select cron.schedule('demo-reset-noturno', '0 6 * * *', 'select public.demo_reset()');

-- 4) Roda o reset uma vez AGORA (deixa o ambiente pronto e
--    prova que a função funciona).
select public.demo_reset();
