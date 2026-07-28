import { Eye } from 'lucide-react'
import { modoDemoAtivo, sairModoDemo } from '../core/demoConfig'

// Faixa fixa no topo do app inteiro enquanto o modo visitante está ativo.
// Existe para que um print ou uma gravação de tela NUNCA passe por dado
// real: quem vê a tela precisa ver junto que aquilo é demonstração.
export function BannerModoDemo() {
  if (!modoDemoAtivo()) return null
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-[var(--warn-bg,#7c5800)] px-3 py-1.5 text-[13px] text-white"
    >
      <Eye size={14} aria-hidden="true" />
      <span>
        Modo visitante — todos os dados são fictícios (ambiente de
        demonstração).
      </span>
      <button
        type="button"
        onClick={sairModoDemo}
        className="underline underline-offset-2"
      >
        Sair
      </button>
    </div>
  )
}
