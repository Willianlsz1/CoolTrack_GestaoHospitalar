# Decisão 0004 — Gestão de usuários (cadastro fechado + admin cria)

**Data:** 2026-05-31
**Status:** Implementado

## Contexto

O cadastro era **aberto**: qualquer um criava conta (`auth.signUp`) pela tela
de login. Antes de dados reais do hospital, isso precisava virar controlado.

## Decisão

1. **Cadastro público desligado** no Supabase (Authentication → "Allow new
   users to sign up" = off). É o bloqueio real, server-side. A tela de login
   perdeu o "Criar conta" (e `authApi.criarConta` foi removido).
2. **Admin cria usuários in-app** (rota `/usuarios`, só admin). Novos usuários
   nascem como **técnico**; promover a admin é manual e deliberado:
   `update public.perfis set role='admin' where email='...';`.
3. **Criação via Edge Function** `criar-usuario` (server-side), porque criar
   usuário exige a `service_role`/secret key — a chave que ignora o RLS e que
   **nunca** pode ir ao frontend.

## Segurança em camadas

- **Menu:** item "Usuários" só aparece para admin (UX).
- **Página:** mostra "acesso restrito" a não-admin (defesa).
- **Edge Function:** valida admin **no servidor** via `is_admin()` — a trava
  real. Roda no contexto do chamador (JWT dele) + apikey secret.

## Perrengue: sistema novo de chaves (registro p/ o futuro)

O projeto usa as **chaves novas** do Supabase (`sb_publishable_` /
`sb_secret_`). As legadas `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
foram **rebaixadas** e não funcionam mais como service_role.

Sintoma: consultar tabela com a secret key via PostgREST dava
`permission denied` — porque `sb_secret_` **não é um JWT**, o PostgREST não
o interpreta e rebaixa o pedido para `anon`.

Soluções aplicadas:

- A secret key vem de um **segredo explícito** `CT_SERVICE_ROLE_KEY` (aba
  Secrets da função). Nomes `SUPABASE_*` são reservados, por isso o prefixo
  `CT_`.
- A checagem de admin **não** lê a tabela direto com a secret; usa a RPC
  `is_admin()` (security definer) no contexto do **JWT do chamador** (que é um
  JWT válido). A criação usa a secret na API de admin do GoTrue (que a aceita).

## Pendências relacionadas

- Listar/editar/desativar usuários no painel (hoje só cria).
- Reset de senha pelo próprio usuário.
