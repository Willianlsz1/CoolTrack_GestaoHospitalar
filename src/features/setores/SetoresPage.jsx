import { useState } from 'react'
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react'
import { useEhAdmin } from '../perfil/useEhAdmin'
import { useSetores, useExcluirSetor } from './useSetores'
import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import SetorForm from './SetorForm'

// Gestão de setores (só admin). A trava real é o RLS do banco (escrita
// admin-only); a guarda aqui é UX/defesa.
export default function SetoresPage() {
  const { ehAdmin, carregando } = useEhAdmin()

  if (carregando) return <p className="t-secondary">Carregando…</p>

  if (!ehAdmin) {
    return (
      <div>
        <h1>Setores</h1>
        <p className="t-secondary mt-2">
          Acesso restrito — apenas administradores podem gerenciar setores.
        </p>
      </div>
    )
  }

  return <GestaoSetores />
}

function GestaoSetores() {
  const { data: setores, isPending, isError, error } = useSetores()
  const excluir = useExcluirSetor()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  function abrirNovo() {
    setEditando(null)
    setModalAberto(true)
  }
  function abrirEdicao(s) {
    setEditando(s)
    setModalAberto(true)
  }
  function confirmarExcluir(s) {
    const ok = window.confirm(
      `Excluir o setor "${s.nome}"? Os equipamentos nele ficarão sem setor.`,
    )
    if (ok) excluir.mutate(s.id)
  }

  const acaoCls =
    'rounded-[var(--r)] p-1.5 text-[var(--fg-3)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]'

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1>Setores</h1>
          <p className="t-secondary mt-1">
            Cadência de manutenção por setor (PMOC).
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={abrirNovo}>
          Novo setor
        </Button>
      </div>

      {isPending && <p className="t-secondary">Carregando…</p>}
      {isError && (
        <p style={{ color: 'var(--danger)' }}>Erro: {error.message}</p>
      )}

      {!isPending && !isError && setores.length === 0 && (
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <MapPin size={22} className="mx-auto mb-2 text-[var(--fg-3)]" />
          <p className="t-secondary">
            Nenhum setor cadastrado. Comece criando o primeiro.
          </p>
        </div>
      )}

      {!isPending && !isError && setores.length > 0 && (
        <div className="overflow-hidden rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[13px] text-[var(--fg-3)]">
                <th className="px-4 py-2.5 font-medium">Setor</th>
                <th className="px-4 py-2.5 font-medium">Intervalo</th>
                <th className="px-4 py-2.5 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {setores.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <td className="px-4 py-2.5 text-[var(--fg)]">{s.nome}</td>
                  <td className="px-4 py-2.5 text-[var(--fg-2)]">
                    {s.intervalo_dias} dias
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(s)}
                        aria-label="Editar"
                        className={acaoCls}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmarExcluir(s)}
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
          titulo={editando ? 'Editar setor' : 'Novo setor'}
          onClose={() => setModalAberto(false)}
        >
          <SetorForm
            setor={editando}
            onSucesso={() => setModalAberto(false)}
            onCancelar={() => setModalAberto(false)}
          />
        </Modal>
      )}
    </div>
  )
}
