import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, status, transaction_id, payment_method } = body

    console.log("[BoldWebhook] ========== INICIANDO ==========");
    console.log("[BoldWebhook] Parámetros recibidos:", { order_id, status, transaction_id, payment_method })

    if (!order_id || !status) {
      console.error("[BoldWebhook] ERROR: Faltan campos", { order_id: !!order_id, status: !!status });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[BoldWebhook] Creando admin client...");
    const supabase = createAdminClient()
    console.log("[BoldWebhook] Admin client creado ✅")

    // Mapear estado
    const mappedStatus =
      status === "approved"
        ? "approved"
        : status === "rejected"
          ? "rejected"
          : "cancelled";
    console.log("[BoldWebhook] Status mapeado:", { original: status, mapped: mappedStatus });

    // Buscar y actualizar pago
    console.log("[BoldWebhook] Buscando pago con bold_reference:", order_id);
    let payments: any = null
    let paymentError: any = null
    try {
      const res = await supabase
        .from("payments")
        .update({
          status: mappedStatus,
          bold_transaction_id: transaction_id || null,
          payment_method: payment_method || null,
          updated_at: new Date().toISOString(),
        })
        .eq("bold_reference", order_id)
        .select("*");
      payments = res.data
      paymentError = res.error
    } catch (e) {
      paymentError = e
    }

    if (paymentError) {
      console.error("[BoldWebhook] ⚠️ No se pudo actualizar payments (seguir):", paymentError);
    }

    console.log("[BoldWebhook] ✅ Pagos encontrados/actualizados:", payments?.length || 0);
    if (payments && payments.length > 0) {
      console.log("[BoldWebhook] Primer registro:", payments[0]);
    }

    const payment = payments && payments.length > 0 ? payments[0] : null;

    if (!payment) {
      console.error("[BoldWebhook] ERROR: No se encontró pago para bold_reference:", order_id);
      // Fallback: actualizar propiedad directamente si es posible
      const pieces = order_id.split("-")
      const prefix = pieces.shift() || ""
      const ts = pieces.pop() || ""
      const idPrefix = pieces.join("-")
      console.log("[BoldWebhook] Intentando fallback con prefijo:", idPrefix)

      if (status === "approved" && idPrefix) {
        let updates: any = {}
        if (prefix === "PUBLICATION") {
          updates = {
            publication_status: "published",
            bold_payment_status: "approved",
            paid_at: new Date().toISOString(),
            payment_reference: order_id,
            updated_at: new Date().toISOString(),
          }
        } else if (prefix === "FEATURED") {
          const featuredUntil = new Date()
          featuredUntil.setDate(featuredUntil.getDate() + 30)
          updates = {
            is_featured_paid: true,
            featured: true,
            featured_until: featuredUntil.toISOString(),
            featured_payment_reference: order_id,
            updated_at: new Date().toISOString(),
          }
        }

        const { data: propData, error: propError } = await supabase
          .from("properties")
          .update(updates)
          .ilike("id", `${idPrefix}%`)
          .select("id")
          .limit(1)

        if (propError) {
          console.error("[BoldWebhook] ❌ Fallback error al actualizar propiedad:", propError)
        } else if (propData && propData.length > 0) {
          console.log("[BoldWebhook] ✅ Fallback propiedad actualizada:", propData[0])
        } else {
          console.warn("[BoldWebhook] Fallback no encontró ninguna propiedad con ese prefijo")
        }
      }

      // Continuamos de todas formas (webhook es async)
      return NextResponse.json({ success: true })
    }

    console.log("[BoldWebhook] ✅ Pago encontrado:", {
      id: payment.id,
      property_id: payment.property_id,
      payment_type: payment.payment_type,
      status: payment.status,
    });

    if (mappedStatus === "approved" && payment.property_id) {
      console.log("[BoldWebhook] Status aprobado, actualizando propiedad...", {
        propertyId: payment.property_id,
        paymentType: payment.payment_type,
      });

      if (payment.payment_type === "publication") {
        console.log("[BoldWebhook] Tipo: publication → Publicando...");
        const { data: propData, error: propError } = await supabase
          .from("properties")
          .update({
            publication_status: "published",
            bold_payment_status: "approved",
            paid_at: new Date().toISOString(),
            payment_reference: order_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.property_id)
          .select("*")

        if (propError) {
          console.error("[BoldWebhook] ❌ ERROR al publicar:", propError);
        } else {
          console.log("[BoldWebhook] ✅ Propiedad publicada:", payment.property_id, "result:", propData)
        }
      } else if (payment.payment_type === "featured") {
        console.log("[BoldWebhook] Tipo: featured → Destacando...");
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
          .eq("id", payment.property_id)
          .select("*")

        if (propError) {
          console.error("[BoldWebhook] ❌ ERROR al destacar:", propError);
        } else {
          console.log("[BoldWebhook] ✅ Propiedad destacada hasta:", thirtyDaysLater.toISOString(), "result:", propData)
        }
      }
    } else {
      console.log("[BoldWebhook] ⚠️ No cumple condiciones para actualizar propiedad:", {
        statusAprobado: mappedStatus === "approved",
        tienePropertyId: !!payment?.property_id,
      });
    }

    console.log("[BoldWebhook] ========== COMPLETADO ==========");
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[BoldWebhook] ❌ EXCEPCIÓN:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      fullError: error,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}