-- ============================================================
-- Migration 0029 — Senha do admin é temporária (assinatura atribuível)
-- Projeto: CoolTrack — hardening pré-piloto
-- ------------------------------------------------------------
-- PROBLEMA: a Edge Function criar-usuario recebe a senha DIGITADA PELO ADMIN
-- e cria a conta com ela. O app não tem troca de senha nem recuperação —
-- authApi.js tinha exatamente duas funções: entrar e sair. Ou seja: a senha
-- do técnico é, para sempre, uma senha que o gestor conhece.
--
-- Por que isso é grave AQUI e não seria num app qualquer: o CoolTrack define
-- assinatura eletrônica como "atestação pela identidade autenticada"
-- (CONTEXT.md). Se o gestor conhece a credencial do técnico, a identidade
-- não é exclusiva dele — e o gestor é justamente quem aprova o serviço que o
-- técnico assinou. O conflito é estrutural: a assinatura deixa de ser
-- atribuível a uma pessoa só.
--
-- É também o degrau que separa a assinatura eletrônica SIMPLES da AVANÇADA
-- na Lei 14.063/2020, que exige "controle exclusivo" do signatário sobre os
-- dados de criação da assinatura.
--
-- CORREÇÃO: a senha definida pelo admin vira TEMPORÁRIA. Esta coluna marca
-- quando o usuário definiu uma senha própria; enquanto for null, o app
-- exige a troca antes de liberar qualquer tela (src/features/auth/
-- TrocaSenhaObrigatoria.jsx).
--
-- Null para todos os usuários JÁ EXISTENTES é o comportamento certo, não um
-- efeito colateral: a senha deles hoje é, de fato, uma senha que o admin
-- definiu. Todo mundo troca no próximo acesso — inclusive o admin.
--
-- Grant por COLUNA, como manda a 0017: `authenticated` só atualiza `nome` e
-- agora `senha_trocada_em`. A policy "perfis update proprio" (0014) já
-- restringe à própria linha.
--
-- Limite conhecido e aceito: nada impede o usuário de marcar a coluna pela
-- API sem trocar a senha de verdade. Só que isso é burla contra si mesmo —
-- ele fica com a senha que o chefe conhece. Fechar isso exigiria mover a
-- troca para uma Edge Function (a Auth API não é acessível do SQL), e o
-- ganho não paga a complexidade.
--
-- Como aplicar: SQL Editor do Supabase > cole > Run (com o app LOGADO).
-- ============================================================

alter table public.perfis
  add column if not exists senha_trocada_em timestamptz;

grant update (senha_trocada_em) on public.perfis to authenticated;

-- meu_perfil() faz `select *`, então a coluna nova já vai junto para o app —
-- não precisa recriar a função.

-- ============================================================
-- COMO CONFERIR
--   1) Entre com um técnico: o app deve exigir a troca antes de tudo.
--   2) Depois de trocar, saia e entre com a NOVA senha — a antiga não
--      funciona mais e a tela de troca não aparece de novo.
--   3) A senha antiga (a que o admin definiu) deve falhar no login.
-- ============================================================
