import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PriceAlertsList } from "@/components/dashboard/price-alerts-list"
import { CreateAlertDialog } from "@/components/dashboard/create-alert-dialog"

export default async function AlertsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: alerts } = await supabase
    .from("price_alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Alertas de Precios</h1>
            <p className="text-muted-foreground mt-2">
              Recibe notificaciones cuando haya propiedades que coincidan con tus criterios
            </p>
          </div>
          <CreateAlertDialog userId={user.id} />
        </div>

        <PriceAlertsList alerts={alerts || []} />
      </div>
    </DashboardLayout>
  )
}
