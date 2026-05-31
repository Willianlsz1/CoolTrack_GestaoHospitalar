// Textarea do design system (.ct-input).
export function Textarea({ rows = 3, ...rest }) {
  return <textarea className="ct-input" rows={rows} {...rest} />
}
