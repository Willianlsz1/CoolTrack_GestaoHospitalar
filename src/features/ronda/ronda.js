import { hojeLocal } from '../../core/data'
import {
  ultimaPreventivaPorEquipamento,
  nomeSetorDoEquipamento,
  classificarChecklistMensal,
} from '../../core/dominio'

// Rótulo do status do checklist mensal para a lista da ronda.
function rotulo(c) {
  const plural = (n) => `${n} ${n === 1 ? 'dia' : 'dias'}`
  switch (c.chave) {
    case 'atrasado':
      return `Atrasado há ${plural(c.dias)}`
    case 'vence':
      return `Vence em ${plural(c.dias)}`
    case 'nunca':
      return 'Nunca executado'
    case 'sem_cadencia':
      return 'Sem cadência'
    default:
      return 'Em dia'
  }
}

// Monta a ronda: equipamentos agrupados por setor, com seu status, ordenados
// por urgência. soPendentes filtra os que já estão em dia / sem cadência.
export function montarRonda(equipamentos, manutencoes, soPendentes) {
  const hoje = hojeLocal()
  const ultimaPrev = ultimaPreventivaPorEquipamento(manutencoes)

  const grupos = new Map()
  let totalPendentes = 0
  for (const eq of equipamentos) {
    const c = classificarChecklistMensal(
      eq,
      ultimaPrev.get(eq.id)?.data ?? null,
      hoje,
    )
    const status = { ...c, label: rotulo(c) }
    if (status.pendente) totalPendentes += 1
    if (soPendentes && !status.pendente) continue
    const setor = nomeSetorDoEquipamento(eq) ?? 'Sem setor'
    if (!grupos.has(setor)) grupos.set(setor, [])
    grupos.get(setor).push({ eq, status })
  }

  const setores = [...grupos.entries()]
    .map(([setor, itens]) => ({
      setor,
      itens: itens.sort((a, b) => a.status.ordem - b.status.ordem),
    }))
    .sort((a, b) => a.setor.localeCompare(b.setor))

  return { setores, totalPendentes }
}

// Lista ORDENADA (como a ronda) dos equipamentos com checklist pendente.
// Usada na ficha (modo ronda) para apontar o "próximo pendente".
export function pendentesDaRonda(equipamentos, manutencoes) {
  const { setores } = montarRonda(equipamentos, manutencoes, true)
  return setores.flatMap((s) => s.itens.map((it) => it.eq))
}
