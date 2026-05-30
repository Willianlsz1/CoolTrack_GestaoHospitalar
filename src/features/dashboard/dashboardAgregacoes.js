// Funções puras de agregação do dashboard. Recebem os dados já buscados
// (equipamentos e manutenções) e devolvem os números/listas dos widgets.
// Datas são comparadas como texto 'YYYY-MM-DD' (ordenável sem fuso).
import { hojeLocal, diasAtras } from '../../core/data'

const DIAS_SEM_MANUTENCAO = 90

// Mapa equipamento_id -> manutenção mais recente. As manutenções já vêm
// ordenadas por data desc, então a 1ª de cada id é a mais recente.
function ultimaPorEquipamento(manutencoes) {
  const mapa = new Map()
  for (const m of manutencoes) {
    if (!mapa.has(m.equipamento_id)) {
      mapa.set(m.equipamento_id, m)
    }
  }
  return mapa
}

// Conta equipamentos por status (ordem fixa).
export function contarPorStatus(equipamentos) {
  const contagem = { ativo: 0, manutencao: 0, inativo: 0 }
  for (const eq of equipamentos) {
    if (contagem[eq.status] !== undefined) {
      contagem[eq.status] += 1
    }
  }
  return contagem
}

// Manutenção atrasada: a última manutenção tem proxima_manutencao
// agendada e ela já passou (< hoje).
export function equipamentosAtrasados(equipamentos, manutencoes) {
  const hoje = hojeLocal()
  const ultima = ultimaPorEquipamento(manutencoes)
  return equipamentos.filter((eq) => {
    const m = ultima.get(eq.id)
    return m && m.proxima_manutencao && m.proxima_manutencao < hoje
  })
}

// Sem manutenção há mais de 90 dias (ou nunca).
export function equipamentosSemManutencao(equipamentos, manutencoes) {
  const limite = diasAtras(DIAS_SEM_MANUTENCAO)
  const ultima = ultimaPorEquipamento(manutencoes)
  return equipamentos.filter((eq) => {
    const m = ultima.get(eq.id)
    return !m || m.data < limite
  })
}

// As N manutenções mais recentes (já ordenadas por data desc).
export function ultimasManutencoes(manutencoes, n = 5) {
  return manutencoes.slice(0, n)
}

// Distribuição de equipamentos por setor (setor -> total).
export function distribuicaoPorSetor(equipamentos) {
  const mapa = {}
  for (const eq of equipamentos) {
    const setor = eq.setor || 'Sem setor'
    mapa[setor] = (mapa[setor] || 0) + 1
  }
  return mapa
}
