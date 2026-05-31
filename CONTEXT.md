# CoolTrack

Sistema de gestão de ativos de refrigeração/climatização hospitalar. Controla
o inventário de equipamentos e o histórico de manutenção, com foco em
**compliance de PMOC** (cadência de manutenção preventiva exigida por norma).

## Language

**PMOC**:
Plano de Manutenção, Operação e Controle — a norma que rege a cadência da
manutenção preventiva. Impõe dois ciclos: **mensal** e **anual**. É o que
torna "manutenção atrasada" uma medida de conformidade, não de preferência.

**Higienização**:
A manutenção preventiva recorrente de limpeza dos equipamentos (em especial as
evaporadoras). É a atividade cuja cadência o PMOC controla. É uma manutenção do
tipo **preventiva** — e é a **única que reinicia o relógio** do intervalo;
corretiva e preditiva não contam para a conformidade.

**Evaporadora**:
Unidade de troca de calor instalada nos ambientes (quartos, ambulatórios,
setores). É o alvo típico da higienização mensal.

**Setor**:
Local físico do hospital onde o equipamento opera (ex.: CME, ambulatório,
quarto). Fornece o **intervalo padrão (default)** de manutenção dos equipamentos
nele (CME → 15 dias; demais → 30 dias). É uma **entidade própria** (tabela
`setores`, com tela de gestão); o equipamento referencia um setor em vez de
digitar texto livre. O setor dá o ponto de partida, mas o valor efetivo do
intervalo vive no equipamento (ver _Intervalo de manutenção_).

**Intervalo de manutenção**:
A cadência (em dias) com que um equipamento deve ser higienizado. Vive **no
equipamento**, como um par **mensal + anual** (ex.: 30 / 365 dias), nascendo do
**default do setor** (CME = 15; demais = 30) mas podendo ser ajustado por
equipamento. Espelha a coluna "Periodicidade (Dias) = 30 / 365" do PMOC real.

**CME**:
Central de Material e Esterilização. O setor mais crítico — único com
intervalo de **15 dias**.

**Manutenção atrasada** (ou _vencida_):
Equipamento que passou do seu intervalo de manutenção (do setor) desde a última
higienização. É a medida de não-conformidade exibida no Dashboard.
_Evite_: "manutenção pendente" (ambíguo).

**Relatório PMOC**:
O entregável que o hospital precisa manter: inventário dos equipamentos por
categoria, com periodicidade (30/365), última/próxima manutenção, localização,
carga e área, mais totais. O CoolTrack gera uma versão dele ("PMOC report lite",
sem os checklists de procedimentos, que entram numa evolução).

**Redundância**:
Equipamentos robustos operam em par **ativo + backup**. Para o controle, **não
são modelados como par**: cada unidade é tratada como equipamento independente,
com o intervalo do seu setor — a responsabilidade de revezar fica com o técnico.
