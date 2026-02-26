import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Plus, ArrowRight, Building2, CheckCircle, Clock, ExternalLink } from "lucide-react"
import type { Property } from "@/lib/types/database"

interface DashboardQuickActionsProps {
  recentProperties: Array<
    Property & {
      property_images?: Array<{ image_url: string; is_primary: boolean }>
    }
  >
  stats: {
    totalProperties: number
    publishedProperties: number
    pendingPayment: number
    featuredProperties: number
  }
}

export function DashboardQuickActions({ recentProperties, stats }: DashboardQuickActionsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rapidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full justify-between bg-accent hover:bg-accent/90 text-white">
            <Link href="/dashboard/properties/new">
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Nueva Propiedad
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full justify-between bg-transparent">
            <Link href="/dashboard/properties">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Ver Mis Propiedades
              </span>
              <Badge variant="secondary" className="ml-2">{stats.totalProperties}</Badge>
            </Link>
          </Button>

          {stats.pendingPayment > 0 && (
            <Button asChild variant="outline" className="w-full justify-between bg-transparent border-amber-500/30 hover:bg-amber-500/5">
              <Link href="/dashboard/properties">
                <span className="flex items-center gap-2 text-amber-600">
                  <Clock className="h-4 w-4" />
                  Propiedades Pendientes de Pago
                </span>
                <Badge variant="secondary" className="ml-2 bg-amber-500/10 text-amber-600">{stats.pendingPayment}</Badge>
              </Link>
            </Button>
          )}

          <Button asChild variant="outline" className="w-full justify-between bg-transparent">
            <Link href="/properties">
              <span className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Ver Pagina Publica de Propiedades
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Properties Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Propiedades Recientes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/properties" className="text-accent">
              Ver todas <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentProperties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm mb-4">No tienes propiedades aun</p>
              <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-white">
                <Link href="/dashboard/properties/new">Publicar Primera Propiedad</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProperties.map((property) => {
                const primaryImage = property.property_images?.find((img) => img.is_primary)
                const imageUrl = primaryImage?.image_url || property.property_images?.[0]?.image_url
                const pubStatus = property.publication_status || "pending_payment"

                return (
                  <div
                    key={property.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={property.title} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{property.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-accent">{formatPrice(property.price)}</span>
                        {pubStatus === "published" ? (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 flex items-center gap-0.5">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Publicada
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 flex items-center gap-0.5 bg-amber-500/10 text-amber-600">
                            <Clock className="h-2.5 w-2.5" />
                            Pendiente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
