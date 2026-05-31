// Campo de texto do design system (.ct-input). error aplica a borda
// vermelha.
export function Input({ error, ...rest }) {
  return (
    <input className={`ct-input${error ? ' ct-input--error' : ''}`} {...rest} />
  )
}
