"use client"

import type React from "react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Maximize, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Property } from "@/lib/types/database"
import { useState } from "react"

interface PropertyCardProps {
  property: Property & {
    property_images?: Array<{ image_url: string; is_primary: boolean }>
    profiles?: { full_name: string | null }
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = property.property_images || []
  const imageUrl = images.length > 0 ? images[currentImageIndex]?.image_url : null

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

  const goToPreviousImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {currentImageIndex + 1}/{images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {property.featured && <Badge className="absolute left-3 top-3 bg-accent text-white">Destacada</Badge>}
          <Badge className="absolute right-3 top-3 bg-background/90 text-foreground" variant="secondary">
            {statusLabels[property.status]}
          </Badge>
        </div>

        <CardContent className="p-4">
          <div className="mb-2">
            <p className="text-2xl font-bold text-accent">
              {formatPrice(property.price)}
              {property.status === "for_rent" && (
                <span className="text-sm font-normal text-muted-foreground">/mes</span>
              )}
            </p>
          </div>

          <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-1">{property.title}</h3>

          <p className="mb-3 flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            {property.city}, {property.country}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.square_feet && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                <span>{property.square_feet} m²</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t p-4">
          <p className="text-sm text-muted-foreground">{property.property_id_code}</p>
        </CardFooter>
      </Card>
    </Link>
  )
}
