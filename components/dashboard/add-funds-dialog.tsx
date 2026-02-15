"use client"
//no puedo
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AddFundsDialogProps {
  walletId: string
  userId: string
}

export function AddFundsDialog({ walletId, userId }: AddFundsDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddFunds = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Por favor ingresa un monto válido")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // Get current wallet balance
      const { data: wallet } = await supabase.from("wallets").select("balance").eq("id", walletId).single()

      if (!wallet) throw new Error("Wallet not found")

      const newBalance = wallet.balance + Number.parseFloat(amount)

      // Update wallet balance
      const { error: walletError } = await supabase.from("wallets").update({ balance: newBalance }).eq("id", walletId)

      if (walletError) throw walletError

      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: userId,
        wallet_id: walletId,
        amount: Number.parseFloat(amount),
        transaction_type: "deposit",
        transaction_status: "completed",
        description: "Depósito de fondos",
      })

      if (transactionError) throw transactionError

      setIsOpen(false)
      setAmount("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error adding funds:", error)
      alert("Error al agregar fondos")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Fondos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Fondos</DialogTitle>
          <DialogDescription>Ingresa el monto que deseas agregar a tu billetera</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="amount">Monto (COP)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1000"
            />
          </div>
          <Button
            onClick={handleAddFunds}
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            {isSubmitting ? "Procesando..." : "Agregar Fondos"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
