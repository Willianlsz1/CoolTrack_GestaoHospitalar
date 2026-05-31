// Funções puras de agregação do dashboard. Recebem os dados já buscados
// (equipamentos e manutenções) e devolvem os números/listas dos widgets.
// Datas são comparadas como texto 'YYYY-MM-DD' (ordenável sem fuso).
import { hojeLocal, diasEntre } from '../../core/data'
import { nomeSetorDoEquipamento } from '../../core/dominio'

const JANELA_VENCE_EM_BREVE = 7

// Data-base da cadência: última preventiva ou, na falta, a instalação
// (ou o cadastro). Retorna 'YYYY-MM-DD' ou null.
function baseCadencia(eq, ultimaPrev) {
  const m = ultimaPrev.get(eq.id)
  if (m) return m.data
  return eq.data_instalacao ?? eq.created_at?.slice(0, 10) ?? null
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

// Atrasados: passou do `intervalo_mensal` desde a última preventiva (ou,
// se nunca houve, desde a instalação). Mostra os DIAS DE ATRASO. Equipamento
// sem intervalo (sem setor/cadência) fica fora. Mais atrasado primeiro.
export function atrasadosComDias(equipamentos, ultimaPrev) {
  const hoje = hojeLocal()
  return equipamentos
    .map((eq) => {
      const intervalo = eq.intervalo_mensal
      if (!intervalo) return null
      const base = baseCadencia(eq, ultimaPrev)
      if (!base) return null
      const atraso = diasEntre(base, hoje) - intervalo
      return atraso > 0
        ? { eq, dias: atraso, nuncaPreventiva: !ultimaPrev.has(eq.id) }
        : null
    })
    .filter(Boolean)
    .sort((a, b) => b.dias - a.dias)
}

// Vence em breve: higienização a vencer dentro da janela (0..N dias), ainda
// não vencida. Só conta quem já teve preventiva (quem nunca teve cai em
// atrasados). Mais perto de vencer primeiro.
export function venceEmBreve(
  equipamentos,
  ultimaPrev,
  janela = JANELA_VENCE_EM_BREVE,
) {
  const hoje = hojeLocal()
  return equipamentos
    .map((eq) => {
      const intervalo = eq.intervalo_mensal
      if (!intervalo) return null
      const m = ultimaPrev.get(eq.id)
      if (!m) return null
      const faltam = intervalo - diasEntre(m.data, hoje)
      return faltam >= 0 && faltam <= janela ? { eq, dias: faltam } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.dias - b.dias)
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
    const setor = nomeSetorDoEquipamento(eq) ?? 'Sem setor'
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
