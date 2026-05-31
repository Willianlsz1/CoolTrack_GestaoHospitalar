import { hojeLocal, diasEntre } from '../../core/data'
import {
  ultimaPreventivaPorEquipamento,
  nomeSetorDoEquipamento,
} from '../../core/dominio'

const JANELA_VENCE = 7

// Status do checklist MENSAL de um equipamento (mesma regra da cadência).
// ordem = urgência (menor primeiro); pendente = precisa de ação na ronda.
export function statusMensal(eq, ultimaPrev, hoje) {
  if (!eq.intervalo_mensal) {
    return {
      chave: 'sem_cadencia',
      label: 'Sem cadência',
      cor: 'var(--fg-3)',
      ordem: 4,
      pendente: false,
    }
  }
  const m = ultimaPrev.get(eq.id)
  if (!m) {
    return {
      chave: 'nunca',
      label: 'Nunca executado',
      cor: 'var(--warn)',
      ordem: 1,
      pendente: true,
    }
  }
  const restam = eq.intervalo_mensal - diasEntre(m.data, hoje)
  if (restam < 0) {
    const d = -restam
    return {
      chave: 'atrasado',
      label: `Atrasado há ${d} ${d === 1 ? 'dia' : 'dias'}`,
      cor: 'var(--danger)',
      ordem: 0,
      pendente: true,
    }
  }
  if (restam <= JANELA_VENCE) {
    return {
      chave: 'vence',
      label: `Vence em ${restam} ${restam === 1 ? 'dia' : 'dias'}`,
      cor: 'var(--warn)',
      ordem: 2,
      pendente: true,
    }
  }
  return {
    chave: 'emdia',
    label: 'Em dia',
    cor: 'var(--ok)',
    ordem: 3,
    pendente: false,
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
    const status = statusMensal(eq, ultimaPrev, hoje)
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
