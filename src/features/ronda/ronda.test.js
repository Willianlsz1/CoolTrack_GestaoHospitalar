import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { montarRonda, pendentesDaRonda } from './ronda'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-31T12:00:00'))
})
afterEach(() => vi.useRealTimers())

const equipamentos = [
  { id: 'e1', intervalo_mensal: 30, setores: { nome: 'CME' } }, // atrasado
  { id: 'e2', intervalo_mensal: 30, setores: { nome: 'Radiologia' } }, // em dia
]
const manutencoes = [
  { equipamento_id: 'e1', tipo: 'preventiva', data: '2026-04-01' },
  { equipamento_id: 'e2', tipo: 'preventiva', data: '2026-05-21' },
]

describe('montarRonda', () => {
  it('conta os pendentes e agrupa por setor', () => {
    const { setores, totalPendentes } = montarRonda(
      equipamentos,
      manutencoes,
      false,
    )
    expect(totalPendentes).toBe(1)
    expect(setores.map((s) => s.setor)).toEqual(['CME', 'Radiologia'])
  })

  it('com "só pendentes" mostra apenas quem precisa de ação', () => {
    const { setores } = montarRonda(equipamentos, manutencoes, true)
    expect(setores).toHaveLength(1)
    expect(setores[0].setor).toBe('CME')
    expect(setores[0].itens[0].status.chave).toBe('atrasado')
  })

  it('rotula o status de forma legível', () => {
    const { setores } = montarRonda(equipamentos, manutencoes, true)
    expect(setores[0].itens[0].status.label).toBe('Atrasado há 30 dias')
  })
})

describe('pendentesDaRonda', () => {
  it('lista só os pendentes, em ordem de ronda', () => {
    const lista = pendentesDaRonda(equipamentos, manutencoes)
    expect(lista.map((e) => e.id)).toEqual(['e1']) // e2 está em dia
  })
})
