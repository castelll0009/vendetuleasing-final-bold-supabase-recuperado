import { Card, CardContent } from "@/components/ui/card"
import { Wallet, TrendingUp, TrendingDown } from "lucide-react"

interface WalletBalanceProps {
  balance: number
}

export function WalletBalance({ balance }: WalletBalanceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Saldo Disponible</p>
              <p className="text-4xl font-bold text-foreground">{formatCurrency(balance)}</p>
              <p className="text-sm text-muted-foreground mt-2">Actualizado hace unos momentos</p>
            </div>
            <div className="bg-accent/10 p-4 rounded-full">
              <Wallet className="h-12 w-12 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/10 p-2 rounded-full">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gastos</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
