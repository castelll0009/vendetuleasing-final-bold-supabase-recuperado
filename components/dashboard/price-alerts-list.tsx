"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Trash2, BellOff } from "lucide-react"
import type { PriceAlert } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PriceAlertsListProps {
  alerts: PriceAlert[]
}

export function PriceAlertsList({ alerts: initialAlerts }: PriceAlertsListProps) {
  const router = useRouter()
  const [alerts, setAlerts] = useState(initialAlerts)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const propertyTypeLabels: Record<string, string> = {
    house: "Casa",
    apartment: "Apartamento",
    office: "Oficina",
    villa: "Villa",
    townhome: "Townhome",
    bungalow: "Bungalow",
    condo: "Condominio",
    land: "Terreno",
    commercial: "Comercial",
  }

  const handleToggleActive = async (alertId: string, currentActive: boolean) => {
    const supabase = createClient()

    const { error } = await supabase.from("price_alerts").update({ active: !currentActive }).eq("id", alertId)

    if (error) {
      console.error("[v0] Error toggling alert:", error)
      alert("Error al actualizar la alerta")
    } else {
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, active: !currentActive } : a)))
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase.from("price_alerts").delete().eq("id", deleteId)

    if (error) {
      console.error("[v0] Error deleting alert:", error)
      alert("Error al eliminar la alerta")
    } else {
      setAlerts(alerts.filter((a) => a.id !== deleteId))
      router.refresh()
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">No tienes alertas configuradas</p>
            <p className="text-muted-foreground mb-6">
              Crea una alerta para recibir notificaciones sobre propiedades que te interesen
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {alerts.map((alert) => (
          <Card key={alert.id} className={!alert.active ? "opacity-60" : ""}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                {alert.active ? (
                  <Bell className="h-5 w-5 text-accent" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
                <CardTitle className="text-lg">
                  {alert.property_type ? propertyTypeLabels[alert.property_type] : "Todas las propiedades"}
                </CardTitle>
              </div>
              <Badge variant={alert.active ? "default" : "secondary"} className={alert.active ? "bg-accent" : ""}>
                {alert.active ? "Activa" : "Inactiva"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                {alert.city && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ciudad:</span>
                    <span className="font-medium">{alert.city}</span>
                  </div>
                )}
                {(alert.min_price || alert.max_price) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rango de precio:</span>
                    <span className="font-medium">
                      {alert.min_price ? formatCurrency(alert.min_price) : "Sin mínimo"} -{" "}
                      {alert.max_price ? formatCurrency(alert.max_price) : "Sin máximo"}
                    </span>
                  </div>
                )}
                {(alert.min_bedrooms || alert.max_bedrooms) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Habitaciones:</span>
                    <span className="font-medium">
                      {alert.min_bedrooms || "0"} - {alert.max_bedrooms || "∞"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleToggleActive(alert.id, alert.active)}
                >
                  {alert.active ? "Desactivar" : "Activar"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(alert.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la alerta de precios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
