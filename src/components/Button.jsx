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
      {Icone && <Icone size={size === 'sm' ? 15 : 16} />}
      {children}
    </button>
  )
}
