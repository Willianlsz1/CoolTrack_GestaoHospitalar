import { useEffect, useId, useRef } from 'react'

// Modal do design system (.ct-overlay / .ct-modal): overlay que fecha ao
// clicar fora, com stopPropagation no conteúdo. titulo opcional + children.
// A11y: role="dialog" + aria-modal, rotulado pelo título; Esc fecha; o foco
// vai para o diálogo ao abrir (leitor de tela / teclado começam dentro).
export default function Modal({ titulo, onClose, children }) {
  const ref = useRef(null)
  const tituloId = useId()

  useEffect(() => {
    ref.current?.focus()
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="ct-overlay" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titulo ? tituloId : undefined}
        tabIndex={-1}
        className="ct-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {titulo && (
          <h2 id={tituloId} style={{ marginBottom: 'var(--s-2)' }}>
            {titulo}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
