import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[generate-hash] ========== INICIANDO ==========");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("[generate-hash] No autenticado");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    console.log("[generate-hash] Usuario autenticado:", user.id);

    const { orderId, amount, currency, paymentType, propertyId } =
      await request.json();
    console.log("[generate-hash] Recibido desde cliente:", {
      orderId,
      amount,
      currency,
      paymentType,
      propertyId,
    });

    if (!orderId || !amount || !currency) {
      console.error("[generate-hash] Faltan parametros", {
        orderId: !!orderId,
        amount: !!amount,
        currency: !!currency,
      });
      return NextResponse.json(
        { error: "Faltan parametros requeridos" },
        { status: 400 },
      );
    }

    // BOLD integrity hash: SHA-256 of orderId + amount + currency + secretKey
    // use a server-only variable (not prefixed with NEXT_PUBLIC_)
    const secretKey = process.env.BOLD_SECRET_KEY;
    console.log("[generate-hash] secretKey presente:", !!secretKey);
    if (!secretKey) {
      console.error(
        "[generate-hash] FALLO: missing BOLD_SECRET_KEY en env"
      );
      return NextResponse.json(
        { error: "Clave secreta de BOLD no configurada" },
        { status: 500 },
      );
    }

    const dataToHash = `${orderId}${amount}${currency}${secretKey}`;
    console.log("[generate-hash] dataToHash:", dataToHash);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToHash);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const integritySignature = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    console.log("[generate-hash] integritySignature generada:", integritySignature);

    // Create payment record in DB - COP uses whole pesos
    // always insert a new row for this orderId; we rely on bold_reference uniqueness
    console.log("[generate-hash] Intentando insertar registro de pago...");
    const { error: paymentError, data: paymentData } = await supabase
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
      .select();

    if (paymentError) {
      console.error(
        "[generate-hash] ERROR al crear registro de pago:",
        paymentError
      );
      console.error("[generate-hash] Código error:", paymentError.code);
      console.error("[generate-hash] Mensaje:", paymentError.message);
    } else {
      console.log(
        "[generate-hash] ✅ Payment row creado exitosamente:",
        paymentData
      );
    }

    console.log("[generate-hash] ========== RESPONDIENDO ==========");
    return NextResponse.json({ integritySignature });
  } catch (error) {
    console.error("[generate-hash] EXCEPCIÓN:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
