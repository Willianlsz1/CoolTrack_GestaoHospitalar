// Badge do status de aprovação de um serviço (pendente/aprovado/reprovado).
const MAPA = {
  pendente: { label: 'Pendente', cor: 'var(--warn)' },
  aprovado: { label: 'Aprovado', cor: 'var(--ok)' },
  reprovado: { label: 'Reprovado', cor: 'var(--danger)' },
}

export function AprovacaoBadge({ status }) {
  const s = MAPA[status] ?? MAPA.pendente
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[13px]"
      style={{ color: s.cor, borderColor: s.cor }}
    >
      {s.label}
    </span>
  )
}
