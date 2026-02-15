import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { orderId, amount, currency, paymentType, propertyId } = await request.json()

    if (!orderId || !amount || !currency) {
      return NextResponse.json({ error: "Faltan parametros requeridos" }, { status: 400 })
    }

    // BOLD integrity hash: SHA-256 of orderId + amount + currency + secretKey
    const secretKey = process.env.BOLD_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: "Clave secreta de BOLD no configurada" }, { status: 500 })
    }

    const dataToHash = `${orderId}${amount}${currency}${secretKey}`
    const encoder = new TextEncoder()
    const data = encoder.encode(dataToHash)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const integritySignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")

    // Create payment record in DB - COP uses whole pesos
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        property_id: propertyId || null,
        payment_type: paymentType || "publication",
        amount,
        currency,
        status: "pending",
        bold_reference: orderId,
      })

    if (paymentError) {
      console.error("[v0] Error creating payment record:", paymentError)
    }

    return NextResponse.json({ integritySignature })
  } catch (error) {
    console.error("[v0] Error generating BOLD hash:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
