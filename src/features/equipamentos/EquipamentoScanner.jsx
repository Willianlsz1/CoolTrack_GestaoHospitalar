import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Link, useNavigate } from '@tanstack/react-router'

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
            navigate({ to: '/equipamentos/$id', params: { id } })
          })
        },
        () => {}, // erro por frame (QR não encontrado) — ignorar
      )
      .then(() => {
        // Se a tela foi desmontada ANTES da câmera ligar, desliga agora.
        if (cancelado) pararComSeguranca()
      })
      .catch(() => {
        if (!cancelado) {
          setErro('Não foi possível acessar a câmera. Verifique a permissão.')
        }
      })

    // Cleanup: marca como cancelado e tenta desligar a câmera.
    return () => {
      cancelado = true
      pararComSeguranca()
    }
  }, [navigate])

  return (
    <div>
      <Link to="/" className="text-sm text-cyan-400 hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-cyan-400">Escanear QR</h1>

      {erro && <p className="mt-4 text-red-400">{erro}</p>}

      <div id={REGIAO_ID} className="mx-auto mt-4 w-full max-w-sm" />

      <p className="mt-4 text-sm text-gray-500">
        Aponte a câmera para o QR Code colado no equipamento.
      </p>
    </div>
  )
}
