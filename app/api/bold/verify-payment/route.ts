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

    if (!order_id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Map Bold status to our internal status
    const mappedStatus =
      status === "approved" ? "approved" : status === "rejected" ? "rejected" : "cancelled"

    // Update the payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        status: mappedStatus,
        bold_transaction_id: transaction_id || null,
        payment_method: payment_method || null,
        updated_at: new Date().toISOString(),
      })
      .eq("bold_reference", order_id)
      .select("*")
      .single()

    if (paymentError) {
      console.error("[v0] Error updating payment:", paymentError)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // If payment approved, update the property
    if (mappedStatus === "approved" && payment.property_id) {
      if (payment.payment_type === "publication") {
        const { error: propError } = await supabase
          .from("properties")
          .update({
            publication_status: "published",
            payment_reference: order_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.property_id)

        if (propError) {
          console.error("[v0] Error publishing property:", propError)
        }
      } else if (payment.payment_type === "featured") {
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
          console.error("[v0] Error featuring property:", featError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      payment_type: payment.payment_type,
      property_id: payment.property_id,
    })
  } catch (error) {
    console.error("[v0] Verify payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
