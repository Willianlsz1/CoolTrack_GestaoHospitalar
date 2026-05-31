import { describe, it, expect } from 'vitest'
import { resumoUsuarios, servicosDoUsuario } from './usuariosAgregacoes'

const perfis = [
  { id: 'u1', nome: 'Ana' },
  { id: 'u2', nome: 'Bia' },
  { id: 'u3', nome: 'Caio' }, // sem setor e sem serviço
]

const setores = [
  { id: 's1', nome: 'CME', responsavel_id: 'u1' },
  { id: 's2', nome: 'CTI Neonatal', responsavel_id: 'u1' },
  { id: 's3', nome: 'Pronto Socorro', responsavel_id: 'u2' },
  { id: 's4', nome: 'Farmácia', responsavel_id: null }, // sem responsável
]

// Ordenadas por data desc (como o app entrega).
const manutencoes = [
  { id: 'm1', registrado_por: 'u1', data: '2026-05-20' },
  { id: 'm2', registrado_por: 'u2', data: '2026-05-15' },
  { id: 'm3', registrado_por: 'u1', data: '2026-05-10' },
]

describe('servicosDoUsuario', () => {
  it('filtra pelos serviços registrados pelo usuário, na ordem recebida', () => {
    expect(servicosDoUsuario(manutencoes, 'u1')).toEqual([
      { id: 'm1', registrado_por: 'u1', data: '2026-05-20' },
      { id: 'm3', registrado_por: 'u1', data: '2026-05-10' },
    ])
    expect(servicosDoUsuario(manutencoes, 'u3')).toEqual([])
  })
})

describe('resumoUsuarios', () => {
  it('cruza setores e serviços por usuário', () => {
    const mapa = resumoUsuarios(perfis, setores, manutencoes)
    expect(mapa.get('u1')).toEqual({
      setores: ['CME', 'CTI Neonatal'],
      totalServicos: 2,
      ultimoServico: '2026-05-20', // o mais recente
    })
    expect(mapa.get('u2')).toEqual({
      setores: ['Pronto Socorro'],
      totalServicos: 1,
      ultimoServico: '2026-05-15',
    })
  })

  it('usuário sem setor nem serviço fica zerado', () => {
    const mapa = resumoUsuarios(perfis, setores, manutencoes)
    expect(mapa.get('u3')).toEqual({
      setores: [],
      totalServicos: 0,
      ultimoServico: null,
    })
  })
})
