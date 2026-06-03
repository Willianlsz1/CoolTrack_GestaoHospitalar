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
      if (e.key === 'Escape') {
        onClose()
        return
      }
      // Focus-trap: Tab/Shift+Tab ciclam dentro do diálogo (não vazam para o
      // conteúdo atrás do overlay).
      if (e.key !== 'Tab' || !ref.current) return
      const focaveis = ref.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focaveis.length === 0) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      const ativo = document.activeElement
      if (e.shiftKey && (ativo === primeiro || ativo === ref.current)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && ativo === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
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
