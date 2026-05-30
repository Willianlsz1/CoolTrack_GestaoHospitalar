import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useExcluirEquipamento } from './useExcluirEquipamento'
import { contarManutencoes } from '../manutencoes/manutencoesQueries'

// Classes Tailwind do badge conforme o status.
function corDoStatus(status) {
  switch (status) {
    case 'ativo':
      return 'bg-green-500/15 text-green-400'
    case 'manutencao':
      return 'bg-yellow-500/15 text-yellow-400'
    case 'inativo':
      return 'bg-gray-500/15 text-gray-400'
    default:
      return 'bg-gray-500/15 text-gray-400'
  }
}

export default function EquipamentoCard({ eq, onEditar }) {
  const excluir = useExcluirEquipamento()
  // Fases do fluxo de exclusão: idle -> confirmando -> escalonado.
  const [fase, setFase] = useState('idle')
  const [contagem, setContagem] = useState(0)
  const [erro, setErro] = useState('')

  function cancelar() {
    setFase('idle')
    setErro('')
  }

  // 1ª confirmação: tenta excluir só o equipamento. Se o banco bloquear
  // por causa do histórico (FK, código 23503), escala para o aviso forte.
  function confirmarExcluir() {
    setErro('')
    excluir.mutate(
      { id: eq.id, foto_url: eq.foto_url, comManutencoes: false },
      {
        onError: async (error) => {
          if (error?.code === '23503') {
            const n = await contarManutencoes(eq.id).catch(() => 0)
            setContagem(n)
            setFase('escalonado')
          } else {
            setErro('Erro ao excluir. Tente novamente.')
          }
        },
      },
    )
  }

  // 2ª confirmação (forte): exclui em cascata (manutenções + equipamento).
  function excluirTudo() {
    setErro('')
    excluir.mutate(
      { id: eq.id, foto_url: eq.foto_url, comManutencoes: true },
      { onError: () => setErro('Erro ao excluir. Tente novamente.') },
    )
  }

  return (
    <article className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      {eq.foto_url && (
        <img
          src={eq.foto_url}
          alt={eq.nome}
          className="mb-3 h-32 w-full rounded object-cover"
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold text-gray-100">{eq.nome}</h2>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs ${corDoStatus(eq.status)}`}
        >
          {eq.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-400">{eq.tipo}</p>
      {eq.setor && <p className="mt-2 text-sm text-gray-500">{eq.setor}</p>}

      <div className="mt-3 flex items-center justify-between border-t border-gray-800 pt-3">
        <div className="flex items-center gap-3">
          <Link
            to="/equipamentos/$id"
            params={{ id: eq.id }}
            className="text-sm text-gray-500 hover:text-cyan-400"
          >
            Ver ficha
          </Link>
          <button
            onClick={() => onEditar(eq)}
            className="text-sm text-gray-500 hover:text-cyan-400"
          >
            Editar
          </button>
        </div>

        {fase === 'idle' && (
          <button
            onClick={() => setFase('confirmando')}
            className="text-sm text-gray-500 hover:text-red-400"
          >
            Excluir
          </button>
        )}

        {fase === 'confirmando' && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">Excluir?</span>
            <button
              onClick={confirmarExcluir}
              disabled={excluir.isPending}
              className="text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {excluir.isPending ? 'Excluindo…' : 'Confirmar'}
            </button>
            <button
              onClick={cancelar}
              className="text-gray-400 hover:text-gray-300"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {fase === 'escalonado' && (
        <div className="mt-3 rounded border border-red-500/30 bg-red-500/5 p-3 text-sm">
          <p className="text-gray-300">
            Este equipamento tem {contagem}{' '}
            {contagem === 1 ? 'manutenção' : 'manutenções'}. Excluir o
            equipamento e <strong>todo o histórico</strong>?
          </p>
          <div className="mt-2 flex justify-end gap-3">
            <button
              onClick={cancelar}
              className="text-gray-400 hover:text-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={excluirTudo}
              disabled={excluir.isPending}
              className="font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {excluir.isPending ? 'Excluindo…' : 'Excluir tudo'}
            </button>
          </div>
        </div>
      )}

      {erro && <p className="mt-2 text-sm text-red-400">{erro}</p>}
    </article>
  )
}
