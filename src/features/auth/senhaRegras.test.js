import { describe, it, expect } from 'vitest'
import { validarNovaSenha, MIN_SENHA } from './senhaRegras'

describe('validarNovaSenha', () => {
  it('aceita senha longa o bastante com confirmação igual', () => {
    expect(validarNovaSenha('abcd1234', 'abcd1234')).toBeNull()
  })

  it('recusa senha curta', () => {
    const curta = 'a'.repeat(MIN_SENHA - 1)
    expect(validarNovaSenha(curta, curta)).toMatch(/ao menos/)
  })

  it('recusa confirmação diferente', () => {
    expect(validarNovaSenha('abcd1234', 'abcd12345')).toBe(
      'As senhas não conferem.',
    )
  })

  it('cobra o tamanho ANTES de comparar (erro mais útil primeiro)', () => {
    // Curta E diferente: a mensagem de tamanho é a que ensina o que fazer.
    expect(validarNovaSenha('abc', 'xyz')).toMatch(/ao menos/)
  })
})
