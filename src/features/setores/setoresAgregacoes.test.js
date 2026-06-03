import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resumoPorSetor, resumoVazio } from './setoresAgregacoes'

// Fixa "hoje" = 31/05/2026 para os cálculos que dependem da data atual.
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-31T12:00:00'))
})
afterEach(() => vi.useRealTimers())

// Equipamentos do setor S1 cobrindo todos os baldes + um sem cadência.
const S1 = 'setor-1'
const S2 = 'setor-2'

const equipamentos = [
  { id: 'a1', setor_id: S1, intervalo_mensal: 30 }, // atrasado (last 01/04)
  { id: 'a2', setor_id: S1, intervalo_mensal: 30 }, // nunca -> atrasados
  { id: 'a3', setor_id: S1, intervalo_mensal: 30 }, // a vencer (last 05/05)
  { id: 'a4', setor_id: S1, intervalo_mensal: 30 }, // em dia (last 25/05)
  { id: 'a5', setor_id: S1, intervalo_mensal: null }, // sem cadência
  { id: 'b1', setor_id: S2, intervalo_mensal: 30 }, // em dia (last 25/05)
  { id: 'x1', setor_id: null, intervalo_mensal: 30 }, // sem setor -> ignorado
]

// Ordenadas por data desc (como o app entrega). Só preventivas contam.
const manutencoes = [
  { equipamento_id: 'a4', tipo: 'preventiva', data: '2026-05-25' },
  { equipamento_id: 'b1', tipo: 'preventiva', data: '2026-05-25' },
  { equipamento_id: 'a3', tipo: 'preventiva', data: '2026-05-05' },
  { equipamento_id: 'a1', tipo: 'preventiva', data: '2026-04-01' },
  { equipamento_id: 'a2', tipo: 'corretiva', data: '2026-05-20' }, // não zera
]

describe('resumoVazio', () => {
  it('começa tudo em zero', () => {
    expect(resumoVazio()).toEqual({
      total: 0,
      atrasados: 0,
      nunca: 0,
      aVencer: 0,
      emDia: 0,
      semCadencia: 0,
    })
  })
})

describe('resumoPorSetor', () => {
  it('classifica cada equipamento no balde certo, por setor', () => {
    const mapa = resumoPorSetor(equipamentos, manutencoes)
    expect(mapa.get(S1)).toEqual({
      total: 5,
      atrasados: 1, // a1 (atrasado pela preventiva antiga)
      nunca: 1, // a2 (só corretiva, sem instalação → nunca)
      aVencer: 1, // a3
      emDia: 1, // a4
      semCadencia: 1, // a5
    })
    expect(mapa.get(S2)).toEqual({
      total: 1,
      atrasados: 0,
      nunca: 0,
      aVencer: 0,
      emDia: 1,
      semCadencia: 0,
    })
  })

  it('ignora equipamentos sem setor', () => {
    const mapa = resumoPorSetor(equipamentos, manutencoes)
    expect(mapa.has(null)).toBe(false)
    // x1 não entra em nenhum setor.
    const totalContado = [...mapa.values()].reduce((s, r) => s + r.total, 0)
    expect(totalContado).toBe(6)
  })

  it('setor sem equipamentos não aparece no mapa', () => {
    const mapa = resumoPorSetor([], [])
    expect(mapa.size).toBe(0)
  })
})
