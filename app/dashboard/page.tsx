import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user properties with publication status
  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_images(image_url, is_primary)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const allProps = properties || []

  const stats = {
    totalProperties: allProps.length,
    publishedProperties: allProps.filter((p) => p.publication_status === "published").length,
    pendingPayment: allProps.filter((p) => p.publication_status === "pending_payment" || !p.publication_status).length,
    featuredProperties: allProps.filter(
      (p) => p.is_featured_paid && p.featured_until && new Date(p.featured_until) > new Date()
    ).length,
  }

  // Get 3 most recent properties for the quick view
  const recentProperties = allProps.slice(0, 3)

  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Bienvenido de nuevo, {profile?.full_name || user.email}</p>
        </div>

        <DashboardStats stats={stats} />
        <DashboardQuickActions recentProperties={recentProperties} stats={stats} />
      </div>
    </DashboardLayout>
  )
}
