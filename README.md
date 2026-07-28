# ❄️ CoolTrack — Gestão de Manutenção Hospitalar (CMMS)

Sistema de gestão de ativos de climatização e refrigeração para ambiente hospitalar, com foco em **provar conformidade do PMOC** (Plano de Manutenção, Operação e Controle — Lei 13.589/2018).

Criado por um técnico de refrigeração que mantém 80+ equipamentos críticos em um hospital de grande porte — a partir dos problemas reais da própria rotina, não de uma ideia de aplicativo.

## 🔍 Teste agora, sem criar conta

**[cooltrack-gestaohospitalar.pages.dev](https://cooltrack-gestaohospitalar.pages.dev)** → botão **"Explorar como visitante"**

O modo visitante entra num ambiente de demonstração completo com dados fictícios: dashboard de conformidade com equipamentos atrasados e críticos, fluxo de aprovação pendente, ronda técnica e relatório PMOC. Pode mexer em tudo — criar equipamento, registrar manutenção, aprovar serviço. O ambiente é um projeto Supabase separado do banco real e **se restaura sozinho toda noite** (03:00, horário de Brasília) via `pg_cron`.

## O problema

Num hospital, climatização não é conforto: CME, CTI e Centro Cirúrgico têm exigências de temperatura e umidade com peso de auditoria. Na prática, o controle da manutenção vive em papel, planilha e WhatsApp — histórico se perde, preventiva atrasa sem ninguém ver, e juntar a papelada do PMOC para a auditoria vira um mutirão.

## O que o sistema faz

- **Inventário por setor hospitalar** (CME, CTI, Centro Cirúrgico, Farmácia…), com ficha completa, foto e QR code por equipamento — escaneou, abriu a ficha.
- **Dashboard de conformidade PMOC**: % de equipamentos em dia, atrasados com criticidade, "vence em breve" — a resposta da auditoria em uma tela.
- **Registro de manutenções** (preventiva, corretiva, preditiva) com fotos antes/depois e checklist de execução por tipo de equipamento.
- **Fluxo de aprovação**: serviço registrado pelo técnico só conta para a conformidade depois que um admin aprova, assinando com a própria senha. Registro aprovado vira **indelével** (nem admin apaga).
- **Ronda técnica mensal** com checklist por setor.
- **Relatório PMOC** pronto para impressão em PDF.
- **Papéis de acesso** (admin / técnico) com poderes distintos, impostos no banco.

## Arquitetura

| Camada           | Escolha                                                 | Por quê                                                                            |
| ---------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Frontend         | React 19 + Vite + Tailwind CSS 4                        | SPA leve, usável com uma mão no corredor do hospital                               |
| Roteamento/dados | TanStack Router + TanStack Query                        | Cache e invalidação declarativas; a UI reage ao banco                              |
| Backend          | Supabase (Postgres + Auth + Storage)                    | Postgres gerenciado com **Row Level Security como única parede de segurança real** |
| Migrações        | SQL versionado em `supabase/migrations/` (31 migrações) | Cada mudança de schema documentada com o porquê, aplicável em ordem                |
| Testes           | Vitest (regras de negócio puras)                        | O que decide conformidade é função pura e testada                                  |
| CI/CD            | Husky + lint + Cloudflare Pages                         | Qualidade no commit; deploy automático                                             |

### Segurança: o modelo mental

O frontend roda na máquina do usuário — é **não confiável por definição**. Esconder botão é UX, não segurança. A única parede real é o **RLS no Postgres**:

- Grants **por coluna** (um técnico não lê email/role dos outros perfis).
- Escrita de aprovação restrita a admin **no banco**, com `WITH CHECK` impedindo assinar como outra pessoa.
- Manutenção aprovada é indelével por política (nem admin apaga — trilha de auditoria).
- Troca de senha obrigatória no primeiro acesso; assinatura de aprovação exige a senha própria.
- As migrações em `supabase/migrations/` contam essa evolução, decisão por decisão.

### Modo visitante: como funciona

O botão "Explorar como visitante" chaveia o cliente Supabase para um **projeto demo isolado** (outra URL, outras chaves, outro banco) e autentica com uma conta pública de demonstração. Um banner fixo deixa claro que tudo ali é fictício. `pg_cron` roda um reset noturno que zera as tabelas, re-semeia os dados calibrados (datas relativas ao dia atual, então o dashboard nunca "envelhece") e restaura a senha da conta visitante. O banco real do hospital fica em outro projeto, inacessível a partir do ambiente demo.

## Rodando localmente

```bash
git clone https://github.com/Willianlsz1/CoolTrack_GestaoHospitalar.git
cd CoolTrack_GestaoHospitalar
npm install
npm run dev
```

Para apontar para um Supabase próprio, crie `.env.local` com:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

e aplique as migrações de `supabase/migrations/` em ordem (SQL Editor do Supabase). O seed de demonstração está em `supabase/seed_demo.sql`.

Scripts: `npm run dev` · `npm run test:run` · `npm run lint` · `npm run build`

## Autor

**Willian Lopes da Rocha** — Mecânico de Refrigeração II em hospital de grande porte, cursando Técnico em Automação Industrial (SENAI). Construí este sistema para resolver o meu próprio problema de campo; ele roda validado na minha rotina real de trabalho.

- LinkedIn: [linkedin.com/in/willianlopeshvac](https://www.linkedin.com/in/willianlopeshvac)
- Também: [AquaSense](https://github.com/Willianlsz1/aquasense) — monitoramento IoT de piezômetros de barragens (TCC SENAI / desafio SAGA Samarco)

Feedback técnico é bem-vindo: abra uma issue.
