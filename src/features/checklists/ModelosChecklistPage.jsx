import { useState } from 'react'
import { ListChecks, Plus, Pencil, Trash2 } from 'lucide-react'
import { useEhAdmin } from '../perfil/useEhAdmin'
import { useModelosChecklist, useExcluirModelo } from './useModelosChecklist'
import { TIPO_LABELS } from '../equipamentos/rotulos'
import { FREQ_LABELS } from './rotulos'
import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import ModeloChecklistForm from './ModeloChecklistForm'
import { Carregando, Erro } from '../../components/Estado'

// Gestão dos modelos de checklist (só admin). A trava real é o RLS (0019).
export default function ModelosChecklistPage() {
  const { ehAdmin, carregando } = useEhAdmin()

  if (carregando) return <Carregando />

  if (!ehAdmin) {
    return (
      <div>
        <h1>Checklists</h1>
        <p className="t-secondary mt-2">
          Acesso restrito — apenas administradores definem os modelos.
        </p>
      </div>
    )
  }

  return <GestaoModelos />
}

function GestaoModelos() {
  const { data: modelos, isPending, isError, error } = useModelosChecklist()
  const excluir = useExcluirModelo()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  function abrirNovo() {
    setEditando(null)
    setModalAberto(true)
  }
  function abrirEdicao(m) {
    setEditando(m)
    setModalAberto(true)
  }
  function confirmarExcluir(m) {
    const ok = window.confirm(
      `Excluir o modelo de ${TIPO_LABELS[m.tipo] ?? m.tipo} (${FREQ_LABELS[m.frequencia]})?`,
    )
    if (ok) excluir.mutate(m.id)
  }

  const acaoCls =
    'rounded-[var(--r)] p-1.5 text-[var(--fg-3)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]'

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1>Checklists</h1>
          <p className="t-secondary mt-1">
            Modelos de procedimentos por tipo de equipamento e frequência.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={abrirNovo}>
          Novo modelo
        </Button>
      </div>

      {isPending && <Carregando />}
      {isError && <Erro>Erro: {error.message}</Erro>}

      {!isPending && !isError && modelos.length === 0 && (
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <ListChecks size={24} className="mx-auto mb-2 text-[var(--fg-3)]" />
          <p className="t-secondary">
            Nenhum modelo. Crie o primeiro (ex.: ar-condicionado · mensal).
          </p>
        </div>
      )}

      {!isPending && !isError && modelos.length > 0 && (
        <div className="overflow-hidden rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[14px] text-[var(--fg-3)]">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Tipo
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Frequência
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Itens
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {modelos.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <td className="px-4 py-2.5 text-[var(--fg)]">
                    {TIPO_LABELS[m.tipo] ?? m.tipo}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--fg-2)]">
                    {FREQ_LABELS[m.frequencia] ?? m.frequencia}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--fg-2)]">
                    {m.itens.length} {m.itens.length === 1 ? 'item' : 'itens'}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(m)}
                        aria-label="Editar"
                        className={acaoCls}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmarExcluir(m)}
                        aria-label="Excluir"
                        className={acaoCls}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <Modal
          titulo={editando ? 'Editar modelo' : 'Novo modelo de checklist'}
          onClose={() => setModalAberto(false)}
        >
          <ModeloChecklistForm
            modelo={editando}
            onSucesso={() => setModalAberto(false)}
            onCancelar={() => setModalAberto(false)}
          />
        </Modal>
      )}
    </div>
  )
}
