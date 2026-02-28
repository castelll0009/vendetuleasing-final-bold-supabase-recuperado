import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    console.log("[verify-payment] ========== INICIANDO ==========");
    const { order_id, status, transaction_id, payment_method } = await request.json()

    console.log("[verify-payment] Parámetros recibidos:", {
      order_id,
      status,
      transaction_id,
      payment_method,
    });

    if (!order_id || !status) {
      console.error("[verify-payment] ERROR: Faltan campos requeridos", {
        order_id: !!order_id,
        status: !!status,
      });
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    console.log("[verify-payment] Creando admin client...");
    const supabase = createAdminClient()

    // Mapear estado de Bold a nuestro formato
    const mappedStatus =
      status === "approved"
        ? "approved"
        : status === "rejected"
          ? "rejected"
          : "cancelled";
    console.log("[verify-payment] Status mapeado:", mappedStatus);

    // Buscar pago
    console.log("[verify-payment] Buscando pago con bold_reference:", order_id);
    const { data: payments, error: paymentError } = await supabase
      .from("payments")
      .update({
        status: mappedStatus,
        bold_transaction_id: transaction_id || null,
        payment_method: payment_method || null,
        updated_at: new Date().toISOString(),
      })
      .eq("bold_reference", order_id)
      .select("*");

    if (paymentError) {
      console.error("[verify-payment] ERROR al buscar/actualizar pago:", paymentError);
      return NextResponse.json({ error: "Payment update failed" }, { status: 500 })
    }

    console.log("[verify-payment] Pagos encontrados:", payments?.length || 0);
    console.log("[verify-payment] Datos completos:", payments);

    const payment = payments && payments.length > 0 ? payments[0] : null;

    if (!payment) {
      console.error("[verify-payment] ERROR: No se encontró pago para:", order_id);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    console.log("[verify-payment] ✅ Pago encontrado:", {
      id: payment.id,
      property_id: payment.property_id,
      payment_type: payment.payment_type,
      status: payment.status,
    });

    if (mappedStatus === "approved" && payment.property_id) {
      console.log("[verify-payment] Status aprobado y hay property_id, actualizando propiedad...");

      if (payment.payment_type === "publication") {
        console.log("[verify-payment] Tipo: publication → Publicando...");
        const { error: propError } = await supabase
          .from("properties")
          .update({
            publication_status: "published",
            bold_payment_status: "approved",
            paid_at: new Date().toISOString(),
            payment_reference: order_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.property_id)

        if (propError) {
          console.error("[verify-payment] ❌ ERROR al publicar:", propError);
        } else {
          console.log("[verify-payment] ✅ Propiedad publicada:", payment.property_id)
        }
      } else if (payment.payment_type === "featured") {
        console.log("[verify-payment] Tipo: featured → Destacando...");
        const thirtyDaysLater = new Date()
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

        const { error: propError } = await supabase
          .from("properties")
          .update({
            is_featured_paid: true,
            featured: true,
            featured_until: thirtyDaysLater.toISOString(),
            featured_payment_reference: order_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.property_id)

        if (propError) {
          console.error("[verify-payment] ❌ ERROR al destacar:", propError);
        } else {
          console.log("[verify-payment] ✅ Propiedad destacada hasta:", thirtyDaysLater.toISOString())
        }
      }
    } else {
      console.log("[verify-payment] ⚠️ No cumple condiciones:", {
        statusAprobado: mappedStatus === "approved",
        tienePropertyId: !!payment.property_id,
      });
    }

    console.log("[verify-payment] ========== COMPLETADO ==========");
    return NextResponse.json({ success: true, payment_type: payment.payment_type })
  } catch (error: any) {
    console.error("[verify-payment] EXCEPCIÓN:", error.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}