"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type PaymentState = "loading" | "approved" | "rejected" | "pending" | "error"

export default function PaymentResultPage() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<PaymentState>("loading")
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const boldOrderId = searchParams.get("bold-order-id") || searchParams.get("order-id")
    const boldTxStatus = searchParams.get("bold-tx-status") || searchParams.get("status")

    setOrderId(boldOrderId)

    if (!boldOrderId) {
      setState("error")
      return
    }

    const processResult = async () => {
      try {
        // Call the webhook to update the payment status
        const response = await fetch("/api/bold/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: boldOrderId,
            status: boldTxStatus === "approved" ? "approved" : boldTxStatus === "rejected" ? "rejected" : "pending",
            transaction_id: searchParams.get("bold-tx-id") || null,
            payment_method: searchParams.get("bold-payment-method") || null,
          }),
        })

        if (response.ok) {
          if (boldTxStatus === "approved") {
            setState("approved")
          } else if (boldTxStatus === "rejected") {
            setState("rejected")
          } else {
            setState("pending")
          }
        } else {
          // Even if webhook fails, show user the correct status
          setState(boldTxStatus === "approved" ? "approved" : boldTxStatus === "rejected" ? "rejected" : "pending")
        }
      } catch (err) {
        console.error("[v0] Error processing payment result:", err)
        setState(boldTxStatus === "approved" ? "approved" : "error")
      }
    }

    processResult()
  }, [searchParams])

  const configs = {
    loading: {
      icon: <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />,
      title: "Procesando tu pago...",
      description: "Por favor espera mientras confirmamos tu transaccion.",
      color: "text-muted-foreground",
    },
    approved: {
      icon: <CheckCircle className="h-16 w-16 text-green-600" />,
      title: "Pago Exitoso",
      description: "Tu pago ha sido procesado correctamente. Tu propiedad ha sido actualizada.",
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
      description: "Tu pago esta siendo procesado. Te notificaremos cuando se confirme.",
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
              <Button asChild className="bg-accent hover:bg-accent/90 text-white">
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
