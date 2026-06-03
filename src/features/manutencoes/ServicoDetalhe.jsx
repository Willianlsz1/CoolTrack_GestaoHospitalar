import { TipoManutencaoBadge } from '../../components/TipoManutencaoBadge'
import { AprovacaoBadge } from '../../components/AprovacaoBadge'
import { formatarData } from '../../core/data'

// Um item do checklist preenchido: ✓ OK / ✗ exceção + observação.
function ItemChecklist({ item }) {
  return (
    <li className="flex items-start gap-2">
      <span
        aria-hidden="true"
        className="flex-none font-medium"
        style={{ color: item.ok ? 'var(--ok)' : 'var(--danger)' }}
      >
        {item.ok ? '✓' : '✗'}
      </span>
      <div>
        <div className="text-[14px] text-[var(--fg)]">
          {item.procedimento || item.servico}
        </div>
        {item.obs && <div className="t-caption">Obs: {item.obs}</div>}
      </div>
    </li>
  )
}

// Detalhe completo de UM serviço (manutenção): identidade (com setor),
// descrição, peças, checklist preenchido, fotos e a decisão do gestor
// (assinatura na aprovação / motivo na reprovação). `children`, se houver,
// vira um rodapé dentro do card (ex.: botões Aprovar/Reprovar).
export function ServicoDetalhe({ servico: m, children, destacado }) {
  const itens = m.checklist?.itens ?? []
  return (
    <div
      className="ct-card"
      style={destacado ? { borderColor: 'var(--link)' } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[15px] text-[var(--fg)]">
            {m.equipamentos?.nome ?? 'Equipamento removido'}
          </div>
          <div className="t-caption">
            {[
              m.equipamentos?.setores?.nome,
              formatarData(m.data),
              m.perfis?.nome ?? m.tecnico,
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
        <div className="flex flex-none flex-col items-end gap-1">
          <TipoManutencaoBadge tipo={m.tipo} />
          <AprovacaoBadge status={m.aprovacao_status} />
        </div>
      </div>

      {m.descricao && (
        <p className="mt-2 text-[14px] text-[var(--fg-2)]">{m.descricao}</p>
      )}
      {m.pecas && <p className="t-caption mt-1">Peças: {m.pecas}</p>}
      {m.proxima_manutencao && (
        <p className="t-caption mt-1">
          Próxima: {formatarData(m.proxima_manutencao)}
        </p>
      )}

      {itens.length > 0 && (
        <div className="mt-3 border-t border-[var(--border)] pt-3">
          <div className="t-caption mb-1">
            Checklist{m.checklist.frequencia && ` (${m.checklist.frequencia})`}
          </div>
          <ul className="m-0 list-none space-y-1 p-0">
            {itens.map((item, i) => (
              <ItemChecklist key={i} item={item} />
            ))}
          </ul>
        </div>
      )}

      {(m.foto_antes_url || m.foto_depois_url) && (
        <div className="mt-3 flex gap-3">
          {m.foto_antes_url && (
            <figure className="m-0">
              <img
                src={m.foto_antes_url}
                alt="Antes"
                className="h-20 w-20 rounded-[var(--r)] object-cover"
              />
              <figcaption className="t-caption mt-1">Antes</figcaption>
            </figure>
          )}
          {m.foto_depois_url && (
            <figure className="m-0">
              <img
                src={m.foto_depois_url}
                alt="Depois"
                className="h-20 w-20 rounded-[var(--r)] object-cover"
              />
              <figcaption className="t-caption mt-1">Depois</figcaption>
            </figure>
          )}
        </div>
      )}

      {/* Assinatura do gestor (aprovação) ou motivo (reprovação). */}
      {m.aprovacao_status === 'aprovado' && (
        <p className="t-caption mt-3" style={{ color: 'var(--ok)' }}>
          Aprovado por {m.aprovador?.nome ?? '—'}
          {m.aprovado_em && ` · ${formatarData(m.aprovado_em)}`}
        </p>
      )}
      {m.aprovacao_status === 'reprovado' && m.aprovacao_motivo && (
        <p className="mt-3 text-[14px]" style={{ color: 'var(--danger)' }}>
          Motivo da reprovação: {m.aprovacao_motivo}
        </p>
      )}

      {children && (
        <div className="mt-3 border-t border-[var(--border)] pt-3">
          {children}
        </div>
      )}
    </div>
  )
}
