// Botão do design system (classes .ct-btn). Variantes: primary,
// secondary, danger, danger-solid, ghost. size="sm" reduz. `icon` é um
// componente do lucide-react (ex.: icon={Plus}).
export function Button({
  variant = 'secondary',
  size,
  icon: Icone,
  children,
  ...rest
}) {
  const cls = [
    'ct-btn',
    `ct-btn--${variant}`,
    size === 'sm' ? 'ct-btn--sm' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={cls} {...rest}>
      {/* Ícone sempre 16: a escala é 16/20/24/32 e o botão pequeno reduz o
          texto e o padding, não o ícone — traço e tamanho constantes são o
          que faz a família parecer uma família. */}
      {Icone && <Icone size={16} />}
      {children}
    </button>
  )
}
