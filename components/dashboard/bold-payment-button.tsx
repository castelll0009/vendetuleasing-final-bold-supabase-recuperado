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
  // keep orderId stable across renders so signature always matches
  const [orderId] = useState(
    () =>
      `${paymentType.toUpperCase()}-${propertyId.replace(/-/g, "").slice(0, 8)}-${Date.now()}`
  )

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string>("")

  const currency = "COP"
  const description =
    paymentType === "publication"
      ? `Publicacion: ${propertyTitle.substring(0, 80)}`
      : `Destacar: ${propertyTitle.substring(0, 80)}`
  const redirectUrl = `${window.location.origin}/dashboard/payment-result`

  // Fetch signature once using stable orderId
  useEffect(() => {
    if (typeof window === "undefined") return

    const fetchSignature = async () => {
      try {
        console.log("[BoldButton] ========== INICIO ==========");
        console.log("[BoldButton] Datos del botón:", {
          propertyId,
          amount,
          paymentType,
          orderId,
          currency,
        });
        const payload = {
          orderId,
          amount: Number(amount),
          currency,
          paymentType,
          propertyId,
        };
        console.log("[BoldButton] Payload a generate-hash:", payload);
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

        console.log("[BoldButton] Status respuesta:", res.status);
        console.log("[BoldButton] Respuesta JSON:", data);

        if (!res.ok) {
          console.error("[BoldButton] ❌ Error del servidor:", data);
          throw new Error(data.error || "Error obteniendo firma");
        }

        console.log("[BoldButton] ✅ Firma recibida:", data.integritySignature);
        setSignature(data.integritySignature)
      } catch (err: any) {
        console.error("[BoldButton] ❌ EXCEPCIÓN:", err.message);
        setError("Error preparando pago. Intenta recargar la página.");
        setIsLoading(false);
      }
    }

    fetchSignature()
  }, [orderId, amount, currency, paymentType, propertyId])

  // Render botón
  useEffect(() => {
    if (!signature || !containerRef.current) {
      console.log("[BoldButton] No renderizando botón aún:", {
        tieneSignature: !!signature,
        tieneContainer: !!containerRef.current,
      });
      return;
    }

    console.log("[BoldButton] ========== INYECTANDO BOTÓN ==========");
    containerRef.current.innerHTML = ""

    if (!document.querySelector('script[src*="boldPaymentButton.js"]')) {
      console.log("[BoldButton] Cargando librería de Bold...");
      const script = document.createElement('script')
      script.src = 'https://checkout.bold.co/library/boldPaymentButton.js'
      script.async = true
      document.head.appendChild(script)
    }

    console.log("[BoldButton] Creando script del botón con atributos:");
    console.log({
      "data-bold-button": "dark-L",
      "data-api-key": process.env.NEXT_PUBLIC_BOLD_API_KEY,
      "data-order-id": orderId,
      "data-amount": amount.toString(),
      "data-currency": currency,
      "data-description": description,
      "data-redirection-url": redirectUrl,
      "data-render-mode": "embedded",
      "data-integrity-signature": signature,
    });

    const btn = document.createElement('script')
    btn.setAttribute('data-bold-button', 'dark-L')
    btn.setAttribute('data-api-key', process.env.NEXT_PUBLIC_BOLD_API_KEY || '')
    btn.setAttribute('data-order-id', orderId)
    btn.setAttribute('data-amount', amount.toString())
    btn.setAttribute('data-currency', currency)
    btn.setAttribute('data-description', description)
    btn.setAttribute('data-redirection-url', redirectUrl)
    btn.setAttribute('data-render-mode', 'embedded')
    btn.setAttribute('data-integrity-signature', signature)

    containerRef.current.appendChild(btn)
    console.log("[BoldButton] ✅ Botón inyectado exitosamente");
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