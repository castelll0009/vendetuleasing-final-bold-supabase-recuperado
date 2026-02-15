import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PropertyForm } from "@/components/dashboard/property-form"

export default async function NewPropertyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Nueva Propiedad</h1>
          <p className="text-muted-foreground mt-2">Completa la información para publicar tu propiedad</p>
        </div>

        <PropertyForm userId={user.id} />
      </div>
    </DashboardLayout>
  )
}
