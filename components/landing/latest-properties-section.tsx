"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bed, Bath, Maximize, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Este componente puede recibir propiedades reales o usar datos mock por ahora
interface LatestPropertiesSectionProps {
  properties?: Array<{
    id: string
    title: string
    price: number
    bedrooms?: number
    bathrooms?: number
    square_feet?: number
    address?: string
    city: string
    primary_image_url?: string
    status?: string
  }>
}

export function LatestPropertiesSection({ properties = [] }: LatestPropertiesSectionProps) {
  // Si no hay propiedades reales, usamos algunos ejemplos para el diseño
  const displayProperties = properties.length > 0 
    ? properties.slice(0, 6) // mostramos máximo 6 en landing
    : [
        {
          id: "1",
          title: "Apartamento moderno en el centro",
          price: 320000000,
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 95,
          address: "Calle 45 # 12-34",
          city: "Pitalito",
          primary_image_url: "/placeholder-property-1.jpg",
          status: "for_sale",
        },
        // ... puedes agregar 2-5 más para mock si quieres
      ]

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título y descripción */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Propiedades Publicadas Recientemente
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre las últimas propiedades disponibles en leasing. Encuentra tu próximo hogar o inversión.
          </p>
        </div>

        {/* Grid de propiedades */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayProperties.map((prop) => (
            <Card 
              key={prop.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={prop.primary_image_url || "/placeholder-property.jpg"}
                  alt={prop.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-accent text-white mb-2">
                    {formatPrice(prop.price)}
                  </Badge>
                  <h3 className="text-white font-semibold text-lg line-clamp-2">
                    {prop.title}
                  </h3>
                </div>
              </div>

              <CardContent className="p-5">
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {prop.address ? `${prop.address}, ` : ""}
                  {prop.city}
                </div>

                <div className="flex flex-wrap gap-6 text-sm">
                  {prop.bedrooms !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4 text-accent" />
                      <span>{prop.bedrooms} hab</span>
                    </div>
                  )}
                  {prop.bathrooms !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4 text-accent" />
                      <span>{prop.bathrooms} baños</span>
                    </div>
                  )}
                  {prop.square_feet !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Maximize className="h-4 w-4 text-accent" />
                      <span>{prop.square_feet} m²</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botón principal - Ver todas las propiedades */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="gap-2 text-lg px-10 py-6">
            <Link href="/properties">
              Ver todas las propiedades
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            Encuentra más de {displayProperties.length}+ opciones actualizadas diariamente
          </p>
        </div>
      </div>
    </section>
  )
}