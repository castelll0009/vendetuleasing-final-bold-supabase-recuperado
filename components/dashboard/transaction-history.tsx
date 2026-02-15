import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react"
import type { Transaction } from "@/lib/types/database"

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const transactionTypeLabels = {
    deposit: "Depósito",
    withdrawal: "Retiro",
    property_payment: "Pago de Propiedad",
    subscription: "Suscripción",
  }

  const transactionStatusLabels = {
    pending: "Pendiente",
    completed: "Completado",
    failed: "Fallido",
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "failed":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay transacciones aún</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Transacciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const isDeposit = transaction.transaction_type === "deposit"

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${isDeposit ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    {isDeposit ? (
                      <ArrowDownRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transactionTypeLabels[transaction.transaction_type]}</p>
                    <p className="text-sm text-muted-foreground">{transaction.description || "Sin descripción"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(transaction.created_at).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-semibold ${isDeposit ? "text-green-500" : "text-red-500"}`}>
                    {isDeposit ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <Badge variant="secondary" className={getStatusColor(transaction.transaction_status)}>
                    {transactionStatusLabels[transaction.transaction_status]}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
