// Funções puras de agregação do dashboard. Recebem os dados já buscados
// (equipamentos e manutenções) e devolvem os números/listas dos widgets.
// Datas são comparadas como texto 'YYYY-MM-DD' (ordenável sem fuso).
import { hojeLocal, diasEntre } from '../../core/data'

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

// Percentual formatado em pt-BR (vírgula decimal, 1 casa).
export function percentual(parte, total) {
  if (!total) return '0%'
  return `${((parte / total) * 100).toFixed(1).replace('.', ',')}%`
}

// Atrasados COM dias de atraso, mais atrasado primeiro.
// TODO: refinar. Hoje = (proxima_manutencao da última manutenção) vs hoje.
// Não cobre regras mais finas (ex.: intervalo por tipo, feriados).
export function atrasadosComDias(equipamentos, manutencoes) {
  const hoje = hojeLocal()
  const ultima = ultimaPorEquipamento(manutencoes)
  return equipamentos
    .map((eq) => {
      const m = ultima.get(eq.id)
      if (!m?.proxima_manutencao || m.proxima_manutencao >= hoje) return null
      return { eq, dias: diasEntre(m.proxima_manutencao, hoje) }
    })
    .filter(Boolean)
    .sort((a, b) => b.dias - a.dias)
}

// Sem manutenção há +90 dias, COM os dias desde a última manutenção
// (ou, se nunca houve, desde o cadastro). Mais antigo primeiro.
// TODO: a base "desde o cadastro" quando nunca houve manutenção é
// provisória — definir a regra real (ex.: data de instalação).
export function semManutencaoComDias(equipamentos, manutencoes) {
  const hoje = hojeLocal()
  const ultima = ultimaPorEquipamento(manutencoes)
  return equipamentos
    .map((eq) => {
      const m = ultima.get(eq.id)
      const base = m ? m.data : (eq.created_at?.slice(0, 10) ?? hoje)
      const dias = diasEntre(base, hoje)
      return dias > DIAS_SEM_MANUTENCAO ? { eq, dias } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.dias - a.dias)
}

// As N manutenções mais recentes (já ordenadas por data desc).
export function ultimasManutencoes(manutencoes, n = 5) {
  return manutencoes.slice(0, n)
}

// Distribuição por setor ORDENADA (maior primeiro), com os menores
// agrupados em "Outros setores" acima do limite.
export function porSetorOrdenado(equipamentos, limite = 8) {
  const mapa = {}
  for (const eq of equipamentos) {
    const setor = eq.setores?.nome ?? eq.setor ?? 'Sem setor'
    mapa[setor] = (mapa[setor] || 0) + 1
  }

  const ordenado = Object.entries(mapa)
    .map(([setor, count]) => ({ setor, count }))
    .sort((a, b) => b.count - a.count)

  const principais = ordenado.slice(0, limite)
  const outros = ordenado.slice(limite).reduce((s, x) => s + x.count, 0)
  if (outros > 0) {
    principais.push({ setor: 'Outros setores', count: outros, agrupado: true })
  }
  return principais
}
