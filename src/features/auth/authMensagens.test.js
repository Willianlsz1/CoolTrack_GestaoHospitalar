import { describe, it, expect } from 'vitest'
import { mensagemErroAuth } from './authMensagens'

describe('mensagemErroAuth', () => {
  it('traduz credenciais inválidas pelo code', () => {
    expect(mensagemErroAuth({ code: 'invalid_credentials', status: 400 })).toBe(
      'E-mail ou senha incorretos.',
    )
  })

  it('traduz credenciais inválidas pela mensagem em inglês', () => {
    expect(
      mensagemErroAuth({ message: 'Invalid login credentials', status: 400 }),
    ).toBe('E-mail ou senha incorretos.')
  })

  it('traduz rate limit pelo status 429', () => {
    expect(
      mensagemErroAuth({ status: 429, message: 'Too many requests' }),
    ).toBe('Muitas tentativas. Aguarde um momento e tente de novo.')
  })

  it('traduz falha de rede (sem status)', () => {
    expect(mensagemErroAuth(new TypeError('Failed to fetch'))).toBe(
      'Sem conexão. Verifique sua internet e tente de novo.',
    )
  })

  it('cai no fallback para erro desconhecido, sem vazar inglês', () => {
    expect(
      mensagemErroAuth({ status: 500, message: 'Internal server error' }),
    ).toBe('Não foi possível entrar. Tente novamente.')
  })

  it('é robusto a erro nulo/indefinido', () => {
    expect(mensagemErroAuth(null)).toBe(
      'Não foi possível entrar. Tente novamente.',
    )
  })
})
