import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Pencil } from 'lucide-react'
import { useExcluirEquipamento } from './useExcluirEquipamento'
import { useToast } from '../feedback/useToast'
import { contarManutencoes } from '../manutencoes/manutencoesQueries'
import { TIPO_LABELS } from './rotulos'
import { nomeSetorDoEquipamento } from '../../core/dominio'
import { StatusBadge } from '../../components/StatusBadge'
import { MiniaturaEquipamento } from './MiniaturaEquipamento'

const acoes = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 16,
  fontSize: 13,
}

export function EquipamentoLinha({ eq, onEditar, podeExcluir }) {
  const excluir = useExcluirEquipamento()
  const toast = useToast()
  const [fase, setFase] = useState('idle') // idle | confirmando
  const [contagem, setContagem] = useState(null)

  // Ao pedir excluir, busca a contagem para mostrar "e N manutenções?".
  async function pedirExcluir() {
    const n = await contarManutencoes(eq.id).catch(() => null)
    setContagem(n)
    setFase('confirmando')
  }

  function confirmar() {
    excluir.mutate(
      {
        id: eq.id,
        foto_url: eq.foto_url,
        comManutencoes: (contagem ?? 0) > 0,
      },
      { onError: () => toast.erro('Não foi possível excluir o equipamento.') },
    )
  }

  const nomeSetor = nomeSetorDoEquipamento(eq)
  const localizacao = nomeSetor
    ? `${nomeSetor}${eq.andar ? ` · ${eq.andar}` : ''}`
    : '—'

  return (
    <tr>
      <td>
        <MiniaturaEquipamento eq={eq} />
      </td>
      <td>
        <div style={{ fontWeight: 'var(--w-medium)' }}>{eq.nome}</div>
        <div className="t-secondary">{TIPO_LABELS[eq.tipo] ?? eq.tipo}</div>
      </td>
      <td className="t-secondary">{localizacao}</td>
      <td>
        <StatusBadge status={eq.status} />
      </td>
      <td>
        {fase === 'idle' ? (
          <div style={acoes}>
            <Link
              to="/equipamentos/$id"
              params={{ id: eq.id }}
              className="ct-link"
            >
              Ver
            </Link>
            <button
              className="ct-btn ct-btn--ghost"
              onClick={() => onEditar(eq)}
              aria-label="Editar"
            >
              <Pencil size={15} />
            </button>
            {podeExcluir && (
              <button className="ct-quiet" onClick={pedirExcluir}>
                Excluir
              </button>
            )}
          </div>
        ) : (
          <div style={{ ...acoes, gap: 12 }}>
            <span className="t-secondary">
              {contagem
                ? `Excluir e ${contagem} ${contagem === 1 ? 'manutenção' : 'manutenções'}?`
                : 'Excluir?'}
            </span>
            <button
              className="ct-btn ct-btn--ghost is-danger"
              style={{ color: 'var(--danger)' }}
              disabled={excluir.isPending}
              onClick={confirmar}
            >
              {excluir.isPending ? 'Excluindo…' : 'Confirmar'}
            </button>
            <button
              className="ct-quiet"
              disabled={excluir.isPending}
              onClick={() => setFase('idle')}
            >
              Cancelar
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
