import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useEquipamentos } from './useEquipamentos'
import { useMeuPerfil } from '../perfil/useMeuPerfil'
import EquipamentosForm from './EquipamentosForm'
import EquipamentoCard from './EquipamentoCard'
import Modal from '../../components/Modal'

export default function EquipamentosLista() {
  const { data: equipamentos, isPending, isError, error } = useEquipamentos()
  const { data: perfil } = useMeuPerfil()
  const podeExcluir = perfil?.role === 'admin'
  const [formAberto, setFormAberto] = useState(false)
  // O equipamento em edição (ou null = modo criar). Define o modo do form.
  const [equipamentoEditando, setEquipamentoEditando] = useState(null)

  function abrirCriar() {
    setEquipamentoEditando(null)
    setFormAberto(true)
  }

  function abrirEditar(eq) {
    setEquipamentoEditando(eq)
    setFormAberto(true)
  }

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">Equipamentos</h1>
          <p className="text-sm text-gray-500">
            Inventário de equipamentos de refrigeração
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            to="/escanear"
            className="rounded border border-cyan-500 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10"
          >
            Escanear
          </Link>
          <button
            onClick={abrirCriar}
            className="rounded bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-cyan-400"
          >
            + Novo equipamento
          </button>
        </div>
      </header>

      {isPending && <p className="text-gray-400">Carregando equipamentos…</p>}

      {isError && (
        <div className="text-red-400">
          <p>Erro ao carregar equipamentos.</p>
          <p className="text-sm text-red-300/70">{error.message}</p>
        </div>
      )}

      {!isPending && !isError && equipamentos.length === 0 && (
        <p className="text-gray-400">Nenhum equipamento cadastrado ainda.</p>
      )}

      {!isPending && !isError && equipamentos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipamentos.map((eq) => (
            <EquipamentoCard
              key={eq.id}
              eq={eq}
              onEditar={abrirEditar}
              podeExcluir={podeExcluir}
            />
          ))}
        </div>
      )}

      {formAberto && (
        <Modal
          titulo={
            equipamentoEditando ? 'Editar equipamento' : 'Novo equipamento'
          }
          onClose={() => setFormAberto(false)}
        >
          <EquipamentosForm
            equipamento={equipamentoEditando}
            onSucesso={() => setFormAberto(false)}
            onCancelar={() => setFormAberto(false)}
          />
        </Modal>
      )}
    </div>
  )
}
