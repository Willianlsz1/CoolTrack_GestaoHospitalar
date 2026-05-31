import { describe, it, expect } from 'vitest'
import {
  nomeSetorDoEquipamento,
  ultimaPreventivaPorEquipamento,
  classificarChecklistMensal,
} from './dominio'

describe('nomeSetorDoEquipamento', () => {
  it('prefere o setor relacionado', () => {
    expect(
      nomeSetorDoEquipamento({ setores: { nome: 'CME' }, setor: '3A1' }),
    ).toBe('CME')
  })
  it('cai no texto legado quando não há relação', () => {
    expect(nomeSetorDoEquipamento({ setor: '3A1' })).toBe('3A1')
  })
  it('retorna null quando não há nenhum', () => {
    expect(nomeSetorDoEquipamento({})).toBe(null)
  })
})

describe('ultimaPreventivaPorEquipamento', () => {
  it('pega a 1ª PREVENTIVA de cada equipamento (lista vem desc)', () => {
    const mans = [
      { equipamento_id: 'e1', tipo: 'corretiva', data: '2026-05-20' },
      { equipamento_id: 'e1', tipo: 'preventiva', data: '2026-05-10' },
      { equipamento_id: 'e1', tipo: 'preventiva', data: '2026-04-10' },
      { equipamento_id: 'e2', tipo: 'preventiva', data: '2026-05-01' },
    ]
    const mapa = ultimaPreventivaPorEquipamento(mans)
    expect(mapa.get('e1').data).toBe('2026-05-10')
    expect(mapa.get('e2').data).toBe('2026-05-01')
  })
  it('ignora equipamentos sem preventiva', () => {
    const mapa = ultimaPreventivaPorEquipamento([
      { equipamento_id: 'e1', tipo: 'corretiva', data: '2026-05-20' },
    ])
    expect(mapa.has('e1')).toBe(false)
  })
})

describe('classificarChecklistMensal', () => {
  const hoje = '2026-05-31'

  it('sem intervalo → sem cadência', () => {
    expect(classificarChecklistMensal({}, '2026-05-01', hoje).chave).toBe(
      'sem_cadencia',
    )
  })
  it('sem preventiva → nunca', () => {
    const c = classificarChecklistMensal({ intervalo_mensal: 30 }, null, hoje)
    expect(c.chave).toBe('nunca')
    expect(c.pendente).toBe(true)
  })
  it('passou do intervalo → atrasado, com dias de atraso', () => {
    const c = classificarChecklistMensal(
      { intervalo_mensal: 30 },
      '2026-04-01',
      hoje,
    )
    expect(c.chave).toBe('atrasado')
    expect(c.dias).toBe(30) // 60 dias desde - 30 de intervalo
    expect(c.pendente).toBe(true)
  })
  it('dentro de 7 dias do vencimento → vence', () => {
    const c = classificarChecklistMensal(
      { intervalo_mensal: 30 },
      '2026-05-06',
      hoje,
    )
    expect(c.chave).toBe('vence')
    expect(c.dias).toBe(5) // faltam 5
  })
  it('com folga → em dia', () => {
    const c = classificarChecklistMensal(
      { intervalo_mensal: 30 },
      '2026-05-21',
      hoje,
    )
    expect(c.chave).toBe('emdia')
    expect(c.pendente).toBe(false)
  })
})
