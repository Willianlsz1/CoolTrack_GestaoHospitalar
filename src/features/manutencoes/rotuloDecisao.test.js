import { describe, it, expect } from 'vitest'
import { rotuloDecisao } from './rotuloDecisao'

describe('rotuloDecisao', () => {
  it('traduz os status de decisão', () => {
    expect(rotuloDecisao('aprovado')).toBe('Aprovado')
    expect(rotuloDecisao('reprovado')).toBe('Reprovado')
    expect(rotuloDecisao('pendente')).toBe('Reaberto')
  })

  it('cai no próprio valor (ou —) para status desconhecido', () => {
    expect(rotuloDecisao('outro')).toBe('outro')
    expect(rotuloDecisao(null)).toBe('—')
  })
})
