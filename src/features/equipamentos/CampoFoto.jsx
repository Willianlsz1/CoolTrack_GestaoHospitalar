// Campo de foto do formulário de equipamento. Em modo criar: só o
// seletor de arquivo. Em modo editar com foto: mostra a foto atual
// (esmaecida quando marcada para remover) + checkbox de remoção + dica.
// A lógica de upload/remoção vive nos hooks; aqui é só a coleta.
export function CampoFoto({
  setFoto,
  removerFoto,
  setRemoverFoto,
  fotoUrlAtual,
  editando,
}) {
  return (
    <div>
      <span className="ct-label">Foto</span>

      {editando && fotoUrlAtual && (
        <img
          src={fotoUrlAtual}
          alt="Foto atual do equipamento"
          className={`mb-2 h-24 w-full max-w-[280px] rounded-[var(--r)] object-cover ${
            removerFoto ? 'opacity-30' : ''
          }`}
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFoto(e.target.files[0] ?? null)}
        className="block w-full text-[14px] text-[var(--fg-2)] file:mr-3 file:rounded-[var(--r)] file:border file:border-[var(--border)] file:bg-[var(--surface-2)] file:px-3 file:py-1.5 file:text-[14px] file:text-[var(--fg)] hover:file:bg-[var(--surface)]"
      />

      {editando && fotoUrlAtual && (
        <label className="mt-2 flex items-center gap-2 text-[14px] text-[var(--fg-2)]">
          <input
            type="checkbox"
            checked={removerFoto}
            onChange={(e) => setRemoverFoto(e.target.checked)}
          />
          Remover foto atual
        </label>
      )}

      {editando && (
        <p className="ct-hint mt-1">Deixe vazio para manter a foto atual.</p>
      )}
    </div>
  )
}
