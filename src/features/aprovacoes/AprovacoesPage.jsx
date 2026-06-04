import { useState } from 'react'
import { SomenteAdmin } from '../../components/SomenteAdmin'
import { useTodasManutencoes } from '../dashboard/useTodasManutencoes'
import { useAprovarVarios } from '../manutencoes/useAprovarManutencao'
import { useToast } from '../feedback/useToast'
import { ServicoDetalhe } from '../manutencoes/ServicoDetalhe'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { AbaBtn } from '../../components/AbaBtn'
import { Carregando, Erro } from '../../components/Estado'
import {
  filtrarPorAprovacao,
  contagemPorAprovacao,
} from './aprovacoesSelectors'
import { AprovacaoItem } from './AprovacaoItem'
import { ReabrirBotao } from './ReabrirBotao'

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
  const [busca, setBusca] = useState('')
  const [selecionados, setSelecionados] = useState(() => new Set())

  const contagem = contagemPorAprovacao(manutencoes)
  const lista = filtrarPorAprovacao(manutencoes, aba)

  // Busca por equipamento ou técnico, dentro da aba atual.
  const termo = busca.trim().toLowerCase()
  const listaFiltrada = termo
    ? lista.filter((m) =>
        `${m.equipamentos?.nome ?? ''} ${m.perfis?.nome ?? m.tecnico ?? ''}`
          .toLowerCase()
          .includes(termo),
      )
    : lista

  // Só os ids ainda na lista visível (ignora seleção de itens que saíram).
  const idsValidos = listaFiltrada
    .filter((m) => selecionados.has(m.id))
    .map((m) => m.id)
  const todosSel =
    listaFiltrada.length > 0 && idsValidos.length === listaFiltrada.length

  function alternar(id) {
    setSelecionados((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }
  function alternarTodos() {
    setSelecionados(
      todosSel ? new Set() : new Set(listaFiltrada.map((m) => m.id)),
    )
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
      onError: () => toast.erro('Não foi possível aprovar os serviços.'),
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

      {/* Busca dentro da aba (equipamento ou técnico) */}
      {!isPending && !isError && lista.length > 0 && (
        <div className="mb-3 sm:max-w-xs">
          <Input
            placeholder="Buscar equipamento ou técnico…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      )}

      {isPending && <Carregando />}
      {isError && <Erro>Erro: {error.message}</Erro>}

      {!isPending && !isError && lista.length === 0 && (
        <p className="t-secondary">
          {aba === 'pendente'
            ? 'Nenhum serviço pendente — tudo revisado. ✓'
            : 'Nenhum serviço nesta aba.'}
        </p>
      )}

      {!isPending &&
        !isError &&
        lista.length > 0 &&
        listaFiltrada.length === 0 && (
          <p className="t-secondary">
            Nenhum serviço encontrado com essa busca.
          </p>
        )}

      {/* Barra de aprovação em lote — só na aba Pendentes */}
      {aba === 'pendente' && listaFiltrada.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[14px] text-[var(--fg-2)]">
            <input
              type="checkbox"
              checked={todosSel}
              onChange={alternarTodos}
              className="h-4 w-4 accent-[var(--brand)]"
            />
            Selecionar todos ({listaFiltrada.length})
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

      {listaFiltrada.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-1 items-start gap-4 p-0 lg:grid-cols-2">
          {listaFiltrada.map((m) =>
            aba === 'pendente' ? (
              <AprovacaoItem
                key={m.id}
                servico={m}
                selecionado={selecionados.has(m.id)}
                onToggleSelecao={() => alternar(m.id)}
              />
            ) : (
              <li key={m.id}>
                <ServicoDetalhe servico={m}>
                  <ReabrirBotao servicoId={m.id} />
                </ServicoDetalhe>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}
