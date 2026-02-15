import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { WalletBalance } from "@/components/dashboard/wallet-balance"
import { TransactionHistory } from "@/components/dashboard/transaction-history"
import { AddFundsDialog } from "@/components/dashboard/add-funds-dialog"

export default async function WalletPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", user.id).single()

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billetera</h1>
            <p className="text-muted-foreground mt-2">Gestiona tu saldo y transacciones</p>
          </div>
          <AddFundsDialog walletId={wallet?.id || ""} userId={user.id} />
        </div>

        <WalletBalance balance={wallet?.balance || 0} />
        <TransactionHistory transactions={transactions || []} />
      </div>
    </DashboardLayout>
  )
}
