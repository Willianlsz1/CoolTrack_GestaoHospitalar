import { useState, useMemo } from 'react'
import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { Plus, ScanLine, Boxes } from 'lucide-react'
import { useEquipamentos } from './useEquipamentos'
import { useMeuPerfil } from '../perfil/useMeuPerfil'
import { useToast } from '../feedback/useToast'
import { nomeSetorDoEquipamento } from '../../core/dominio'
import { Button } from '../../components/Button'
import { Carregando, Erro } from '../../components/Estado'
import Modal from '../../components/Modal'
import EquipamentosForm from './EquipamentosForm'
import { EquipamentoLinha } from './EquipamentoLinha'
import { EquipamentoCard } from './EquipamentoCard'
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
  const toast = useToast()

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

      {isPending && <Carregando texto="Carregando equipamentos…" />}
      {isError && <Erro>Erro ao carregar equipamentos.</Erro>}
      {semCadastro && (
        <div className="ct-card ct-card--pad24 mt-2 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)]">
            <Boxes size={24} className="text-[var(--fg-3)]" />
          </div>
          <h2 className="text-[17px] font-medium">
            Comece cadastrando seu primeiro equipamento
          </h2>
          <p className="t-secondary mx-auto mt-1 max-w-md">
            Cadastre os equipamentos de refrigeração para acompanhar a cadência
            do PMOC, registrar serviços e gerar o relatório.
          </p>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" icon={Plus} onClick={abrirCriar}>
              Cadastrar primeiro equipamento
            </Button>
          </div>
        </div>
      )}
      {semResultado && (
        <p className="t-secondary">
          Nenhum equipamento encontrado com esses filtros.
        </p>
      )}

      {!isPending && !isError && filtrados.length > 0 && (
        <>
          {/* Desktop (>= sm): tabela */}
          <div className="hidden sm:block">
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
          </div>

          {/* Mobile (< sm): cartões, área toda tocável -> ficha */}
          <ul className="m-0 flex list-none flex-col gap-2 p-0 sm:hidden">
            {filtrados.map((eq) => (
              <EquipamentoCard key={eq.id} eq={eq} />
            ))}
          </ul>
        </>
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
            onSucesso={() => {
              setFormAberto(false)
              toast.sucesso('Equipamento salvo')
            }}
            onCancelar={() => setFormAberto(false)}
          />
        </Modal>
      )}
    </div>
  )
}
