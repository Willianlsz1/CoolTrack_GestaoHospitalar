// Select do design system (.ct-input com seta custom via background-image).
export function Select({ children, ...rest }) {
  return (
    <select className="ct-input" {...rest}>
      {children}
    </select>
  )
}
