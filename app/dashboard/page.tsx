import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentProperties } from "@/components/dashboard/recent-properties"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

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

  // Get user properties
  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_images(image_url, is_primary)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get wallet
  const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", user.id).single()

  const stats = {
    totalProperties: properties?.length || 0,
    activeListings: properties?.filter((p) => p.status === "for_sale" || p.status === "for_rent").length || 0,
    totalViews: properties?.reduce((sum, p) => sum + p.views, 0) || 0,
    walletBalance: wallet?.balance || 0,
  }

  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Bienvenido de nuevo, {profile?.full_name || user.email}</p>
        </div>

        <DashboardStats stats={stats} />
        <RecentProperties properties={properties || []} />
      </div>
    </DashboardLayout>
  )
}
