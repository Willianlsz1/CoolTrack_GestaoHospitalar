import { useState } from 'react'
import { MapPin, Plus } from 'lucide-react'
import { SomenteAdmin } from '../../components/SomenteAdmin'
import { useSetores, useExcluirSetor } from './useSetores'
import { useEquipamentos } from '../equipamentos/useEquipamentos'
import { useTodasManutencoes } from '../dashboard/useTodasManutencoes'
import { useToast } from '../feedback/useToast'
import { resumoPorSetor, resumoVazio } from './setoresAgregacoes'
import { SetorCard } from './SetorCard'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import Modal from '../../components/Modal'
import SetorForm from './SetorForm'

// Gestão de setores (só admin). A trava real é o RLS do banco (escrita
// admin-only); a guarda aqui é UX/defesa.
export default function SetoresPage() {
  return (
    <SomenteAdmin titulo="Setores">
      <GestaoSetores />
    </SomenteAdmin>
  )
}

function GestaoSetores() {
  const { data: setores, isPending: setoresPend, isError, error } = useSetores()
  // Equipamentos e manutenções alimentam a contagem e o termômetro por setor.
  const { data: equipamentos = [], isPending: eqPend } = useEquipamentos()
  const { data: manutencoes = [], isPending: manPend } = useTodasManutencoes()
  const excluir = useExcluirSetor()
  const toast = useToast()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [busca, setBusca] = useState('')

  const buscando = setoresPend || eqPend || manPend
  const resumoMap = resumoPorSetor(equipamentos, manutencoes)

  // Filtro client-side por nome do setor ou do responsável.
  const termo = busca.trim().toLowerCase()
  const setoresFiltrados = (setores ?? []).filter((s) => {
    if (!termo) return true
    const resp = s.responsavel?.nome ?? s.responsavel?.email ?? ''
    return `${s.nome} ${resp}`.toLowerCase().includes(termo)
  })

  function abrirNovo() {
    setEditando(null)
    setModalAberto(true)
  }
  function abrirEdicao(s) {
    setEditando(s)
    setModalAberto(true)
  }
  // A confirmação agora é inline no card; aqui só executa.
  function excluirSetor(s) {
    excluir.mutate(s.id, {
      onError: () => toast.erro('Não foi possível excluir o setor.'),
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1>Setores</h1>
          <p className="t-secondary mt-1">
            Cadência de manutenção, responsável e situação por setor (PMOC).
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={abrirNovo}>
          Novo setor
        </Button>
      </div>

      {buscando && <p className="t-secondary">Carregando…</p>}
      {isError && (
        <p style={{ color: 'var(--danger)' }}>Erro: {error.message}</p>
      )}

      {!buscando && !isError && setores.length === 0 && (
        <div className="rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <MapPin size={22} className="mx-auto mb-2 text-[var(--fg-3)]" />
          <p className="t-secondary">
            Nenhum setor cadastrado. Comece criando o primeiro.
          </p>
        </div>
      )}

      {!buscando && !isError && setores.length > 0 && (
        <>
          <div className="mb-4 sm:max-w-xs">
            <Input
              placeholder="Buscar setor ou responsável…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {setoresFiltrados.length === 0 ? (
            <p className="t-secondary">
              Nenhum setor encontrado com essa busca.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {setoresFiltrados.map((s) => (
                <SetorCard
                  key={s.id}
                  setor={s}
                  resumo={resumoMap.get(s.id) ?? resumoVazio()}
                  onEditar={() => abrirEdicao(s)}
                  onExcluir={() => excluirSetor(s)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <Modal
          titulo={editando ? 'Editar setor' : 'Novo setor'}
          onClose={() => setModalAberto(false)}
        >
          <SetorForm
            setor={editando}
            onSucesso={() => {
              setModalAberto(false)
              toast.sucesso('Setor salvo')
            }}
            onCancelar={() => setModalAberto(false)}
          />
        </Modal>
      )}
    </div>
  )
}
