import { useState } from 'react'
import { SomenteAdmin } from '../../components/SomenteAdmin'
import { useTodasManutencoes } from '../dashboard/useTodasManutencoes'
import { useAprovarVarios } from '../manutencoes/useAprovarManutencao'
import { useToast } from '../feedback/useToast'
import { ServicoDetalhe } from '../manutencoes/ServicoDetalhe'
import { Button } from '../../components/Button'
import {
  filtrarPorAprovacao,
  contagemPorAprovacao,
} from './aprovacoesSelectors'
import { AprovacaoItem } from './AprovacaoItem'

const ABAS = [
  { chave: 'pendente', label: 'Pendentes' },
  { chave: 'aprovado', label: 'Aprovados' },
  { chave: 'reprovado', label: 'Reprovados' },
]

// Fila de aprovação (só admin/gestor). A trava real é o RLS (update
// admin-only); a guarda aqui é UX.
export default function AprovacoesPage() {
  return (
    <SomenteAdmin titulo="Aprovações">
      <FilaAprovacoes />
    </SomenteAdmin>
  )
}

function AbaBtn({ ativo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-[15px] ${
        ativo
          ? 'border-[var(--link)] text-[var(--fg)]'
          : 'border-transparent text-[var(--fg-3)] hover:text-[var(--fg)]'
      }`}
    >
      {children}
    </button>
  )
}

function FilaAprovacoes() {
  const {
    data: manutencoes = [],
    isPending,
    isError,
    error,
  } = useTodasManutencoes()
  const aprovarVarios = useAprovarVarios()
  const toast = useToast()
  const [aba, setAba] = useState('pendente')
  const [selecionados, setSelecionados] = useState(() => new Set())

  const contagem = contagemPorAprovacao(manutencoes)
  const lista = filtrarPorAprovacao(manutencoes, aba)

  // Só os ids ainda na lista (ignora seleção de itens que já saíram da fila).
  const idsValidos = lista
    .filter((m) => selecionados.has(m.id))
    .map((m) => m.id)
  const todosSel = lista.length > 0 && idsValidos.length === lista.length

  function alternar(id) {
    setSelecionados((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }
  function alternarTodos() {
    setSelecionados(todosSel ? new Set() : new Set(lista.map((m) => m.id)))
  }
  function aprovarSelecionados() {
    aprovarVarios.mutate(idsValidos, {
      onSuccess: () => {
        toast.sucesso(
          `${idsValidos.length} ${
            idsValidos.length === 1 ? 'serviço aprovado' : 'serviços aprovados'
          }`,
        )
        setSelecionados(new Set())
      },
    })
  }

  return (
    <div>
      <div className="mb-4">
        <h1>Aprovações</h1>
        <p className="t-secondary mt-1">
          Revisão dos serviços registrados pelos técnicos.
        </p>
      </div>

      <div className="mb-4 flex gap-1 border-b border-[var(--border)]">
        {ABAS.map((a) => (
          <AbaBtn
            key={a.chave}
            ativo={aba === a.chave}
            onClick={() => setAba(a.chave)}
          >
            {a.label} ({contagem[a.chave]})
          </AbaBtn>
        ))}
      </div>

      {isPending && <p className="t-secondary">Carregando…</p>}
      {isError && (
        <p style={{ color: 'var(--danger)' }}>Erro: {error.message}</p>
      )}

      {!isPending && !isError && lista.length === 0 && (
        <p className="t-secondary">
          {aba === 'pendente'
            ? 'Nenhum serviço pendente — tudo revisado. ✓'
            : 'Nenhum serviço nesta aba.'}
        </p>
      )}

      {/* Barra de aprovação em lote — só na aba Pendentes */}
      {aba === 'pendente' && lista.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[14px] text-[var(--fg-2)]">
            <input
              type="checkbox"
              checked={todosSel}
              onChange={alternarTodos}
              className="h-4 w-4 accent-[var(--brand)]"
            />
            Selecionar todos ({lista.length})
          </label>
          <Button
            variant="primary"
            size="sm"
            onClick={aprovarSelecionados}
            disabled={idsValidos.length === 0 || aprovarVarios.isPending}
          >
            {idsValidos.length > 0
              ? `Aprovar ${idsValidos.length} selecionado${
                  idsValidos.length === 1 ? '' : 's'
                }`
              : 'Aprovar selecionados'}
          </Button>
        </div>
      )}

      {lista.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-1 items-start gap-4 p-0 lg:grid-cols-2">
          {lista.map((m) =>
            aba === 'pendente' ? (
              <AprovacaoItem
                key={m.id}
                servico={m}
                selecionado={selecionados.has(m.id)}
                onToggleSelecao={() => alternar(m.id)}
              />
            ) : (
              <li key={m.id}>
                <ServicoDetalhe servico={m} />
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}
