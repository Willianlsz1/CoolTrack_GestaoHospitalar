import { ShieldCheck } from 'lucide-react'

// Cabeçalho de conformidade PMOC — a métrica-título do dashboard: % do parque
// ativo em dia, com a quebra (atrasados/críticos/a vencer) ao lado. Consolida
// o que antes estava espalhado em cards e responde "estamos em conformidade?".
function corPct(pct) {
  if (pct >= 90) return 'var(--ok)'
  if (pct >= 70) return 'var(--warn)'
  return 'var(--danger)'
}

export function CabecalhoConformidade({ resumo }) {
  const {
    base,
    emDia,
    pct,
    aVencer,
    atrasados,
    criticos,
    nunca,
    semCadencia,
    aguardandoAprovacao,
  } = resumo
  const cor = corPct(pct)

  return (
    <section className="ct-card flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex items-center gap-3">
        <ShieldCheck size={26} style={{ color: cor }} />
        <div>
          <p className="t-caption">Conformidade PMOC</p>
          <p
            className="text-[26px] font-medium leading-none"
            style={{ color: cor }}
          >
            {pct}%{' '}
            <span className="text-[15px] text-[var(--fg-3)]">em dia</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px] text-[var(--fg-2)]">
        <span>
          {emDia} de {base} equipamentos em dia
        </span>
        <span style={{ color: 'var(--danger)' }}>
          {atrasados} atrasados
          {criticos > 0 ? ` (${criticos} críticos)` : ''}
        </span>
        <span style={{ color: 'var(--warn)' }}>{aVencer} a vencer</span>
        {aguardandoAprovacao > 0 && (
          <span
            style={{ color: 'var(--warn)' }}
            title="Contam como em dia aqui, mas o relatório oficial só certifica preventivas aprovadas."
          >
            {aguardandoAprovacao} aguardando aprovação
          </span>
        )}
        {nunca > 0 && (
          <span className="text-[var(--fg-3)]">
            {nunca} nunca inspecionados
          </span>
        )}
        {semCadencia > 0 && (
          <span className="text-[var(--fg-3)]">{semCadencia} sem cadência</span>
        )}
      </div>
    </section>
  )
}
