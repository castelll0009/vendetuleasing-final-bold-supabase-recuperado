import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { PropertiesTable } from "@/components/dashboard/properties-table"

export default async function DashboardPropertiesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_images(image_url, is_primary)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Propiedades</h1>
            <p className="text-muted-foreground mt-2">Gestiona todas tus propiedades publicadas</p>
          </div>
          <Button asChild className="bg-accent hover:bg-accent/90 text-white">
            <Link href="/dashboard/properties/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Propiedad
            </Link>
          </Button>
        </div>

        <PropertiesTable properties={properties || []} />
      </div>
    </DashboardLayout>
  )
}
