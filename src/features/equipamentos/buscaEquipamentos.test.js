import { describe, it, expect } from 'vitest'
import { filtrarEquipamentosPorTermo } from './buscaEquipamentos'

const equipamentos = [
  { id: 'a', nome: 'Split Sala 1', patrimonio: 'PAT-100', serie: 'SN-AAA' },
  {
    id: 'b',
    nome: 'Geladeira Vacinas',
    patrimonio: 'PAT-200',
    serie: 'SN-BBB',
  },
  { id: 'c', nome: 'Freezer', patrimonio: null, serie: null },
]

describe('filtrarEquipamentosPorTermo', () => {
  it('casa por nome (case-insensitive)', () => {
    expect(
      filtrarEquipamentosPorTermo(equipamentos, 'split').map((e) => e.id),
    ).toEqual(['a'])
    expect(
      filtrarEquipamentosPorTermo(equipamentos, 'GELADEIRA').map((e) => e.id),
    ).toEqual(['b'])
  })

  it('casa por patrimônio e por série', () => {
    expect(
      filtrarEquipamentosPorTermo(equipamentos, 'pat-200').map((e) => e.id),
    ).toEqual(['b'])
    expect(
      filtrarEquipamentosPorTermo(equipamentos, 'sn-aaa').map((e) => e.id),
    ).toEqual(['a'])
  })

  it('termo vazio devolve lista vazia', () => {
    expect(filtrarEquipamentosPorTermo(equipamentos, '')).toEqual([])
    expect(filtrarEquipamentosPorTermo(equipamentos, '   ')).toEqual([])
  })

  it('é robusto a patrimônio/série nulos', () => {
    expect(
      filtrarEquipamentosPorTermo(equipamentos, 'freezer').map((e) => e.id),
    ).toEqual(['c'])
  })

  it('devolve vazio quando nada casa', () => {
    expect(filtrarEquipamentosPorTermo(equipamentos, 'xyz')).toEqual([])
  })
})
