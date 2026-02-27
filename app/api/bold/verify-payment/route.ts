import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * POST /api/bold/verify-payment
 * Called from the payment-result page after Bold redirects the user.
 * Uses the admin client (service role) to bypass RLS.
 */
export async function POST(request: NextRequest) {
  try {
    const { order_id, status, transaction_id, payment_method } = await request.json()

    console.log("[PaymentVerify] Received:", { order_id, status, transaction_id, payment_method })

    if (!order_id || !status) {
      console.error("[PaymentVerify] Missing required fields:", { order_id, status })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Map Bold status to our internal status
    const mappedStatus =
      status === "approved" ? "approved" : status === "rejected" ? "rejected" : "cancelled"

    // Update the payment record - use maybeSingle() to handle potential duplicates gracefully
    const { data: payments, error: paymentError } = await supabase
      .from("payments")
      .update({
        status: mappedStatus,
        bold_transaction_id: transaction_id || null,
        payment_method: payment_method || null,
        updated_at: new Date().toISOString(),
      })
      .eq("bold_reference", order_id)
      .select("*")

    if (paymentError) {
      console.error("[PaymentVerify] Error updating payment:", paymentError)
      return NextResponse.json({ error: "Payment update failed" }, { status: 500 })
    }

    // Take the first matching payment record
    const payment = payments && payments.length > 0 ? payments[0] : null

    if (!payment) {
      console.error("[PaymentVerify] No payment found for bold_reference:", order_id)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    console.log("[PaymentVerify] Payment record updated:", {
      id: payment.id,
      payment_type: payment.payment_type,
      property_id: payment.property_id,
      status: mappedStatus,
    })

    // If payment approved, update the property
    if (mappedStatus === "approved" && payment.property_id) {
      if (payment.payment_type === "publication") {
        console.log("[PaymentVerify] Publishing property:", payment.property_id)
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
          console.error("[PaymentVerify] Error publishing property:", propError)
        } else {
          console.log("[PaymentVerify] Property published successfully:", payment.property_id)
        }
      } else if (payment.payment_type === "featured") {
        console.log("[PaymentVerify] Featuring property:", payment.property_id)
        const featuredUntil = new Date()
        featuredUntil.setDate(featuredUntil.getDate() + 30)

        const { error: featError } = await supabase
          .from("properties")
          .update({
            is_featured_paid: true,
            featured: true,
            featured_until: featuredUntil.toISOString(),
            featured_payment_reference: order_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.property_id)

        if (featError) {
          console.error("[PaymentVerify] Error featuring property:", featError)
        } else {
          console.log("[PaymentVerify] Property featured successfully until:", featuredUntil.toISOString())
        }
      }
    }

    return NextResponse.json({
      success: true,
      payment_type: payment.payment_type,
      property_id: payment.property_id,
      status: mappedStatus,
    })
  } catch (error) {
    console.error("[PaymentVerify] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
