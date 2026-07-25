import { Loader2 } from 'lucide-react'

// Estados de consulta acessíveis, reusados nas telas (remove a duplicação
// dos <p> inline e dá semântica para leitores de tela):
//  - Carregando: spinner animado + texto. role=status + aria-live=polite
//    (anuncia ao aparecer). O spinner girando deixa claro "está carregando",
//    não "travou" — o texto cinza sozinho some no fundo escuro.
//  - Erro:       role=alert (anuncia imediatamente uma falha).
export function Carregando({ texto = 'Carregando…', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-2 py-8 text-[var(--fg-3)] ${className}`.trim()}
    >
      <Loader2 size={20} className="animate-spin" aria-hidden="true" />
      <span className="t-secondary">{texto}</span>
    </div>
  )
}

export function Erro({ children, className = '' }) {
  return (
    <p role="alert" className={className} style={{ color: 'var(--danger)' }}>
      {children}
    </p>
  )
}
