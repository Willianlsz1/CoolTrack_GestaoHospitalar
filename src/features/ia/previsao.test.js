import { describe, it, expect } from 'vitest'
import { preverManutencao } from './previsao'

describe('preverManutencao', () => {
  it('é nulo com menos de 2 manutenções', () => {
    expect(preverManutencao([])).toEqual({ intervalo: null, proxima: null })
    expect(preverManutencao([{ data: '2026-01-01' }])).toEqual({
      intervalo: null,
      proxima: null,
    })
  })

  it('calcula o intervalo médio e projeta a próxima', () => {
    const r = preverManutencao([{ data: '2026-01-01' }, { data: '2026-01-31' }])
    expect(r.intervalo).toBe(30)
    expect(r.proxima).toBe('2026-03-02') // 31/01 + 30 dias
  })

  it('usa a média quando os intervalos são desiguais', () => {
    // 01/01 -> 01/02 (31) e 01/02 -> 01/03 (28): média (59/2)=29,5 -> 30
    const r = preverManutencao([
      { data: '2026-02-01' },
      { data: '2026-01-01' },
      { data: '2026-03-01' },
    ])
    expect(r.intervalo).toBe(30)
  })

  it('é nulo quando todas as datas são iguais (intervalo 0)', () => {
    const r = preverManutencao([{ data: '2026-01-01' }, { data: '2026-01-01' }])
    expect(r).toEqual({ intervalo: null, proxima: null })
  })
})
