# AGENTS.md — CoolTrack_GestaoHospitalar

Regras operacionais para qualquer agente trabalhando neste repositório.
Para o _que é_ o projeto (propósito, roadmap, schema), veja os links no fim.

## Como rodar

- `npm run dev` — sobe o servidor de desenvolvimento (Vite)
- `npm run build` — gera o build de produção
- `npm run lint` — roda o ESLint
- `npm run test` — testes (Vitest, watch); `npm run test:run` roda uma vez
- `npm run format` — Prettier (formatação)

Os testes são **unit das funções puras** (regra de negócio: cadência PMOC,
datas, relatório, ronda). Componentes/e2e ficam para fases futuras, se preciso.

## Como o Willian trabalha

- **Entendimento antes de código.** Nenhuma linha é escrita sem que o Willian
  entenda por que ela existe. Explique cada decisão e os trade-offs.
- Ele é técnico de refrigeração aprendendo desenvolvimento — trate como
  contexto de ensino, não despeje código pronto sem o porquê.
- Decisões de produto são dele. Apresente opções, recomende, deixe ele decidir.

## Método de trabalho

- **Planeje primeiro.** Antes de criar/editar código, apresente o plano e
  **espere aprovação explícita** ("portão duro"). Vale para criar/editar
  arquivos de código e mexer no banco.
  - Exceção (sem portão): ler/explorar código, rodar `lint`, responder perguntas.
- **Na dúvida, pare.** Não chute. Pesquise (código, Documento Fundacional,
  docs oficiais), revise, e só então aplique.
- **Não complique à toa.** A solução mais simples que resolve, vence.
- **Simplifique quando houver oportunidade.** Se ao mexer num código dá pra
  deixá-lo mais simples, aponte e proponha.

## Convenções inegociáveis

- **Nenhum arquivo passa de 300 linhas.** Se passar, divida.
- **Estrutura feature-sliced:** cada módulo em `src/features/<modulo>/` com seu
  componente, queries e tipos. Nada de arquivo gigante misturando tudo.
- **Segurança desde o início:** RLS ligado em toda tabela; validação e auth não
  são "fase depois".
- **Nomes de domínio em português** (ex.: `buscarEquipamentos`, `equipamentos`).
- **Tailwind** para estilo, direto no JSX. Sem CSS global monolito.

## O que NÃO fazer (lições do CoolTrack antigo)

- ✗ CSS monolito global — cada componente tem seu estilo (Tailwind).
- ✗ God objects — arquivos de 2.000+ linhas misturando lógica, UI e dados.
- ✗ Misturar tecnologias sem regra clara.
- ✗ Telas sem design prévio.
- ✗ Tratar segurança como fase separada.
- ✗ Avançar sem entender — se uma linha não está clara, pare e entenda antes.

## Git

- O agente **prepara** o commit (mensagem em português, descrevendo _o quê_ e
  _por quê_ — nunca só "fix") mas **só executa quando o Willian mandar**.
- **Nunca commitar direto na `main`.** Sempre branch por fase + Pull Request.
- **Nunca dar push sem o Willian pedir.**

## Onde está o resto

- **Documento Fundacional** (fonte canônica, mantido fora do repo pelo Willian):
  `HospTrack_Documento_Fundacional_v1.docx`
- **Decisões técnicas:** `docs/decisoes/`
- **Fase atual:** Fase 1 — Inventário de Equipamentos
