import { describe, it, expect } from 'vitest'
import {
  diasEntre,
  somarDias,
  formatarData,
  formatarDiaMes,
  pluralDias,
} from './data'

describe('pluralDias', () => {
  it('usa singular só para 1', () => {
    expect(pluralDias(1)).toBe('1 dia')
    expect(pluralDias(0)).toBe('0 dias')
    expect(pluralDias(30)).toBe('30 dias')
  })
})

describe('diasEntre', () => {
  it('conta os dias inteiros entre duas datas', () => {
    expect(diasEntre('2026-05-01', '2026-05-31')).toBe(30)
  })
  it('é 0 para a mesma data', () => {
    expect(diasEntre('2026-05-31', '2026-05-31')).toBe(0)
  })
  it('atravessa a virada de mês', () => {
    expect(diasEntre('2026-01-31', '2026-02-01')).toBe(1)
  })
})

describe('somarDias', () => {
  it('soma dias atravessando o mês', () => {
    expect(somarDias('2026-05-31', 30)).toBe('2026-06-30')
  })
  it('soma 1 dia na virada de mês', () => {
    expect(somarDias('2026-01-31', 1)).toBe('2026-02-01')
  })
  it('retorna null para data vazia', () => {
    expect(somarDias(null, 5)).toBe(null)
  })
})

describe('formatarData', () => {
  it('formata ISO para DD/MM/AAAA', () => {
    expect(formatarData('2026-06-01')).toBe('01/06/2026')
  })
  it('ignora a parte de hora', () => {
    expect(formatarData('2026-06-01T10:30:00')).toBe('01/06/2026')
  })
  it('retorna travessão para nulo', () => {
    expect(formatarData(null)).toBe('—')
  })
})

describe('formatarDiaMes', () => {
  it('formata ISO para DD/MM', () => {
    expect(formatarDiaMes('2026-06-01')).toBe('01/06')
  })
  it('retorna travessão para nulo', () => {
    expect(formatarDiaMes(null)).toBe('—')
  })
})
