# Decisão 0003 — Pendências conhecidas (pós-review do projeto)

**Data:** 2026-05-30
**Status:** Registrado (itens adiados, com motivo)

Levantadas no review do projeto inteiro (4 revisores). São **conhecidas e
intencionais** — adiadas para fases próprias, não esquecidas.

## 1. Segurança sem autenticação (fase de Auth)

Todas as tabelas e o bucket de Storage têm RLS **público** ao papel `anon`
(`using(true)`, grant a anon). Qualquer um com a chave publishable (que vai no
bundle do frontend) pode ler, gravar e **apagar** todo o inventário e o
histórico, e subir/apagar arquivos.

**Mitigação até o Auth entrar:** usar **apenas dados sintéticos/demo** — nada
de número de série/patrimônio reais, nomes de técnicos, setores/salas reais,
nem fotos de áreas clínicas. Quando entrar o Supabase Auth: políticas RLS por
usuário autenticado e **bucket privado** com URLs assinadas.

## 2. Escala: agregações no cliente (fase de escala)

`buscarTodasManutencoes` e `buscarEquipamentos` fazem `select('*')` sem
paginação. O dashboard carrega tudo em memória, e o Supabase corta em ~1000
linhas por padrão — acima disso as contagens ficam **erradas**, não só lentas.

Para o demo (dados pequenos) está ok. Correção futura: **agregação no SQL**
(views/RPC para contagens, última-por-equipamento, atrasadas) e paginação da
lista de equipamentos.

## 3. Robustez do banco (hardening, opcional)

- Sem limite de tamanho nos campos `text` (com escrita aberta, é vetor de
  abuso).
- Sem CHECK de ordem de datas (ex.: `proxima_manutencao >= data`,
  `data_garantia >= data_instalacao`).
- Sem coluna/trigger `updated_at` para auditoria das edições.

## 4. Acessibilidade (Fase 6 — polimento)

- Região de vídeo do leitor de QR sem texto de status para leitor de tela.
- Confirmação de exclusão depende só de cor (vermelho) — falta ícone/aria.

## 5. IA Anthropic (Fase 5b — futuro)

A camada estatística (5a) está pronta. A análise via Anthropic API fica para
quando houver mais dados reais (Edge Function com a chave server-side, modelo
barato tipo Haiku).
