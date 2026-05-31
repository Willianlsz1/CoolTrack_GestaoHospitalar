import { useState, useMemo } from 'react'
import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { Plus, ScanLine } from 'lucide-react'
import { useEquipamentos } from './useEquipamentos'
import { useMeuPerfil } from '../perfil/useMeuPerfil'
import { nomeSetorDoEquipamento } from '../../core/dominio'
import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import EquipamentosForm from './EquipamentosForm'
import { EquipamentoLinha } from './EquipamentoLinha'
import { FiltrosEquipamentos } from './FiltrosEquipamentos'

// Filtro client-side por busca (nome/série), setor e status.
function filtrar(equipamentos, { busca, setor, status }) {
  const b = busca.trim().toLowerCase()
  return equipamentos.filter((eq) => {
    if (status && eq.status !== status) return false
    if (setor && nomeSetorDoEquipamento(eq) !== setor) return false
    if (b && !`${eq.nome} ${eq.serie ?? ''}`.toLowerCase().includes(b)) {
      return false
    }
    return true
  })
}

export default function EquipamentosLista() {
  const { data: equipamentos, isPending, isError } = useEquipamentos()
  const { data: perfil } = useMeuPerfil()
  const podeExcluir = perfil?.role === 'admin'

  // O filtro de SETOR é dirigido pela URL (?setor=<nome>): tanto o deep-link
  // vindo dos cards de Setores quanto a troca no dropdown atualizam o mesmo
  // lugar — fonte única, sem estado grudado e com link compartilhável.
  // busca/status seguem como estado local (não precisam de URL).
  const { setor: setorUrl } = useSearch({ strict: false })
  const navigate = useNavigate()
  const filtroSetor = setorUrl ?? ''
  const setFiltroSetor = (novo) =>
    navigate({ to: '/', search: novo ? { setor: novo } : {}, replace: true })

  const [formAberto, setFormAberto] = useState(false)
  const [equipamentoEditando, setEquipamentoEditando] = useState(null)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  function abrirCriar() {
    setEquipamentoEditando(null)
    setFormAberto(true)
  }
  function abrirEditar(eq) {
    setEquipamentoEditando(eq)
    setFormAberto(true)
  }

  const setores = useMemo(
    () =>
      equipamentos
        ? [
            ...new Set(
              equipamentos.map(nomeSetorDoEquipamento).filter(Boolean),
            ),
          ].sort()
        : [],
    [equipamentos],
  )
  const filtrados = useMemo(
    () =>
      equipamentos
        ? filtrar(equipamentos, {
            busca,
            setor: filtroSetor,
            status: filtroStatus,
          })
        : [],
    [equipamentos, busca, filtroSetor, filtroStatus],
  )

  const semCadastro = !isPending && !isError && equipamentos.length === 0
  const semResultado =
    !semCadastro && !isPending && !isError && filtrados.length === 0

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1>Equipamentos</h1>
          <p className="t-secondary" style={{ marginTop: 4 }}>
            Inventário de equipamentos de refrigeração
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/escanear" className="ct-btn ct-btn--secondary">
            <ScanLine size={16} />
            Escanear
          </Link>
          <Button variant="primary" icon={Plus} onClick={abrirCriar}>
            Novo equipamento
          </Button>
        </div>
      </header>

      <FiltrosEquipamentos
        busca={busca}
        setBusca={setBusca}
        setor={filtroSetor}
        setSetor={setFiltroSetor}
        status={filtroStatus}
        setStatus={setFiltroStatus}
        setores={setores}
      />

      {isPending && <p className="t-secondary">Carregando equipamentos…</p>}
      {isError && (
        <p style={{ color: 'var(--danger)' }}>Erro ao carregar equipamentos.</p>
      )}
      {semCadastro && (
        <p className="t-secondary">Nenhum equipamento cadastrado ainda.</p>
      )}
      {semResultado && (
        <p className="t-secondary">
          Nenhum equipamento encontrado com esses filtros.
        </p>
      )}

      {!isPending && !isError && filtrados.length > 0 && (
        <div className="ct-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="ct-table">
            <thead>
              <tr>
                <th style={{ width: 56 }}></th>
                <th>Equipamento</th>
                <th>Localização</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((eq) => (
                <EquipamentoLinha
                  key={eq.id}
                  eq={eq}
                  onEditar={abrirEditar}
                  podeExcluir={podeExcluir}
                />
              ))}
            </tbody>
          </table>
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
