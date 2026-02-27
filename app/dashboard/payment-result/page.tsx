"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import Link from "next/link"

type PaymentState = "loading" | "approved" | "rejected" | "pending" | "error"

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<PaymentState>("loading")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentType, setPaymentType] = useState<string | null>(null)

  useEffect(() => {
    const boldOrderId = searchParams.get("bold-order-id") || searchParams.get("order-id")
    const boldTxStatus = searchParams.get("bold-tx-status") || searchParams.get("status")

    console.log("[PaymentResult] URL params:", {
      boldOrderId,
      boldTxStatus,
      allParams: Object.fromEntries(searchParams.entries()),
    })

    setOrderId(boldOrderId)

    // Detect payment type from orderId prefix
    if (boldOrderId) {
      if (boldOrderId.startsWith("FEATURED-")) {
        setPaymentType("featured")
      } else if (boldOrderId.startsWith("PUBLICATION-")) {
        setPaymentType("publication")
      }
    }

    if (!boldOrderId) {
      console.error("[PaymentResult] No order ID found in URL params")
      setState("error")
      return
    }

    const processResult = async () => {
      try {
        console.log("[PaymentResult] Calling verify-payment API...")
        const response = await fetch("/api/bold/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: boldOrderId,
            status: boldTxStatus === "approved" ? "approved" : boldTxStatus === "rejected" ? "rejected" : "pending",
            transaction_id: searchParams.get("bold-tx-id") || null,
            payment_method: searchParams.get("bold-payment-method") || null,
          }),
        })

        const data = await response.json()
        console.log("[PaymentResult] verify-payment response:", { status: response.status, data })

        if (response.ok) {
          // Use the payment_type returned by API if available
          if (data.payment_type) {
            setPaymentType(data.payment_type)
          }

          if (boldTxStatus === "approved") {
            setState("approved")
          } else if (boldTxStatus === "rejected") {
            setState("rejected")
          } else {
            setState("pending")
          }
        } else {
          console.error("[PaymentResult] API error:", data)
          // Even if API fails, show the correct status to the user
          setState(boldTxStatus === "approved" ? "approved" : boldTxStatus === "rejected" ? "rejected" : "pending")
        }
      } catch (err) {
        console.error("[PaymentResult] Error processing payment result:", err)
        setState(boldTxStatus === "approved" ? "approved" : "error")
      }
    }

    processResult()
  }, [searchParams])

  const approvedDescription = paymentType === "featured"
    ? "Tu pago ha sido procesado correctamente. Tu propiedad ahora esta destacada y aparecera en las primeras posiciones durante 30 dias."
    : "Tu pago ha sido procesado correctamente. Tu propiedad ya esta publicada y visible para todos."

  const pendingDescription = paymentType === "featured"
    ? "Tu pago esta siendo procesado. Te notificaremos cuando se confirme y tu propiedad sera destacada automaticamente."
    : "Tu pago esta siendo procesado. Te notificaremos cuando se confirme y tu propiedad sera publicada automaticamente."

  const configs = {
    loading: {
      icon: <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />,
      title: "Procesando tu pago...",
      description: "Por favor espera mientras confirmamos tu transaccion.",
      color: "text-muted-foreground",
    },
    approved: {
      icon: <CheckCircle className="h-16 w-16 text-green-600" />,
      title: paymentType === "featured" ? "Propiedad Destacada" : "Pago Exitoso",
      description: approvedDescription,
      color: "text-green-600",
    },
    rejected: {
      icon: <XCircle className="h-16 w-16 text-destructive" />,
      title: "Pago Rechazado",
      description: "Tu pago no pudo ser procesado. Por favor intenta nuevamente con otro metodo de pago.",
      color: "text-destructive",
    },
    pending: {
      icon: <Clock className="h-16 w-16 text-amber-500" />,
      title: "Pago Pendiente",
      description: pendingDescription,
      color: "text-amber-500",
    },
    error: {
      icon: <XCircle className="h-16 w-16 text-destructive" />,
      title: "Error",
      description: "No pudimos procesar la informacion del pago. Contacta soporte si el problema persiste.",
      color: "text-destructive",
    },
  }

  const config = configs[state]

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center gap-6">
            {config.icon}

            <div className="space-y-2">
              <h1 className={`text-2xl font-bold ${config.color}`}>
                {config.title}
              </h1>
              <p className="text-muted-foreground">
                {config.description}
              </p>
              {orderId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Referencia: {orderId}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 w-full mt-4">
              {state === "approved" && (
                <Button asChild className="bg-accent hover:bg-accent/90 text-white">
                  <Link href="/properties">
                    Ver Propiedades Publicadas
                  </Link>
                </Button>
              )}
              <Button asChild variant={state === "approved" ? "outline" : "default"} className={state === "approved" ? "bg-transparent" : "bg-accent hover:bg-accent/90 text-white"}>
                <Link href="/dashboard/properties">
                  Ir a Mis Propiedades
                </Link>
              </Button>
              {(state === "rejected" || state === "error") && (
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/dashboard/properties">
                    Intentar de Nuevo
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center gap-6">
                <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">Cargando...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  )
}
