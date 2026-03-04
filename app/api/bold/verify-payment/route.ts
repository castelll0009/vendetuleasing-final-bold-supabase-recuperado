// app/api/bold/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  console.log("[verify-payment] ========== ENDPOINT INICIADO ==========")

  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "JSON inválido o vacío" }, { status: 400 })
    }

    console.log("[verify-payment] Body recibido:", body)

    let propertyId = body.property_id?.trim() || ""  // Limpieza inmediata: trim elimina espacios al inicio/fin
    const status = (body.status || "").trim().toLowerCase()
    const order_id = body.order_id || "manual"

    console.log("[verify-payment] property_id recibido crudo:", body.property_id)
    console.log("[verify-payment] property_id después de trim:", propertyId)
    console.log("[verify-payment] Longitud del ID limpio:", propertyId.length) // debe ser 36
    console.log("[verify-payment] Status limpio:", status)

    if (!propertyId) {
      return NextResponse.json({ error: "Falta property_id" }, { status: 400 })
    }

    if (propertyId.length !== 36) {
      console.warn("[verify-payment] ID con longitud incorrecta:", propertyId.length)
    }

    const supabase = createAdminClient()

    // Verificación (con log de comparación)
    console.log("[verify-payment] Buscando propiedad exactamente con:", propertyId)
    const { data: prop, error: checkError } = await supabase
      .from("properties")
      .select("id, title, publication_status, bold_payment_status")
      .eq("id", propertyId)
      .single()

    if (checkError || !prop) {
      console.error("[verify-payment] No encontrada o error:", {
        error: checkError?.message,
        details: checkError?.details,
        hint: checkError?.hint,
        receivedId: propertyId
      })

      // FORZAMOS UPDATE AUNQUE NO ENCUENTRE (temporal para debug - QUITA ESTO DESPUÉS)
      console.log("[FORCE] Saltando verificación - forzando update de todos modos")
    } else {
      console.log("[verify-payment] Propiedad encontrada:", prop.title, "Estado actual:", prop.publication_status)
    }

    // Update (siempre intentamos si status es approved)
    if (status === "approved" || status.includes("approved")) {
      console.log("[verify-payment] Actualizando propiedad...")

      const updates = {
        publication_status: "published",
        bold_payment_status: "approved",
        paid_at: new Date().toISOString(),
        payment_reference: order_id,
        updated_at: new Date().toISOString(),
      }

      console.log("[verify-payment] Aplicando estos updates:", updates)

      const { data: updated, error: updateError } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", propertyId)
        .select()

      if (updateError) {
        console.error("[verify-payment] ERROR SUPABASE:", updateError.message, updateError.details)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      if (!updated || updated.length === 0) {
        console.error("[verify-payment] 0 filas afectadas - ID NO COINCIDE o no existe")
        return NextResponse.json({
          error: "No se actualizó ninguna fila (ID no coincide)",
          receivedId: propertyId,
          length: propertyId.length
        }, { status: 404 })
      }

      console.log("[verify-payment] ¡ÉXITO! Actualizada:", updated[0].id)
      console.log("[verify-payment] Nuevo estado:", updated[0].publication_status)

      return NextResponse.json({
        success: true,
        message: "Propiedad publicada correctamente",
        updated: updated[0]
      })
    }

    return NextResponse.json({ success: true, message: "No se requería actualización" })
  } catch (err: any) {
    console.error("[verify-payment] EXCEPCIÓN:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}