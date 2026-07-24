import { describe, it, expect, vi } from 'vitest'

// storage.js importa o cliente do Supabase, que exige as variáveis de
// ambiente na criação. O teste é da função PURA (caminhoDaFoto), então o
// cliente é dublado — assim o teste não depende de .env nem de rede.
vi.mock('./supabase', () => ({ supabase: {} }))

const { caminhoDaFoto } = await import('./storage')

describe('caminhoDaFoto', () => {
  it('devolve o caminho como está quando já é um caminho (dado novo)', () => {
    expect(caminhoDaFoto('a1b2c3.jpg')).toBe('a1b2c3.jpg')
  })

  it('extrai o caminho da URL pública antiga (dado anterior à 0028)', () => {
    const url =
      'https://xyz.supabase.co/storage/v1/object/public/equipamentos/a1b2c3.jpg'
    expect(caminhoDaFoto(url)).toBe('a1b2c3.jpg')
  })

  it('trata ausência de foto sem quebrar', () => {
    expect(caminhoDaFoto(null)).toBeNull()
    expect(caminhoDaFoto(undefined)).toBeNull()
    expect(caminhoDaFoto('')).toBeNull()
  })

  it('usa a ÚLTIMA ocorrência do bucket (nome de arquivo repetindo a pasta)', () => {
    // pop() pega o fim: um arquivo chamado "equipamentos/x.jpg" dentro do
    // bucket "equipamentos" não pode confundir o corte.
    const url =
      'https://xyz.supabase.co/storage/v1/object/public/equipamentos/x.jpg'
    expect(caminhoDaFoto(url)).toBe('x.jpg')
  })
})
