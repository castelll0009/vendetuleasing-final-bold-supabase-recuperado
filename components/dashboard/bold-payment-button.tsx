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
  const [orderId] = useState(
    () => `${paymentType.toUpperCase()}-${propertyId.replace(/-/g, '').slice(0, 8)}-${Date.now()}`
  )

  const API_KEY = process.env.NEXT_PUBLIC_BOLD_API_KEY
  const currency = "COP"
  const description =
    paymentType === "publication"
      ? `Publicacion: ${propertyTitle.substring(0, 80)}`
      : `Destacar: ${propertyTitle.substring(0, 80)}`
  const redirectUrl = typeof window !== "undefined"
    ? `${window.location.origin}/dashboard/payment-result`
    : ""

  // Get signature from server API (also creates payment record in DB)
  useEffect(() => {
    if (typeof window === "undefined") return
    let cancelled = false

    const fetchSignature = async () => {
      try {
        console.log("[v0] Fetching signature for:", { orderId, amount, currency, paymentType, propertyId })
        const response = await fetch("/api/bold/generate-hash", {
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

        const data = await response.json()

        if (!response.ok) {
          console.error("[v0] generate-hash error response:", data)
          throw new Error(data.error || "Error obteniendo firma")
        }

        if (!cancelled) {
          console.log("[v0] Signature received successfully")
          setSignature(data.integritySignature)
        }
      } catch (err) {
        console.error("[v0] Error fetching signature:", err)
        if (!cancelled) {
          setError("Error preparando pago. Intenta recargar la pagina.")
          setIsLoading(false)
        }
      }
    }
    fetchSignature()

    return () => { cancelled = true }
  }, [orderId, amount, currency, paymentType, propertyId])

  // Insert Bold button (after we have the server-generated signature)
  useEffect(() => {
    if (!signature || !containerRef.current) return

    containerRef.current.innerHTML = ""

    // Load Bold library once
    if (!document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]')) {
      const libScript = document.createElement('script')
      libScript.src = 'https://checkout.bold.co/library/boldPaymentButton.js'
      libScript.async = true
      document.head.appendChild(libScript)
    }

    const btn = document.createElement('script')

    btn.setAttribute('data-bold-button', 'dark-S')
    btn.setAttribute('data-api-key', API_KEY || '')
    btn.setAttribute('data-order-id', orderId)
    btn.setAttribute('data-amount', amount.toString())
    btn.setAttribute('data-currency', currency)
    btn.setAttribute('data-description', description)
    btn.setAttribute('data-redirection-url', redirectUrl)
    btn.setAttribute('data-render-mode', 'embedded')
    btn.setAttribute('data-integrity-signature', signature)

    containerRef.current.appendChild(btn)
    setIsLoading(false)

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ""
    }
  }, [signature, orderId, amount, currency, description, redirectUrl, API_KEY])

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
