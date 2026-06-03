import { describe, it, expect } from 'vitest'
import { montarRelatorioPmoc } from './relatorioPmoc'

describe('montarRelatorioPmoc', () => {
  const equipamentos = [
    {
      id: 'e1',
      nome: 'Self A',
      tipo: 'ar_condicionado',
      status: 'ativo',
      intervalo_mensal: 30,
      intervalo_anual: 365,
      carga_btu: 300000,
      area_m2: 120,
      setores: { nome: 'CME' },
    },
    {
      id: 'e2',
      nome: 'Geladeira B',
      tipo: 'geladeira',
      status: 'inativo',
      intervalo_mensal: 30,
      intervalo_anual: 365,
      carga_btu: 60000,
      area_m2: 20,
      setores: { nome: 'Farmácia' },
    },
  ]
  const manutencoes = [
    {
      equipamento_id: 'e1',
      tipo: 'preventiva',
      data: '2026-05-01',
      aprovacao_status: 'aprovado',
    },
    // Pendente de aprovação: NÃO deve contar na coluna "Última".
    {
      equipamento_id: 'e2',
      tipo: 'preventiva',
      data: '2026-05-01',
      aprovacao_status: 'pendente',
    },
  ]

  const { linhas, totais } = montarRelatorioPmoc(equipamentos, manutencoes)

  it('monta a periodicidade mensal/anual', () => {
    expect(linhas[0].periodicidade).toBe('30 / 365')
  })

  it('calcula a próxima = última preventiva + intervalo mensal', () => {
    expect(linhas[0].ultima).toBe('01/05/2026')
    expect(linhas[0].proxima).toBe('31/05/2026')
  })

  it('ignora preventiva PENDENTE — só conta a aprovada (mostra "—")', () => {
    expect(linhas[1].ultima).toBe('—')
    expect(linhas[1].proxima).toBe('—')
  })

  it('mapeia ativo (S/N) pelo status', () => {
    expect(linhas[0].ativo).toBe('S')
    expect(linhas[1].ativo).toBe('N')
  })

  it('soma os totais (TR = BTU / 12.000)', () => {
    expect(totais.quantidade).toBe(2)
    expect(totais.btu).toBe(360000)
    expect(totais.m2).toBe(140)
    expect(totais.tr).toBe(30)
  })
})
