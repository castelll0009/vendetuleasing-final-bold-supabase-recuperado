import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    console.log("[simulate-verify] ========== INICIANDO ==========")
    const { propertyId, paymentType } = await request.json()

    console.log("[simulate-verify] Payload recibido:", { propertyId, paymentType })

    if (!propertyId || !paymentType) {
      console.error("[simulate-verify] ERROR: faltan campos requeridos")
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Si el usuario pasa un prefijo (8 chars), permitimos búsqueda por ilike
    const isPrefix = propertyId.length < 20

    if (paymentType === "publication") {
      console.log("[simulate-verify] Simulando publicación para:", { propertyId, isPrefix })
      const updates = {
        publication_status: "published",
        bold_payment_status: "approved",
        paid_at: new Date().toISOString(),
        payment_reference: `SIMULATED-PUBLICATION-${propertyId}-${Date.now()}`,
        updated_at: new Date().toISOString(),
      }

      // Build query
      let query = supabase.from("properties").update(updates).select("*")
      query = isPrefix ? query.ilike("id", `${propertyId}%`) : query.eq("id", propertyId)

      const { data, error } = await query.limit(1)
      if (error) {
        console.error("[simulate-verify] ❌ Error al actualizar propiedad:", error)
        return NextResponse.json({ error: "Update failed", details: error }, { status: 500 })
      }

      console.log("[simulate-verify] ✅ Propiedad actualizada:", data)
      return NextResponse.json({ success: true, result: data })
    }

    if (paymentType === "featured") {
      console.log("[simulate-verify] Simulando pago featured para:", { propertyId, isPrefix })
      const thirtyDaysLater = new Date()
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

      const updates = {
        is_featured_paid: true,
        featured: true,
        featured_until: thirtyDaysLater.toISOString(),
        featured_payment_reference: `SIMULATED-FEATURED-${propertyId}-${Date.now()}`,
        updated_at: new Date().toISOString(),
      }

      let query = supabase.from("properties").update(updates).select("*")
      query = isPrefix ? query.ilike("id", `${propertyId}%`) : query.eq("id", propertyId)

      const { data, error } = await query.limit(1)
      if (error) {
        console.error("[simulate-verify] ❌ Error al actualizar propiedad (featured):", error)
        return NextResponse.json({ error: "Update failed", details: error }, { status: 500 })
      }

      console.log("[simulate-verify] ✅ Propiedad destacada:", data)
      return NextResponse.json({ success: true, result: data })
    }

    console.error("[simulate-verify] ERROR: paymentType desconocido:", paymentType)
    return NextResponse.json({ error: "Invalid paymentType" }, { status: 400 })
  } catch (error: any) {
    console.error("[simulate-verify] EXCEPCIÓN:", error)
    return NextResponse.json({ error: "Internal error", details: error?.message || error }, { status: 500 })
  }
}
