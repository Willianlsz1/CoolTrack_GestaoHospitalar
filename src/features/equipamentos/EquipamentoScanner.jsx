import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ScanLine } from 'lucide-react'
import { BuscaManualEquipamento } from './BuscaManualEquipamento'

// Id do <div> onde a biblioteca injeta o vídeo da câmera.
const REGIAO_ID = 'leitor-qr'

const RE_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// O QR contém a URL da ficha; o id é o que vem depois de /equipamentos/.
// Limpamos query/hash e barra final e validamos que é um UUID — assim um
// QR estranho não navega para uma ficha quebrada. Retorna null se inválido.
function idDaUrl(texto) {
  const bruto = texto
    .split('/equipamentos/')
    .pop()
    .split(/[?#]/)[0]
    .replace(/\/$/, '')
  return RE_UUID.test(bruto) ? bruto : null
}

export default function EquipamentoScanner() {
  const navigate = useNavigate()
  // Dois estados distintos: semCamera (fatal — não dá pra escanear, a busca
  // manual vira o caminho principal) e erro (transitório — câmera funciona,
  // mas leu um QR que não é do sistema).
  const [semCamera, setSemCamera] = useState(false)
  const [erro, setErro] = useState('')
  // Trava para não disparar a navegação várias vezes na mesma leitura.
  const jaLeuRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode(REGIAO_ID)
    let cancelado = false

    // Para a câmera com segurança: stop() pode lançar de forma SÍNCRONA
    // se a câmera ainda não estiver rodando — por isso o try/catch
    // (um .catch() só pegaria erro assíncrono).
    function pararComSeguranca() {
      try {
        scanner.stop().catch(() => {})
      } catch {
        // câmera ainda não estava rodando — nada a parar
      }
    }

    scanner
      .start(
        { facingMode: 'environment' }, // câmera traseira
        { fps: 10, qrbox: 250 },
        (texto) => {
          if (jaLeuRef.current) return
          const id = idDaUrl(texto)
          if (!id) {
            // QR que não é do sistema: avisa e segue escaneando.
            setErro('QR inválido — não é um equipamento do sistema.')
            return
          }
          jaLeuRef.current = true
          scanner.stop().finally(() => {
            // Abre direto na aba Checklist (fluxo de ronda em campo).
            navigate({
              to: '/equipamentos/$id',
              params: { id },
              search: { aba: 'checklist' },
            })
          })
        },
        () => {}, // erro por frame (QR não encontrado) — ignorar
      )
      .then(() => {
        // Se a tela foi desmontada ANTES da câmera ligar, desliga agora.
        if (cancelado) pararComSeguranca()
      })
      .catch(() => {
        if (!cancelado) setSemCamera(true)
      })

    // Cleanup: marca como cancelado e tenta desligar a câmera.
    return () => {
      cancelado = true
      pararComSeguranca()
    }
  }, [navigate])

  return (
    <div>
      <Link
        to="/"
        className="ct-link inline-flex items-center gap-1 text-[14px]"
      >
        <ArrowLeft size={14} /> Voltar
      </Link>

      {semCamera ? (
        // Sem câmera (desktop): a busca manual é o caminho principal, num card
        // centralizado com ícone — o espaço em volta vira respiro, não vazio.
        <div className="flex justify-center px-2 pt-8 sm:pt-14">
          <div className="ct-card ct-card--pad24 w-full max-w-lg">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)]">
                <ScanLine size={24} className="text-[var(--fg-3)]" />
              </div>
              <h1 className="text-[19px]">Buscar equipamento</h1>
              <p className="t-secondary mx-auto mt-1 max-w-sm">
                A câmera não está disponível (comum no computador). Encontre
                pelo nome, patrimônio ou série.
              </p>
            </div>
            <BuscaManualEquipamento />
          </div>
        </div>
      ) : (
        // Câmera disponível: leitor + busca como alternativa discreta abaixo
        // (para QR danificado). max-w-md mantém o vídeo num tamanho confortável.
        <div className="mx-auto max-w-md">
          <h1 className="mt-2">Escanear QR</h1>
          <p className="t-secondary mt-2">
            Aponte a câmera para o QR Code colado no equipamento.
          </p>
          {/* A região PRECISA existir no 1º render para a lib iniciar. */}
          <div
            id={REGIAO_ID}
            className="mt-4 w-full overflow-hidden rounded-[var(--r-card)] border border-[var(--border)]"
          />
          {erro && (
            <p className="mt-3 text-[14px]" style={{ color: 'var(--danger)' }}>
              {erro}
            </p>
          )}
          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <h2 className="text-[15px] font-medium text-[var(--fg)]">
              Sem câmera ou QR danificado?
            </h2>
            <p className="t-caption mb-3 mt-1">
              Busque pelo nome, patrimônio ou série.
            </p>
            <BuscaManualEquipamento />
          </div>
        </div>
      )}
    </div>
  )
}
