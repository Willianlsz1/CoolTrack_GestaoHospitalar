// Card de status do panorama: label + número grande + % do parque + dot.
const DOT = {
  ativo: 'var(--ok)',
  manutencao: 'var(--warn)',
  inativo: 'var(--idle)',
}
const NUM = {
  ativo: 'var(--fg)',
  manutencao: 'var(--warn)',
  inativo: 'var(--fg-2)',
}

export function StatCard({ variant, label, num, pct }) {
  return (
    <article className="flex flex-col gap-2 rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] px-[22px] py-[14px]">
      <div className="flex items-center justify-between">
        <span className="text-[15px] text-[var(--fg-2)]">{label}</span>
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: DOT[variant] }}
        />
      </div>
      <div
        className="text-[36px] font-medium leading-none tracking-[-0.02em]"
        style={{ color: NUM[variant] }}
      >
        {num}
      </div>
      <div className="text-[13px] text-[var(--fg-3)]">{pct} do parque</div>
    </article>
  )
}
