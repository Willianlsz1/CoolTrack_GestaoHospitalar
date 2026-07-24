-- ============================================================
-- Migration 0031 — Assinar exige senha própria (fecha o portão no banco)
-- Projeto: CoolTrack — hardening pré-piloto
-- ------------------------------------------------------------
-- PROBLEMA (achado do code review): a 0029 barra a senha temporária na TELA
-- (AppLayout), e tela é UX, não parede. A sessão de quem ainda está com a
-- senha que o admin digitou continua registrando manutenção direto pela API
-- — e registrar manutenção É assinar, no modelo do CONTEXT.md. Ou seja: a
-- 0029 sozinha não sustenta o "controle exclusivo" que ela alegava.
--
-- CORREÇÃO: a regra passa a viver onde a parede é real. O insert de
-- manutenção exige, além de registrado_por = auth.uid() (0015), que o perfil
-- já tenha senha própria.
--
-- POR QUE SÓ manutencoes: assinatura é o registro do serviço. Cadastrar
-- equipamento ou setor não é atestação de nada — barrar tudo seria uma regra
-- maior do que o argumento que a justifica.
--
-- EFEITO ESPERADO NA VIRADA: todo mundo está com senha_trocada_em = null no
-- momento em que a 0029 é aplicada. Portanto, entre aplicar a 0029 e cada
-- pessoa trocar a sua senha, NINGUÉM registra serviço. Isso é o desenho, não
-- um acidente: a primeira coisa que o app exige ao entrar é justamente a
-- troca. Vale avisar a equipe antes de virar a chave.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

-- 1) A PERGUNTA, COMO FUNÇÃO -------------------------------
-- Mesmo molde do is_admin() (0016): security definer porque `perfis` só
-- entrega id e nome ao authenticated (grant por coluna da 0025), e
-- senha_trocada_em não está nessa lista. stable porque não escreve e o valor
-- não muda dentro da mesma consulta. search_path com pg_temp por último
-- (0030) para que uma tabela temporária não mascare public.perfis.
create or replace function public.tem_senha_propria()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and senha_trocada_em is not null
  );
$$;

revoke execute on function public.tem_senha_propria() from public;
grant execute on function public.tem_senha_propria() to authenticated;

-- 2) A POLICY DE INSERT -------------------------------------
-- Recria a política da 0015 somando a nova exigência. Mantém o
-- registrado_por = auth.uid(): as duas condições respondem a perguntas
-- diferentes — "é você mesmo?" e "essa credencial é só sua?".
drop policy if exists "manutencoes insert (autenticado)" on public.manutencoes;
create policy "manutencoes insert (autenticado)"
  on public.manutencoes
  for insert
  to authenticated
  with check (
    registrado_por = auth.uid()
    and public.tem_senha_propria()
  );

-- 3) MATRIZ DO BUCKET, COMPLETA -----------------------------
-- A 0028 decidiu select e delete e deixou o insert como a 0012 tinha
-- deixado: qualquer autenticado, qualquer arquivo, qualquer tamanho — o
-- bucket servia como hospedagem gratuita para quem tivesse um login.
-- Limite por bucket é configuração, não policy: vale para todo upload.
--
-- 10 MB porque foto de celular moderno passa fácil de 5 MB e o app ainda não
-- redimensiona antes de subir; heic/heif porque iPhone fotografa nesse
-- formato por padrão e um accept="image/*" no input não impede o envio.
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'
    ]
where id = 'equipamentos';

-- O UPDATE de arquivo não tem policy nenhuma desde sempre — ninguém
-- sobrescreve um objeto existente. Fica registrado aqui como decisão
-- explícita, e não como esquecimento: a foto é evidência, se precisar mudar
-- sobe outra e a linha aponta para o caminho novo.

-- ============================================================
-- COMO CONFERIR
--
-- 1) Logado com um técnico que AINDA NÃO trocou a senha, no console:
--      await window.supabase.from('manutencoes').insert({ ... }).select()
--    Esperado: erro de RLS (new row violates row-level security policy).
--
-- 2) Troque a senha pelo app e repita: agora deve GRAVAR.
--
-- 3) Upload de arquivo grande/errado (esperado: recusa do Storage):
--      await window.supabase.storage.from('equipamentos')
--        .upload('x.txt', new Blob(['oi'], { type: 'text/plain' }))
-- ============================================================
