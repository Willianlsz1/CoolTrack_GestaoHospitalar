import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  contarPorStatus,
  percentual,
  atrasadosComDias,
  venceEmBreve,
  porSetorOrdenado,
} from './dashboardAgregacoes'

// Fixa "hoje" = 31/05/2026 para os cálculos que dependem da data atual.
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-31T12:00:00'))
})
afterEach(() => vi.useRealTimers())

describe('contarPorStatus', () => {
  it('conta por status', () => {
    expect(
      contarPorStatus([
        { status: 'ativo' },
        { status: 'ativo' },
        { status: 'manutencao' },
      ]),
    ).toEqual({ ativo: 2, manutencao: 1, inativo: 0 })
  })
})

describe('percentual', () => {
  it('formata em pt-BR', () => {
    expect(percentual(1, 4)).toBe('25,0%')
  })
  it('é 0% quando total é zero', () => {
    expect(percentual(0, 0)).toBe('0%')
  })
})

describe('atrasadosComDias', () => {
  it('marca atrasado pela última preventiva e calcula o atraso', () => {
    const ultimaPrev = new Map([['e1', { data: '2026-04-01' }]])
    const r = atrasadosComDias(
      [{ id: 'e1', intervalo_mensal: 30, data_instalacao: '2025-01-01' }],
      ultimaPrev,
    )
    expect(r).toHaveLength(1)
    expect(r[0].dias).toBe(30) // 60 dias desde a preventiva - 30 de intervalo
    expect(r[0].nuncaPreventiva).toBe(false)
  })

  it('quem nunca teve preventiva atrasa pela instalação', () => {
    const r = atrasadosComDias(
      [{ id: 'e2', intervalo_mensal: 30, data_instalacao: '2026-01-01' }],
      new Map(),
    )
    expect(r[0].dias).toBe(120) // 150 dias desde a instalação - 30
    expect(r[0].nuncaPreventiva).toBe(true)
  })

  it('equipamento sem intervalo fica fora', () => {
    const r = atrasadosComDias([{ id: 'e3' }], new Map())
    expect(r).toHaveLength(0)
  })
})

describe('venceEmBreve', () => {
  it('lista quem vence dentro de 7 dias', () => {
    const ultimaPrev = new Map([['e1', { data: '2026-05-06' }]])
    const r = venceEmBreve([{ id: 'e1', intervalo_mensal: 30 }], ultimaPrev)
    expect(r).toHaveLength(1)
    expect(r[0].dias).toBe(5) // faltam 5
  })
  it('não lista quem está em dia com folga', () => {
    const ultimaPrev = new Map([['e1', { data: '2026-05-21' }]])
    const r = venceEmBreve([{ id: 'e1', intervalo_mensal: 30 }], ultimaPrev)
    expect(r).toHaveLength(0)
  })
})

describe('porSetorOrdenado', () => {
  it('agrupa por setor e ordena do maior para o menor', () => {
    const r = porSetorOrdenado([
      { setores: { nome: 'CME' } },
      { setores: { nome: 'CME' } },
      { setores: { nome: 'CME' } },
      { setores: { nome: 'Radiologia' } },
    ])
    expect(r).toEqual([
      { setor: 'CME', count: 3 },
      { setor: 'Radiologia', count: 1 },
    ])
  })
})
