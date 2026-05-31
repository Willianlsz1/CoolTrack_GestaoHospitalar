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

**Relatório analítico (PMOC)**:
O **inventário-mestre**: lista dos equipamentos por categoria, com periodicidade
(30/365), última/próxima manutenção, localização, carga e área, mais totais.
Atualizado quando entra/sai equipamento. É o que o CoolTrack já gera (exportável).
Distinto do _Checklist de manutenção_.

**Checklist de manutenção**:
A lista de **procedimentos** que o técnico cumpre por equipamento a cada visita.
O **modelo** é definido por **tipo de equipamento × frequência** (mensal/anual)
e o tamanho varia por tipo (ex.: câmara frigorífica ~3 itens; ar central 9
mensal / 28 anual). O admin/RT cadastra o modelo uma vez por tipo e todos os
equipamentos daquele tipo herdam. No CoolTrack é **digital**: o técnico marca os
itens e **assina no app** (substitui o papel — o diferencial, pois assinar
centenas de folhas à mão é inviável). Gera a evidência de execução.

**Assinatura eletrônica**:
A "assinatura" do checklist NÃO é um rabisco desenhado: é a **atestação pela
identidade autenticada** (quem está logado) + carimbo de tempo + registro dos
itens cumpridos. Um toque de "confirmar" por equipamento. Vale para todos os
checklists do técnico.

**Responsável Técnico (RT)**:
Profissional legalmente habilitado que assina e responde pelo PMOC — engenheiro
(via CONFEA/CREA) ou técnico em refrigeração (via CFT/CRT, Resolução CFT
068/2019, sem limite de BTU). No hospital atual é um **técnico externo
contratado**. Seus dados (nome, conselho, registro, nº da ART/TRT) são
configuráveis e entram no cabeçalho e na assinatura do documento.

**ART / TRT**:
O instrumento que vincula juridicamente o RT ao serviço: **ART** (Anotação de
Responsabilidade Técnica) para a via CREA; **TRT** (Termo de Responsabilidade
Técnica) para a via CFT. A fiscalização cruza a ART/TRT com quem assina os
relatórios do PMOC.

**Redundância**:
Equipamentos robustos operam em par **ativo + backup**. Para o controle, **não
são modelados como par**: cada unidade é tratada como equipamento independente,
com o intervalo do seu setor — a responsabilidade de revezar fica com o técnico.
