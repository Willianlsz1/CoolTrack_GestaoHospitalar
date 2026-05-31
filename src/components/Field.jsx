// Campo de formulário: rótulo (com * se obrigatório) + o controle (filho)
// + hint OU erro embaixo (.ct-label / .ct-hint / .ct-error).
export function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="ct-label">
        {label}
        {required ? ' *' : ''}
      </label>
      {children}
      {error ? (
        <p className="ct-error">{error}</p>
      ) : hint ? (
        <p className="ct-hint">{hint}</p>
      ) : null}
    </div>
  )
}
