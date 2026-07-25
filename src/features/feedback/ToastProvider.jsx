import { useCallback, useMemo, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { ToastContext } from './toastContext'

const ESTILO = {
  sucesso: { cor: 'var(--ok)', Icone: CheckCircle2 },
  erro: { cor: 'var(--danger)', Icone: AlertCircle },
}

const DURACAO_MS = 3500

// Pilha de avisos efemeros no rodape. aria-live=polite faz o leitor de tela
// anunciar cada novo aviso; clicar no X fecha antes da hora.
function Toaster({ toasts, aoFechar }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => {
        const { cor, Icone } = ESTILO[t.tipo] ?? ESTILO.sucesso
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex max-w-[90vw] items-center gap-2.5 rounded-[var(--r)] border bg-[var(--surface)] px-4 py-2.5 text-[14px] text-[var(--fg)] shadow-[var(--shadow-modal)]"
            style={{ borderColor: cor }}
          >
            <Icone size={16} style={{ color: cor }} className="flex-none" />
            <span>{t.mensagem}</span>
            <button
              type="button"
              onClick={() => aoFechar(t.id)}
              aria-label="Fechar"
              className="ml-1 flex-none text-[var(--fg-3)] hover:text-[var(--fg)]"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// Provider global. Expoe useToast().sucesso(msg) / .erro(msg).
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remover = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id))
  }, [])

  const mostrar = useCallback(
    (mensagem, tipo) => {
      const id = (idRef.current += 1)
      setToasts((ts) => [...ts, { id, mensagem, tipo }])
      setTimeout(() => remover(id), DURACAO_MS)
    },
    [remover],
  )

  const valor = useMemo(
    () => ({
      sucesso: (m) => mostrar(m, 'sucesso'),
      erro: (m) => mostrar(m, 'erro'),
    }),
    [mostrar],
  )

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <Toaster toasts={toasts} aoFechar={remover} />
    </ToastContext.Provider>
  )
}
