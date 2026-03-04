'use client'

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

interface BoldPaymentButtonProps {
  propertyId: string
  propertyTitle: string
  amount: number
  paymentType: "publication" | "featured"
}

export function BoldPaymentButton({
  propertyId,
  propertyTitle,
  amount,
  paymentType,
}: BoldPaymentButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasForcedReload = useRef(false) // evita múltiples recargas del script

  const [orderId] = useState(
    () => `${paymentType.toUpperCase()}-${propertyId.replace(/-/g, "").slice(0, 8)}-${Date.now()}`
  )

  console.log("[BoldButton] Generado orderId:", orderId)

  useEffect(() => {
    try {
      localStorage.setItem(`bold_order_prop_${orderId}`, propertyId)
    } catch {}
  }, [orderId, propertyId])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string>("")

  const currency = "COP"
  const description =
    paymentType === "publication"
      ? `Publicacion: ${propertyTitle.substring(0, 80)}`
      : `Destacar: ${propertyTitle.substring(0, 80)}`
  const redirectUrl = `${window.location.origin}/dashboard/payment-result`

  // Fetch de firma (sin cambios)
  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const res = await fetch("/api/bold/generate-hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            amount: Number(amount),
            currency,
            paymentType,
            propertyId,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Error obteniendo firma")
        }

        setSignature(data.integritySignature)
      } catch (err: any) {
        console.error("[BoldButton] Error firma:", err)
        setError("Error preparando pago. Intenta recargar.")
        setIsLoading(false)
      }
    }

    fetchSignature()
  }, [orderId, amount, currency, paymentType, propertyId])

  // Insertar botón + forzar re-carga del script Bold (una sola vez)
  useEffect(() => {
    if (!signature || !containerRef.current) return

    containerRef.current.innerHTML = ""

    const btn = document.createElement("script")
    btn.setAttribute("data-bold-button", "dark-L")
    btn.setAttribute("data-api-key", process.env.NEXT_PUBLIC_BOLD_API_KEY || "")
    btn.setAttribute("data-order-id", orderId)
    btn.setAttribute("data-amount", amount.toString())
    btn.setAttribute("data-currency", currency)
    btn.setAttribute("data-description", description)
    btn.setAttribute("data-redirection-url", redirectUrl)
    btn.setAttribute("data-render-mode", "embedded")
    btn.setAttribute("data-integrity-signature", signature)

    containerRef.current.appendChild(btn)

    // Forzar re-escaneo de Bold (solo una vez por página)
    setTimeout(() => {
      if (hasForcedReload.current) return
      hasForcedReload.current = true

      // Remover y re-agregar el script global de Bold
      const existing = document.querySelectorAll('script[src*="boldPaymentButton.js"]')
      existing.forEach((s) => s.remove())

      const newScript = document.createElement("script")
      newScript.src = "https://checkout.bold.co/library/boldPaymentButton.js"
      newScript.async = true
      document.head.appendChild(newScript)

      console.log("[BoldButton] Script de Bold recargado para detectar botones dinámicos")
    }, 400) // delay para asegurar que el <script> del botón ya esté en DOM

    setIsLoading(false)

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ""
    }
  }, [signature, orderId, amount, currency, description, redirectUrl])

  if (error) return <p className="text-xs text-destructive">{error}</p>

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