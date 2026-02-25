'use client'

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

interface BoldPaymentButtonProps {
  propertyId: string
  propertyTitle: string
  amount: number // COP enteros
  paymentType: "publication" | "featured"
}

export function BoldPaymentButton({
  propertyId,
  propertyTitle,
  amount,
  paymentType,
}: BoldPaymentButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string>("")

  // Valores del DEMO que FUNCIONA (temporal para pruebas)
  const API_KEY = process.env.NEXT_PUBLIC_BOLD_API_KEY
  const SECRET_KEY = process.env.NEXT_PUBLIC_BOLD_API_SECRET
  // orderId más simple y seguro (imita demo: sin guiones UUID)
  const orderId = `${paymentType.toUpperCase()}-${propertyId.replace(/-/g, '').slice(0, 8)}-${Date.now()}`
  const currency = "COP"
  const description =
    paymentType === "publication"
      ? `Publicacion: ${propertyTitle.substring(0, 80)}`
      : `Destacar: ${propertyTitle.substring(0, 80)}`
  const redirectUrl = `${window.location.origin}/dashboard/payment-result`

  // Generar signature (exacto como en tu demo)
  useEffect(() => {
    const generate = async () => {
      const data = `${orderId}${amount}${currency}${SECRET_KEY}`
      const encoder = new TextEncoder()
      const buffer = encoder.encode(data)
      try {
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        setSignature(hashHex)
      } catch (err) {
        console.error('Error generando signature:', err)
        setError('Error preparando pago')
        setIsLoading(false)
      }
    }
    generate()
  }, [orderId, amount]) // Dependencias mínimas

  // Insertar botón Bold (copia casi exacta del demo)
  useEffect(() => {
    if (!signature || !containerRef.current) return

    containerRef.current.innerHTML = ""

    // Cargar librería una sola vez (como en demo)
    if (!document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]')) {
      const libScript = document.createElement('script')
      libScript.src = 'https://checkout.bold.co/library/boldPaymentButton.js'
      libScript.async = true
      document.head.appendChild(libScript)
    }

    const btn = document.createElement('script')

    btn.setAttribute('data-bold-button', 'dark-S') // mismo que demo (dark-L funciona bien)
    btn.setAttribute('data-api-key', API_KEY)
    btn.setAttribute('data-order-id', orderId)
    btn.setAttribute('data-amount', amount.toString())
    btn.setAttribute('data-currency', currency)
    btn.setAttribute('data-description', description)
    btn.setAttribute('data-redirection-url', redirectUrl)
    btn.setAttribute('data-render-mode', 'embedded') // ← clave: agregado del demo
    btn.setAttribute('data-integrity-signature', signature)

    // Agregado del demo (ayuda a evitar rechazos)
    btn.setAttribute('data-customer-data', JSON.stringify({
      email: "demo@ejemplo.com",
      fullName: "Usuario Prueba",
      phone: "3101234567",
      dialCode: "+57",
      documentType: "CC",
      documentNumber: "1234567890"
    }))

    containerRef.current.appendChild(btn)

    setIsLoading(false)

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ""
    }
  }, [signature, orderId, amount, currency, description, redirectUrl])

  if (error) {
    return <p className="text-xs text-destructive">{error}</p>
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Cargando pago...</span>
        </div>
      )}
      <div ref={containerRef} className="bold-button-container min-h-[60px] flex justify-center" />
    </div>
  )
}