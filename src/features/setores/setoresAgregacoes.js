// Funções puras de agregação dos setores. Recebem os dados já buscados
// (equipamentos e manutenções) e devolvem o resumo operacional por setor.
import { hojeLocal } from '../../core/data'
import {
  classificarChecklistMensal,
  ultimaPreventivaPorEquipamento,
} from '../../core/dominio'

// Resumo "zerado" — setor sem nenhum equipamento.
export function resumoVazio() {
  return { total: 0, atrasados: 0, aVencer: 0, emDia: 0, semCadencia: 0 }
}

// Resumo por setor: conta os equipamentos e classifica a situação de cada
// um (mesma regra da Ronda/ficha), agrupando nos baldes do "termômetro".
//
// Baldes:
//   atrasados   = 'atrasado' (passou do intervalo) + 'nunca' (sem preventiva)
//   aVencer     = 'vence' (faltam <= 7 dias)
//   emDia       = 'emdia'
//   semCadencia = 'sem_cadencia' (sem intervalo mensal definido)
//
// Retorna um Map: setor_id -> { total, atrasados, aVencer, emDia, semCadencia }.
export function resumoPorSetor(equipamentos, manutencoes) {
  const ultimaPrev = ultimaPreventivaPorEquipamento(manutencoes)
  const hoje = hojeLocal()
  const mapa = new Map()

  for (const eq of equipamentos) {
    if (!eq.setor_id) continue
    const r = mapa.get(eq.setor_id) ?? resumoVazio()
    r.total += 1

    const { chave } = classificarChecklistMensal(
      eq,
      ultimaPrev.get(eq.id)?.data ?? null,
      hoje,
    )
    if (chave === 'atrasado' || chave === 'nunca') r.atrasados += 1
    else if (chave === 'vence') r.aVencer += 1
    else if (chave === 'emdia') r.emDia += 1
    else r.semCadencia += 1

    mapa.set(eq.setor_id, r)
  }

  return mapa
}
