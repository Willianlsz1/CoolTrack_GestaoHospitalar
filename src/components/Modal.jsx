// Modal do design system (.ct-overlay / .ct-modal): overlay que fecha ao
// clicar fora, com stopPropagation no conteúdo. titulo opcional + children.
export default function Modal({ titulo, onClose, children }) {
  return (
    <div className="ct-overlay" onClick={onClose}>
      <div className="ct-modal" onClick={(e) => e.stopPropagation()}>
        {titulo && <h2 style={{ marginBottom: 'var(--s-2)' }}>{titulo}</h2>}
        {children}
      </div>
    </div>
  )
}
