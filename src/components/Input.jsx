// Campo de texto do design system (.ct-input). error aplica a borda
// vermelha. className extra é MESCLADO (não sobrescreve o ct-input).
export function Input({ error, className = '', ...rest }) {
  const cls = ['ct-input', error && 'ct-input--error', className]
    .filter(Boolean)
    .join(' ')
  return <input className={cls} {...rest} />
}
