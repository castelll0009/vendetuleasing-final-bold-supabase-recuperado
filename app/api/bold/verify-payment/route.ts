import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    console.log("[verify-payment] ========== INICIANDO ==========")
    const { order_id, status, property_id: providedPropertyId } = await request.json()

    console.log("[verify-payment] Parámetros recibidos:", { order_id, status, property_id: providedPropertyId })

    if ((!order_id && !providedPropertyId) || !status) {
      console.error("[verify-payment] ERROR: Faltan campos requeridos")
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Mapear estado de Bold
    const mappedStatus = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "cancelled"
    console.log("[verify-payment] Status mapeado:", { original: status, mapped: mappedStatus })

    // Determinar propertyId: directamente, o extraerlo del order_id formato "PREFIX-<8chars>-<timestamp>"
    let propertyId = providedPropertyId
    let paymentType = "publication"

    if (!propertyId && order_id) {
      const parts = order_id.split("-")
      if (parts.length >= 2) {
        paymentType = parts[0] === "FEATURED" ? "featured" : "publication"
        propertyId = parts[1] // los primeros 8 caracteres del UUID
        console.log("[verify-payment] Extraído del order_id:", { propertyId, paymentType })
      }
    }

    if (!propertyId) {
      console.error("[verify-payment] ERROR: No se pudo determinar propertyId")
      return NextResponse.json({ error: "Invalid order_id or missing property_id" }, { status: 400 })
    }

    // Si status es "approved", actualizar propiedad
    if (mappedStatus === "approved") {
      console.log("[verify-payment] Status aprobado, actualizando propiedad:", propertyId)

      if (paymentType === "publication") {
        console.log("[verify-payment] Tipo: publication → Publicando...")
        const { data: propData, error: propError } = await supabase
          .from("properties")
          .update({
            publication_status: "published",
            bold_payment_status: "approved",
            paid_at: new Date().toISOString(),
            payment_reference: order_id,
            updated_at: new Date().toISOString(),
          })
          .ilike("id", `${propertyId}%`)
          .select("*")

        if (propError) {
          console.error("[verify-payment] ❌ ERROR al publicar:", propError)
        } else {
          console.log("[verify-payment] ✅ Propiedad publicada:", propData)
        }
      } else if (paymentType === "featured") {
        console.log("[verify-payment] Tipo: featured → Destacando...")
        const thirtyDaysLater = new Date()
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

        const { data: propData, error: propError } = await supabase
          .from("properties")
          .update({
            is_featured_paid: true,
            featured: true,
            featured_until: thirtyDaysLater.toISOString(),
            featured_payment_reference: order_id,
            updated_at: new Date().toISOString(),
          })
          .ilike("id", `${propertyId}%`)
          .select("*")

        if (propError) {
          console.error("[verify-payment] ❌ ERROR al destacar:", propError)
        } else {
          console.log("[verify-payment] ✅ Propiedad destacada hasta:", thirtyDaysLater.toISOString(), "result:", propData)
        }
      }
    } else {
      console.log("[verify-payment] ⚠️ Status no aprobado, no se actualiza:", { mappedStatus })
    }

    console.log("[verify-payment] ========== COMPLETADO ==========")
    return NextResponse.json({ success: true, payment_type: paymentType })
  } catch (error: any) {
    console.error("[verify-payment] ❌ EXCEPCIÓN:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}