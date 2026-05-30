// Modal genérico reutilizável: overlay escuro que fecha ao clicar fora,
// com stopPropagation no cartão (clicar dentro não fecha). Recebe um
// titulo opcional, o conteúdo (children) e onClose.
export default function Modal({ titulo, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {titulo && (
          <h2 className="mb-4 text-lg font-semibold text-gray-100">{titulo}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
