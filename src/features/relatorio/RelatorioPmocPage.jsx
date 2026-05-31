import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Printer, Settings } from 'lucide-react'
import { useEquipamentos } from '../equipamentos/useEquipamentos'
import { useTodasManutencoes } from '../dashboard/useTodasManutencoes'
import { useConfigPmoc } from '../config/useConfigPmoc'
import { useEhAdmin } from '../perfil/useEhAdmin'
import { montarRelatorioPmoc } from './relatorioPmoc'
import { nomeSetorDoEquipamento } from '../../core/dominio'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'

const num = (n, casas = 0) =>
  n == null ? '—' : n.toLocaleString('pt-BR', { maximumFractionDigits: casas })

// Imprime só o relatório (classe no body alterna o modo no @media print).
function imprimir() {
  document.body.classList.add('imprimir-relatorio')
  const limpar = () => {
    document.body.classList.remove('imprimir-relatorio')
    window.removeEventListener('afterprint', limpar)
  }
  window.addEventListener('afterprint', limpar)
  window.print()
}

const th = 'border-b border-[var(--border)] px-3 py-2 text-left font-medium'
const td = 'border-b border-[var(--border)] px-3 py-2'

export default function RelatorioPmocPage() {
  const eqQuery = useEquipamentos()
  const manQuery = useTodasManutencoes()
  const { data: config } = useConfigPmoc()
  const { ehAdmin } = useEhAdmin()
  const [filtroSetor, setFiltroSetor] = useState('')

  if (eqQuery.isPending || manQuery.isPending) {
    return <p className="t-secondary">Carregando…</p>
  }
  if (eqQuery.isError || manQuery.isError) {
    return <p style={{ color: 'var(--danger)' }}>Erro ao carregar os dados.</p>
  }

  const eqs = eqQuery.data
  const mans = manQuery.data
  const setores = [
    ...new Set(eqs.map(nomeSetorDoEquipamento).filter(Boolean)),
  ].sort()
  const filtrados = filtroSetor
    ? eqs.filter((e) => nomeSetorDoEquipamento(e) === filtroSetor)
    : eqs
  const { linhas, totais } = montarRelatorioPmoc(filtrados, mans)

  return (
    <div>
      {/* Barra de ações — some na impressão. */}
      <div className="no-print mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="sm:w-56">
          <Select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
          >
            <option value="">Todos os setores</option>
            {setores.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        {ehAdmin && (
          <Link to="/config-pmoc" className="ct-btn ct-btn--ghost">
            <Settings size={16} /> Configurar
          </Link>
        )}
        <Button variant="secondary" icon={Printer} onClick={imprimir}>
          Imprimir / PDF
        </Button>
      </div>

      {/* Área impressa. */}
      <div className="relatorio-impressao">
        {config?.hospital_nome && (
          <div className="mb-4 border-b border-[var(--border)] pb-3">
            <div className="text-[16px] font-medium text-[var(--fg)]">
              {config.hospital_nome}
            </div>
            <div className="t-caption">
              {[
                config.hospital_cnpj && `CNPJ ${config.hospital_cnpj}`,
                config.hospital_endereco,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        )}
        <header className="mb-4">
          <h1>Relatório PMOC</h1>
          <p className="t-secondary mt-1">
            {filtroSetor ? `Setor: ${filtroSetor}` : 'Todos os setores'} ·
            inventário e cadência de manutenção preventiva
          </p>
        </header>

        <div className="overflow-x-auto rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[var(--fg-3)]">
                <th scope="col" className={th}>
                  Equipamento
                </th>
                <th scope="col" className={th}>
                  Periodicidade
                </th>
                <th scope="col" className={th}>
                  Última
                </th>
                <th scope="col" className={th}>
                  Próxima
                </th>
                <th scope="col" className={th}>
                  Localização
                </th>
                <th scope="col" className={th}>
                  Carga (BTU)
                </th>
                <th scope="col" className={th}>
                  Área (m²)
                </th>
                <th scope="col" className={th}>
                  Ativo
                </th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.id} className="text-[var(--fg-2)]">
                  <td className={`${td} text-[var(--fg)]`}>{l.nome}</td>
                  <td className={td}>{l.periodicidade}</td>
                  <td className={td}>{l.ultima}</td>
                  <td className={td}>{l.proxima}</td>
                  <td className={td}>{l.setor}</td>
                  <td className={td}>{num(l.cargaBtu)}</td>
                  <td className={td}>{num(l.areaM2, 2)}</td>
                  <td className={td}>{l.ativo}</td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <td className={`${td} text-[var(--fg-3)]`} colSpan={8}>
                    Nenhum equipamento neste recorte.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-medium text-[var(--fg)]">
                <td className={td}>{totais.quantidade} equipamentos</td>
                <td className={td} colSpan={4}>
                  TR {num(totais.tr, 1)}
                </td>
                <td className={td}>{num(totais.btu)}</td>
                <td className={td}>{num(totais.m2, 2)}</td>
                <td className={td}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {config?.rt_nome && (
          <div className="mt-10 text-[13px]">
            <div className="mb-1 h-px w-64 bg-[var(--fg-3)]" />
            <div className="text-[var(--fg)]">{config.rt_nome}</div>
            <div className="t-caption">
              Responsável Técnico
              {config.rt_conselho || config.rt_registro
                ? ` · ${[config.rt_conselho, config.rt_registro].filter(Boolean).join(' ')}`
                : ''}
              {config.rt_documento ? ` · ART/TRT ${config.rt_documento}` : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
