// Estados de consulta acessíveis, reusados nas telas (remove a duplicação
// dos <p> inline e dá semântica para leitores de tela):
//  - Carregando: role=status + aria-live=polite (anuncia ao aparecer).
//  - Erro:       role=alert (anuncia imediatamente uma falha).
export function Carregando({ texto = 'Carregando…', className = '' }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`t-secondary ${className}`.trim()}
    >
      {texto}
    </p>
  )
}

export function Erro({ children, className = '' }) {
  return (
    <p role="alert" className={className} style={{ color: 'var(--danger)' }}>
      {children}
    </p>
  )
}
