import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  contarPorStatus,
  percentual,
  atrasadosComDias,
  venceEmBreve,
  porSetorOrdenado,
  reprovadosDoUsuario,
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
      [
        {
          id: 'e1',
          status: 'ativo',
          intervalo_mensal: 30,
          data_instalacao: '2025-01-01',
        },
      ],
      ultimaPrev,
    )
    expect(r).toHaveLength(1)
    expect(r[0].dias).toBe(30) // 60 dias desde a preventiva - 30 de intervalo
    expect(r[0].nuncaPreventiva).toBe(false)
  })

  it('quem nunca teve preventiva atrasa pela instalação', () => {
    const r = atrasadosComDias(
      [
        {
          id: 'e2',
          status: 'ativo',
          intervalo_mensal: 30,
          data_instalacao: '2026-01-01',
        },
      ],
      new Map(),
    )
    expect(r[0].dias).toBe(120) // 150 dias desde a instalação - 30
    expect(r[0].nuncaPreventiva).toBe(true)
  })

  it('equipamento sem intervalo fica fora', () => {
    const r = atrasadosComDias([{ id: 'e3', status: 'ativo' }], new Map())
    expect(r).toHaveLength(0)
  })

  it('nunca teve preventiva mas recém-instalado NÃO é atrasado (carência)', () => {
    const r = atrasadosComDias(
      [
        {
          id: 'e4',
          status: 'ativo',
          intervalo_mensal: 30,
          data_instalacao: '2026-05-20',
        },
      ],
      new Map(),
    )
    expect(r).toHaveLength(0) // dentro da carência → cai em "nunca", não atrasado
  })

  it('equipamento não ativo não entra nos atrasados', () => {
    const ultimaPrev = new Map([['e5', { data: '2026-01-01' }]])
    const r = atrasadosComDias(
      [
        {
          id: 'e5',
          status: 'inativo',
          intervalo_mensal: 30,
          data_instalacao: '2025-01-01',
        },
      ],
      ultimaPrev,
    )
    expect(r).toHaveLength(0) // inativo e atrasadíssimo, mas não é inspecionado
  })
})

describe('venceEmBreve', () => {
  it('lista quem vence dentro de 7 dias', () => {
    const ultimaPrev = new Map([['e1', { data: '2026-05-06' }]])
    const r = venceEmBreve(
      [{ id: 'e1', status: 'ativo', intervalo_mensal: 30 }],
      ultimaPrev,
    )
    expect(r).toHaveLength(1)
    expect(r[0].dias).toBe(5) // faltam 5
  })
  it('não lista quem está em dia com folga', () => {
    const ultimaPrev = new Map([['e1', { data: '2026-05-21' }]])
    const r = venceEmBreve(
      [{ id: 'e1', status: 'ativo', intervalo_mensal: 30 }],
      ultimaPrev,
    )
    expect(r).toHaveLength(0)
  })
})

describe('reprovadosDoUsuario', () => {
  const mans = [
    {
      id: 'm1',
      aprovacao_status: 'reprovado',
      registrado_por: 'u1',
      aprovado_em: '2026-05-10',
    },
    {
      id: 'm2',
      aprovacao_status: 'aprovado',
      registrado_por: 'u1',
      aprovado_em: '2026-05-12',
    },
    {
      id: 'm3',
      aprovacao_status: 'reprovado',
      registrado_por: 'u2',
      aprovado_em: '2026-05-11',
    },
    {
      id: 'm4',
      aprovacao_status: 'reprovado',
      registrado_por: 'u1',
      aprovado_em: '2026-05-20',
    },
  ]

  it('traz só os reprovados do próprio usuário, mais recente primeiro', () => {
    const r = reprovadosDoUsuario(mans, 'u1')
    expect(r.map((m) => m.id)).toEqual(['m4', 'm1']) // m2 aprovado, m3 é de u2
  })

  it('é vazio sem usuário', () => {
    expect(reprovadosDoUsuario(mans, null)).toEqual([])
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
