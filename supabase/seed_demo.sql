-- ============================================================
-- SEED DE DEMONSTRAÇÃO — CoolTrack (Fase 1, PMOC)
-- ------------------------------------------------------------
-- Popula setores + ~16 equipamentos + manutenções com datas
-- CALIBRADAS (relativas a current_date) para o dashboard mostrar
-- atrasados, "vence em breve" e em dia, e o relatório ficar cheio.
--
-- É RE-RODÁVEL: apaga os dados de seed anteriores (patrimônio
-- 'SEED-%') antes de inserir. NÃO toca nos seus dados reais.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run.
-- Para REMOVER o seed depois: rode só os 2 DELETEs do topo.
-- ============================================================

-- 0) Limpa seed anterior (manutenções antes, por causa da FK).
delete from public.manutencoes
where equipamento_id in (
  select id from public.equipamentos where patrimonio like 'SEED-%'
);
delete from public.equipamentos where patrimonio like 'SEED-%';

-- 1) Setores (não duplica os que você já criou — on conflict do nothing).
insert into public.setores (nome, intervalo_dias) values
  ('CME', 15),
  ('CTI Neonatal', 15),
  ('Centro Cirúrgico', 30),
  ('CTI Adulto', 30),
  ('Radiologia', 30),
  ('Pronto Socorro', 30),
  ('Hemodinâmica', 30),
  ('Farmácia', 30)
on conflict (nome) do nothing;

-- 2) Equipamentos (setor_id resolvido pelo nome do setor).
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

-- 3) intervalo_mensal = intervalo do setor (mantém coerência).
update public.equipamentos e
set intervalo_mensal = s.intervalo_dias
from public.setores s
where e.setor_id = s.id and e.patrimonio like 'SEED-%';

-- 4) Manutenções PREVENTIVAS, datas calibradas (dias atrás de hoje).
--    Calibragem por equipamento (intervalo entre parênteses):
--    ATRASADOS: 0001(15), 0005(30), 0009(30), 0012(30)
--    VENCE EM BREVE: 0002(15), 0003(15), 0007(30), 0010(30), 0014(30)
--    EM DIA: 0006, 0008, 0011, 0013, 0016
--    NUNCA HIGIENIZADO (sem preventiva -> atrasa pela instalação): 0004, 0015
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

-- 5) Uma 2ª preventiva (mais antiga) em alguns, para dar histórico e
--    alimentar a "sugestão estatística" da ficha.
insert into public.manutencoes (equipamento_id, tipo, data, descricao, tecnico)
select e.id, 'preventiva', current_date - v.dias,
       'Higienização mensal preventiva (PMOC)', 'Equipe PMOC'
from (values
  ('SEED-0005', 78), ('SEED-0008', 52), ('SEED-0009', 95), ('SEED-0012', 85)
) as v(pat, dias)
join public.equipamentos e on e.patrimonio = v.pat;

-- 6) Uma corretiva recente (NÃO zera o relógio do PMOC — bom para provar
--    que só preventiva conta na conformidade).
insert into public.manutencoes (equipamento_id, tipo, data, descricao, tecnico)
select e.id, 'corretiva', current_date - 3,
       'Troca de capacitor do compressor', 'Equipe PMOC'
from public.equipamentos e where e.patrimonio = 'SEED-0009';
