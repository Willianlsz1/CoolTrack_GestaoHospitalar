// Barra horizontal proporcional (faixa única dividida) + legenda.
function Legenda({ cor, texto }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i
        className="inline-block h-2 w-2 rounded-[2px]"
        style={{ background: cor }}
      />
      {texto}
    </span>
  )
}

export function ProporcaoBar({ contagem, total }) {
  const largura = (n) => (total ? `${(n / total) * 100}%` : '0%')
  return (
    <div className="mt-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <span
          style={{ width: largura(contagem.ativo), background: 'var(--ok)' }}
        />
        <span
          style={{
            width: largura(contagem.manutencao),
            background: 'var(--warn)',
          }}
        />
        <span
          style={{
            width: largura(contagem.inativo),
            background: 'var(--idle)',
          }}
        />
      </div>
      <div className="mt-[10px] flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-[var(--fg-3)]">
        <Legenda cor="var(--ok)" texto={`Ativos ${contagem.ativo}`} />
        <Legenda
          cor="var(--warn)"
          texto={`Em manutenção ${contagem.manutencao}`}
        />
        <Legenda cor="var(--idle)" texto={`Inativos ${contagem.inativo}`} />
      </div>
    </div>
  )
}
