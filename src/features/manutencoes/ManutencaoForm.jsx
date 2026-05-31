import { useState } from 'react'
import { useCriarManutencao } from './useCriarManutencao'
import { hojeLocal } from '../../core/data'
import { inputCls, labelCls, fileCls } from '../../components/ui'

const TIPOS = ['preventiva', 'corretiva', 'preditiva']

// Limite de tamanho de cada foto (5 MB).
const MAX_FOTO_BYTES = 5 * 1024 * 1024

export default function ManutencaoForm({
  equipamentoId,
  onSucesso,
  onCancelar,
}) {
  const [tipo, setTipo] = useState('')
  const [data, setData] = useState(hojeLocal())
  const [descricao, setDescricao] = useState('')
  const [pecas, setPecas] = useState('')
  const [proxima, setProxima] = useState('')
  const [fotoAntes, setFotoAntes] = useState(null)
  const [fotoDepois, setFotoDepois] = useState(null)
  const [erroValidacao, setErroValidacao] = useState('')

  const criar = useCriarManutencao()

  function handleSubmit(e) {
    e.preventDefault()

    if (tipo === '') {
      setErroValidacao('Selecione o tipo da manutenção.')
      return
    }
    if (data === '') {
      setErroValidacao('Informe a data.')
      return
    }
    if (
      (fotoAntes && fotoAntes.size > MAX_FOTO_BYTES) ||
      (fotoDepois && fotoDepois.size > MAX_FOTO_BYTES)
    ) {
      setErroValidacao('Foto muito grande (máx. 5 MB).')
      return
    }
    setErroValidacao('')

    criar.mutate(
      {
        equipamento_id: equipamentoId,
        tipo,
        data,
        // Opcionais: vazio vira null. (O técnico é gravado automaticamente
        // pelo banco como o usuário logado — registrado_por.)
        descricao: descricao.trim() || null,
        pecas: pecas.trim() || null,
        proxima_manutencao: proxima || null,
        // File ou null; o hook sobe as fotos antes de inserir.
        fotoAntes,
        fotoDepois,
      },
      { onSuccess: onSucesso },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="tipo">
          Tipo *
        </label>
        <select
          id="tipo"
          className={inputCls}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Selecione…</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls} htmlFor="data">
          Data *
        </label>
        <input
          id="data"
          type="date"
          className={inputCls}
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="descricao">
          Descrição
        </label>
        <textarea
          id="descricao"
          rows={3}
          className={inputCls}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="pecas">
          Peças trocadas
        </label>
        <input
          id="pecas"
          className={inputCls}
          value={pecas}
          onChange={(e) => setPecas(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="proxima">
          Próxima manutenção
        </label>
        <input
          id="proxima"
          type="date"
          className={inputCls}
          value={proxima}
          onChange={(e) => setProxima(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="foto-antes">
          Foto antes
        </label>
        <input
          id="foto-antes"
          type="file"
          accept="image/*"
          className={fileCls}
          onChange={(e) => setFotoAntes(e.target.files[0] ?? null)}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="foto-depois">
          Foto depois
        </label>
        <input
          id="foto-depois"
          type="file"
          accept="image/*"
          className={fileCls}
          onChange={(e) => setFotoDepois(e.target.files[0] ?? null)}
        />
      </div>

      {erroValidacao && (
        <p className="text-sm text-yellow-400">{erroValidacao}</p>
      )}
      {criar.isError && (
        <p className="text-sm text-red-400">
          Erro ao salvar: {criar.error.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded px-4 py-2 text-gray-300 hover:bg-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={criar.isPending}
          className="rounded bg-cyan-500 px-4 py-2 font-medium text-gray-950 disabled:opacity-50"
        >
          {criar.isPending ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
