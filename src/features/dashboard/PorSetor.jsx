import { Building2 } from 'lucide-react'

// Nível 3 — distribuição por setor: nome + mini-barra proporcional +
// contagem, do maior para o menor. "Outros setores" (agrupado) fica
// esmaecido com a barra cheia.
export function PorSetor({ setores }) {
  const max = Math.max(
    1,
    ...setores.filter((s) => !s.agrupado).map((s) => s.count),
  )

  return (
    <article className="flex min-h-0 flex-col rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] px-[22px] py-[18px]">
      <p className="flex items-center gap-2 text-[14px] text-[var(--fg-3)]">
        <Building2 size={16} /> Equipamentos por setor
      </p>
      <p className="t-caption mb-[10px] mt-0.5">
        Quantos equipamentos cada setor tem — e quantos estão atrasados.
      </p>
      {setores.length === 0 ? (
        <p className="t-secondary">Sem setores.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {setores.map((s) => (
            // Chave estável: o bucket agrupado usa um id sintético próprio, para
            // não colidir com um setor real que por acaso se chame "Outros setores".
            <li
              key={s.agrupado ? '__outros__' : s.setor}
              className="grid grid-cols-[110px_1fr_44px] items-center gap-[14px] border-t border-[var(--border)] py-1.5 first:border-t-0"
            >
              <span className="min-w-0">
                <span
                  className={`block truncate text-[15px] ${s.agrupado ? 'text-[var(--fg-3)]' : 'text-[var(--fg-2)]'}`}
                >
                  {s.setor}
                </span>
                {s.atrasados > 0 && (
                  <span
                    className="block text-[12px]"
                    style={{ color: 'var(--danger)' }}
                  >
                    {s.atrasados} atrasado{s.atrasados > 1 ? 's' : ''}
                  </span>
                )}
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <i
                  className="block h-full rounded-full"
                  style={{
                    width: s.agrupado ? '100%' : `${(s.count / max) * 100}%`,
                    background: s.agrupado
                      ? 'var(--border-strong)'
                      : 'var(--brand)',
                  }}
                />
              </span>
              <span
                className={`mono text-right text-[14px] ${s.agrupado ? 'text-[var(--fg-3)]' : 'text-[var(--fg)]'}`}
              >
                {s.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
