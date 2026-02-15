import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Eye, Edit, Trash2 } from "lucide-react"
import { Building2 } from "lucide-react"
import type { Property } from "@/lib/types/database"

interface RecentPropertiesProps {
  properties: Array<
    Property & {
      property_images?: Array<{ image_url: string; is_primary: boolean }>
    }
  >
}

export function RecentProperties({ properties }: RecentPropertiesProps) {
  const recentProperties = properties.slice(0, 5)

  const statusLabels = {
    for_sale: "En Venta",
    for_rent: "En Renta",
    sold: "Vendida",
    rented: "Rentada",
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (recentProperties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Propiedades Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tienes propiedades publicadas aún</p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-white">
              <Link href="/dashboard/properties/new">Publicar Primera Propiedad</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Propiedades Recientes</CardTitle>
        <Button variant="outline" asChild className="bg-transparent">
          <Link href="/dashboard/properties">Ver Todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProperties.map((property) => {
            const primaryImage = property.property_images?.find((img) => img.is_primary)
            const imageUrl = primaryImage?.image_url || property.property_images?.[0]?.image_url

            return (
              <div
                key={property.id}
                className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                  {imageUrl ? (
                    <Image src={imageUrl || "/placeholder.svg"} alt={property.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{property.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{property.city}</p>
                    </div>
                    <Badge variant="secondary">{statusLabels[property.status]}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm font-semibold text-accent">{formatPrice(property.price)}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{property.views}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/properties/${property.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
