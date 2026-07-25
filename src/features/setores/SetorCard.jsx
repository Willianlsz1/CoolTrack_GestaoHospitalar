import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Clock, User, Boxes, Pencil, Trash2, ArrowRight } from 'lucide-react'

// Uma "pílula" do termômetro: bolinha colorida + número + rótulo.
// Some quando a contagem é zero (não polui o card).
function Pilula({ cor, n, label }) {
  if (!n) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--fg-2)]">
      <span
        className="h-2 w-2 flex-none rounded-full"
        style={{ background: cor }}
        aria-hidden="true"
      />
      <b className="font-medium text-[var(--fg)]">{n}</b> {label}
    </span>
  )
}

const acaoCls =
  'rounded-[var(--r)] p-1.5 text-[var(--fg-3)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]'

// Card de um setor: identidade + cadência + responsável + nº de
// equipamentos + termômetro de situação. `resumo` vem de resumoPorSetor.
export function SetorCard({ setor, resumo, onEditar, onExcluir }) {
  const responsavel = setor.responsavel?.nome
  const semEquipamentos = resumo.total === 0
  const [confirmando, setConfirmando] = useState(false)

  return (
    <article className="flex flex-col gap-3 rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
      {/* Cabeçalho: nome + ações */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-[17px] font-medium">{setor.nome}</h2>
        <div className="flex flex-none items-center gap-1">
          {confirmando ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setConfirmando(false)
                  onExcluir()
                }}
                title="Os equipamentos do setor ficarão sem setor"
                className="rounded-[var(--r)] px-2 py-1 text-[13px]"
                style={{ color: 'var(--danger)' }}
              >
                Excluir
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="rounded-[var(--r)] px-2 py-1 text-[13px] text-[var(--fg-3)] hover:text-[var(--fg)]"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onEditar}
                aria-label="Editar"
                className={acaoCls}
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                aria-label="Excluir"
                className={acaoCls}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metadados */}
      <dl className="flex flex-col gap-1.5 text-[14px]">
        <div className="flex items-center gap-2 text-[var(--fg-2)]">
          <Clock size={16} className="flex-none text-[var(--fg-3)]" />
          Higienização a cada {setor.intervalo_dias} dias
        </div>
        <div className="flex items-center gap-2 text-[var(--fg-2)]">
          <User size={16} className="flex-none text-[var(--fg-3)]" />
          {responsavel ? (
            <span>
              Responsável:{' '}
              <span className="text-[var(--fg)]">{responsavel}</span>
            </span>
          ) : (
            <span className="text-[var(--fg-3)]">Sem responsável</span>
          )}
        </div>
        {resumo.total > 0 ? (
          // Linka para o inventário filtrado por este setor (pelo nome, que
          // é como o filtro de Equipamentos já compara).
          <Link
            to="/"
            search={{ setor: setor.nome }}
            className="group inline-flex w-fit items-center gap-2 text-[14px]"
            style={{ textDecoration: 'none' }}
          >
            <Boxes size={16} className="flex-none text-[var(--fg-3)]" />
            <span className="text-[var(--fg)]">{resumo.total}</span>
            <span className="text-[var(--fg-2)]">equipamentos</span>
            <ArrowRight
              size={16}
              className="flex-none text-[var(--link)] transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-[var(--fg-3)]">
            <Boxes size={16} className="flex-none" />
            <span>0 equipamentos</span>
          </div>
        )}
      </dl>

      {/* Termômetro de situação */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--border)] pt-3">
        {semEquipamentos ? (
          <span className="text-[13px] text-[var(--fg-3)]">
            Nenhum equipamento neste setor.
          </span>
        ) : (
          <>
            <Pilula
              cor="var(--danger)"
              n={resumo.atrasados}
              label={resumo.atrasados === 1 ? 'atrasado' : 'atrasados'}
            />
            <Pilula
              cor="var(--warn)"
              n={resumo.nunca}
              label="nunca executado"
            />
            <Pilula cor="var(--warn)" n={resumo.aVencer} label="a vencer" />
            <Pilula cor="var(--ok)" n={resumo.emDia} label="em dia" />
            <Pilula
              cor="var(--fg-3)"
              n={resumo.semCadencia}
              label="sem cadência"
            />
          </>
        )}
      </div>
    </article>
  )
}
