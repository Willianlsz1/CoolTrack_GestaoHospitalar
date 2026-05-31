import { describe, it, expect } from 'vitest'
import {
  filtrarPorAprovacao,
  contagemPorAprovacao,
} from './aprovacoesSelectors'

const mans = [
  { id: 'a', aprovacao_status: 'pendente' },
  { id: 'b', aprovacao_status: 'aprovado' },
  { id: 'c', aprovacao_status: 'pendente' },
  { id: 'd', aprovacao_status: 'reprovado' },
  { id: 'e' }, // sem campo -> tratado como pendente
]

describe('filtrarPorAprovacao', () => {
  it('mantém só os do status pedido, na ordem', () => {
    expect(filtrarPorAprovacao(mans, 'pendente').map((m) => m.id)).toEqual([
      'a',
      'c',
      'e',
    ])
    expect(filtrarPorAprovacao(mans, 'aprovado').map((m) => m.id)).toEqual([
      'b',
    ])
    expect(filtrarPorAprovacao(mans, 'reprovado').map((m) => m.id)).toEqual([
      'd',
    ])
  })

  it('lista vazia → vazio', () => {
    expect(filtrarPorAprovacao([], 'pendente')).toEqual([])
  })
})

describe('contagemPorAprovacao', () => {
  it('conta por status (sem campo conta como pendente)', () => {
    expect(contagemPorAprovacao(mans)).toEqual({
      pendente: 3,
      aprovado: 1,
      reprovado: 1,
    })
  })
})
