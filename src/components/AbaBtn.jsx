// Botão de aba reutilizável (sublinhado no ativo). Usado na ficha do
// equipamento e na fila de Aprovações.
export function AbaBtn({ ativo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-[15px] ${
        ativo
          ? 'border-[var(--link)] text-[var(--fg)]'
          : 'border-transparent text-[var(--fg-3)] hover:text-[var(--fg)]'
      }`}
    >
      {children}
    </button>
  )
}
