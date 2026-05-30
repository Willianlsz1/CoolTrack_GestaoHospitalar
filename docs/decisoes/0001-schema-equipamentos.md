# Decisão 0001 — Schema da tabela `equipamentos`

**Data:** 2026-05-30
**Fase:** 1 — Inventário de Equipamentos
**Status:** Aceita

## Contexto

A Fase 1 precisa de uma tabela `equipamentos` no Supabase. O Documento
Fundacional v1.0 define os campos nas seções 3.1 (MVP) e 5.3 (tabelas).

## Decisões

1. **`id` como `uuid`** (não inteiro sequencial). Não vaza a quantidade de
   ativos e evita colisão em cenários de sincronização futura.

2. **`CHECK` em vez de `enum`** para `tipo` e `status`. O `enum` nativo do
   Postgres é trabalhoso de alterar; o `CHECK (... in (...))` valida no banco
   e continua fácil de evoluir.
   - `tipo`: geladeira, freezer, camara_fria, ar_condicionado, climatizador, outro
   - `status`: ativo, manutencao, inativo

3. **`setor`, `andar`, `sala` como texto livre** na Fase 1 — *não* tabela
   `setores` separada ainda. Mantém a Fase 1 focada só em equipamentos
   (princípio "uma coisa por vez"). A tabela `setores` (item 06 dos Próximos
   Passos) entra numa fase futura, quando houver necessidade de gerenciá-los.

4. **`qr_code` incluído como `nullable` agora**, mesmo sendo usado só na
   Fase 2. Está no schema oficial (5.3) e evita uma migração extra depois.

5. **`foto_url` como texto** apontando para o Supabase Storage. O upload de
   foto é objetivo da Fase 1.

6. **RLS ligado desde o início** com políticas públicas explícitas
   (leitura + escrita). Necessário porque o Supabase exige RLS, e sem
   políticas a chave anônima volta vazio sem erro. Alinhado ao princípio
   "Segurança não é fase separada". Será trocado por políticas baseadas em
   usuário autenticado quando entrar o Supabase Auth.

## Addendum — divergência banco × migração (migração 0004)

O banco vivo acabou criado com uma versão antiga do schema (antes do
alinhamento ao Documento Fundacional): tinha `numero_serie` e
`temperatura_alvo` e faltavam `serie`, `patrimonio`, `andar`, `sala`,
`data_garantia`, `foto_url`, `qr_code`. A migração **0004** reconcilia o
banco com este schema canônico via `alter table` (rename + drop + add
column if not exists), sem recriar a tabela e preservando os dados.
É idempotente: num banco novo criado pela 0001, a 0004 vira no-op.

## Descartado nesta fase

- `temperatura_alvo`: não está no Documento Fundacional. Removido para não
  adicionar escopo não previsto.
- Tabela `setores` normalizada: adiada (ver decisão 3).
- Constraint `unique` em `patrimonio`: adiada — alguns equipamentos podem
  ser cadastrados sem patrimônio conhecido no campo.
