import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, status, transaction_id, payment_method } = body

    console.log("[BoldWebhook] Received:", { order_id, status, transaction_id, payment_method })

    if (!order_id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Update the payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        status: status === "approved" ? "approved" : status === "rejected" ? "rejected" : "cancelled",
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
    if (status === "approved" && payment.property_id) {
      if (payment.payment_type === "publication") {
        await supabase
          .from("properties")
          .update({
            publication_status: "published",
            bold_payment_status: "approved",
            paid_at: new Date().toISOString(),
            payment_reference: order_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.property_id)
      } else if (payment.payment_type === "featured") {
        const featuredUntil = new Date()
        featuredUntil.setDate(featuredUntil.getDate() + 30) // 30 days featured

        await supabase
          .from("properties")
          .update({
            is_featured_paid: true,
            featured: true,
            featured_until: featuredUntil.toISOString(),
            featured_payment_reference: order_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.property_id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
