import { useState } from 'react'
import { SomenteAdmin } from '../../components/SomenteAdmin'
import { useTodasManutencoes } from '../dashboard/useTodasManutencoes'
import { ServicoDetalhe } from '../manutencoes/ServicoDetalhe'
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
  const [aba, setAba] = useState('pendente')

  const contagem = contagemPorAprovacao(manutencoes)
  const lista = filtrarPorAprovacao(manutencoes, aba)

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

      {lista.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-1 items-start gap-4 p-0 lg:grid-cols-2">
          {lista.map((m) =>
            aba === 'pendente' ? (
              <AprovacaoItem key={m.id} servico={m} />
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
