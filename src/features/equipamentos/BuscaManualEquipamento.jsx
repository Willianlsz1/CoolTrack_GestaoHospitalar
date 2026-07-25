import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useEquipamentos } from './useEquipamentos'
import { filtrarEquipamentosPorTermo } from './buscaEquipamentos'
import { IconeTipo } from './iconesTipo'
import { nomeSetorDoEquipamento } from '../../core/dominio'
import { Input } from '../../components/Input'
import { Carregando, Erro } from '../../components/Estado'

// Busca manual de equipamento — fallback do Escanear quando a câmera não está
// disponível (desktop) ou o QR está danificado. Casa por nome/patrimônio/série
// e leva à MESMA ficha que o scan abriria (aba Checklist, fluxo de ronda).
const LIMITE = 8

export function BuscaManualEquipamento() {
  const { data: equipamentos = [], isPending, isError } = useEquipamentos()
  const [termo, setTermo] = useState('')
  const resultados = filtrarEquipamentosPorTermo(equipamentos, termo).slice(
    0,
    LIMITE,
  )
  const buscou = termo.trim() !== ''

  return (
    <div>
      <Input
        placeholder="Buscar por nome, patrimônio ou série…"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
      />

      {isPending && <Carregando className="mt-3" />}
      {isError && (
        <Erro className="mt-3">Não foi possível carregar os equipamentos.</Erro>
      )}
      {!isPending && !isError && buscou && resultados.length === 0 && (
        <p className="t-secondary mt-3">Nenhum equipamento encontrado.</p>
      )}

      {resultados.length > 0 && (
        <ul className="m-0 mt-3 list-none p-0">
          {resultados.map((eq) => (
            <li
              key={eq.id}
              className="border-t border-[var(--border)] first:border-t-0"
            >
              <Link
                to="/equipamentos/$id"
                params={{ id: eq.id }}
                search={{ aba: 'checklist' }}
                className="-mx-[10px] flex items-center gap-3 rounded-[var(--r)] px-[10px] py-2 hover:bg-[var(--surface-2)]"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <IconeTipo
                  tipo={eq.tipo}
                  size={20}
                  className="flex-none text-[var(--fg-3)]"
                />
                <div className="min-w-0">
                  <div className="text-[15px] text-[var(--fg)]">{eq.nome}</div>
                  <div className="t-caption">
                    {[
                      eq.patrimonio && `Pat. ${eq.patrimonio}`,
                      eq.serie && `Série ${eq.serie}`,
                      nomeSetorDoEquipamento(eq),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="flex-none text-[var(--fg-3)]"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
