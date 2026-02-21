"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Loader2 } from "lucide-react"

interface BoldPaymentButtonProps {
  propertyId: string
  propertyTitle: string
  amount: number // COP whole pesos, e.g. 50000
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
  const hasMounted = useRef(false)

  const initBoldButton = useCallback(async () => {
    if (!containerRef.current || hasMounted.current) return
    hasMounted.current = true

    try {
      const orderId = `${paymentType}_${propertyId}_${Date.now()}`
      const currency = "COP"

      // 1. Generate integrity hash from our server
      const hashResponse = await fetch("/api/bold/generate-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount,
          currency,
          paymentType,
          propertyId,
        }),
      })

      if (!hashResponse.ok) {
        throw new Error("Error al generar firma de integridad")
      }

      const { integritySignature } = await hashResponse.json()

      // 2. Build redirect URL for after payment
      const redirectUrl = `${window.location.origin}/dashboard/payment-result`
      const description =
        paymentType === "publication"
          ? `Publicacion: ${propertyTitle.substring(0, 80)}`
          : `Destacar: ${propertyTitle.substring(0, 80)}`

      // 3. Clear previous content
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }

      // 4. Create the BOLD <script> with data attributes (official integration)
      //    Per BOLD docs for React: include src in the script tag itself
      const boldScript = document.createElement("script")
      boldScript.setAttribute("src", "https://checkout.bold.co/library/boldPaymentButton.js")
      boldScript.setAttribute("data-bold-button", "dark-S")
      boldScript.setAttribute("data-api-key", process.env.NEXT_PUBLIC_BOLD_API_KEY || "")
      boldScript.setAttribute("data-order-id", orderId)
      boldScript.setAttribute("data-currency", currency)
      boldScript.setAttribute("data-amount", amount.toString())
      boldScript.setAttribute("data-integrity-signature", integritySignature)
      boldScript.setAttribute("data-redirection-url", redirectUrl)
      boldScript.setAttribute("data-description", description)

      // 5. Append to container - BOLD library will render the button here
      containerRef.current?.appendChild(boldScript)

      setIsLoading(false)
    } catch (err) {
      console.error("[v0] Error initializing BOLD button:", err)
      setError("Error al cargar boton de pago")
      setIsLoading(false)
    }
  }, [propertyId, propertyTitle, amount, paymentType])

  useEffect(() => {
    initBoldButton()

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
      hasMounted.current = false
    }
  }, [initBoldButton])

  if (error) {
    return (
      <p className="text-xs text-destructive">{error}</p>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Cargando pago...</span>
        </div>
      )}
      <div ref={containerRef} className="bold-button-container" />
    </div>
  )
}
