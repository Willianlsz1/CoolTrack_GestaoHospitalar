-- ============================================================
-- Migration 0028 — Fotos privadas (LGPD)
-- Projeto: CoolTrack — hardening pré-piloto
-- ------------------------------------------------------------
-- PROBLEMA: o bucket nasceu público na 0003 ("as fotos são servidas por URL
-- direta") e a 0012 confirmou a decisão ao trancar só a ESCRITA — a leitura
-- seguiu aberta. Resultado: toda foto do sistema era um endereço na internet
-- que dispensa login. Trancamos as tabelas e esquecemos o armário de fotos.
--
-- Por que isso pesa mais num hospital: a foto do "antes/depois" de uma
-- evaporadora pega leito, paciente, crachá, prontuário na parede, planta do
-- setor. Isso é dado pessoal — possivelmente SENSÍVEL (saúde) sob a LGPD —
-- hospedado numa URL pública. E a URL do projeto Supabase vai no bundle do
-- frontend por design; só falta o nome do arquivo.
--
-- CORREÇÃO: bucket privado. A leitura passa a exigir sessão, e o app gera
-- URLs ASSINADAS de validade curta na hora de exibir (src/core/storage.js +
-- src/components/Foto.jsx). Nada de URL eterna.
--
-- Segundo problema, mesma migração: a política de delete da 0012 liberava
-- apagar QUALQUER arquivo do bucket a QUALQUER autenticado, sem checar dono.
-- A foto é evidência de execução do PMOC — passa a ser admin-only, na mesma
-- linha da 0027 (evidência não se apaga).
--
-- Efeito colateral aceito: quando o técnico troca a foto de um equipamento,
-- o arquivo antigo fica órfão no bucket (o app tenta apagar e falha em
-- silêncio — é best-effort). Órfão custa centavos; evidência apagável custa
-- a auditoria. Se o lixo incomodar, a faxina é uma rotina server-side, não
-- um grant a mais para o técnico.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ATENÇÃO: aplique junto com o deploy do app. Bucket privado + app antigo =
-- fotos quebradas (o app antigo monta URL pública).
-- ============================================================

-- 1) BUCKET PRIVADO ------------------------------------------
update storage.buckets set public = false where id = 'equipamentos';

-- 2) LEITURA SÓ AUTENTICADA ----------------------------------
-- Com o bucket público, a leitura era automática e não havia política de
-- select. Agora precisa existir uma — senão nem quem está logado enxerga
-- (e as URLs assinadas param de ser emitidas).
drop policy if exists "leitura de fotos (autenticado)" on storage.objects;
create policy "leitura de fotos (autenticado)"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'equipamentos');

-- 3) EXCLUSÃO SÓ ADMIN ---------------------------------------
drop policy if exists "exclusao de fotos (autenticado)" on storage.objects;
create policy "exclusao de fotos (admin)"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'equipamentos' and public.is_admin());

-- ============================================================
-- COMO CONFERIR
--
-- 1) DESLOGADO, cole no navegador a URL pública de uma foto que funcionava:
--    https://<projeto>.supabase.co/storage/v1/object/public/equipamentos/<arquivo>
--    Esperado: erro (Bucket not found / Object not found). Antes, abria.
--
-- 2) LOGADO no app: as fotos continuam aparecendo (URL assinada).
--
-- 3) Logado como TÉCNICO, no console:
--    await window.supabase.storage.from('equipamentos').remove(['<arquivo>'])
--    Esperado: não apaga (a foto continua abrindo no app).
-- ============================================================
