"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Phone,
  Mail,
  Eye,
  Share2,
  Heart,
  ExternalLink,
  Landmark,
} from "lucide-react"
import { BANK_MAP, type BankId } from "@/lib/banks"
import type { Property } from "@/lib/types/database"

interface PropertyDetailsProps {
  property: Property & {
    // ✅ IMPORTANTE: mientras actualizas types, extiende aquí
    bank_id?: string | null
    property_images?: Array<{ id: string; image_url: string; is_primary: boolean }>
    property_amenities?: Array<{ amenity: string }>
    profiles?: { full_name: string | null; phone: string | null; email: string | null; avatar_url: string | null }
  }
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const images = property.property_images || []
  const primaryImage = images.find((img) => img.is_primary) || images[0]

  // ✅ Sin arriendos
  const statusLabels: Record<string, string> = {
    for_sale: "En Venta",
    sold: "Vendida",
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const bankId = property.bank_id as BankId | undefined
  const bank = bankId ? BANK_MAP[bankId] : undefined

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]?.image_url || primaryImage?.image_url || "/placeholder.svg"}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <MapPin className="h-24 w-24 text-muted-foreground" />
                </div>
              )}

              <div className="absolute top-4 left-4 flex gap-2">
                {property.featured && <Badge className="bg-accent text-white">Destacada</Badge>}
                <Badge className="bg-background/90 text-foreground" variant="secondary">
                  {statusLabels[property.status] ?? "Disponible"}
                </Badge>
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="icon" variant="secondary" className="bg-background/90">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="bg-background/90">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-video overflow-hidden rounded-lg ${
                      selectedImage === index ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    <Image src={image.image_url || "/placeholder.svg"} alt={`Vista ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Info */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{property.title}</h1>
                    <p className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-5 w-5" />
                      {property.address}, {property.city}, {property.country}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-bold text-accent">{formatPrice(Number(property.price))}</p>
                    <p className="text-sm text-muted-foreground mt-1">ID: {property.property_id_code}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-t border-b py-4">
                  {property.bedrooms ? (
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5" />
                      <span className="font-medium">{property.bedrooms} Habitaciones</span>
                    </div>
                  ) : null}

                  {property.bathrooms ? (
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5" />
                      <span className="font-medium">{property.bathrooms} Baños</span>
                    </div>
                  ) : null}

                  {property.square_feet ? (
                    <div className="flex items-center gap-2">
                      <Maximize className="h-5 w-5" />
                      <span className="font-medium">{property.square_feet} m²</span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    <span className="font-medium">{property.views} vistas</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  {property.description || "No hay descripción disponible para esta propiedad."}
                </p>
              </div>

              {/* ✅ Banco del leasing + botones automáticos */}
              <div className="pt-4 border-t">
                <h2 className="text-xl font-semibold mb-3">Banco del leasing</h2>

                {bank ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/70 dark:bg-white/10 rounded-md p-2 border">
                        <img src={bank.logo} alt={bank.name} className="h-8 w-auto object-contain" />
                      </div>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          <Landmark className="h-4 w-4 text-accent" />
                          {bank.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Esta propiedad se gestiona vía leasing en este banco.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <a
                          href={bank.infoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          Información leasing {bank.name}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>

                      <Button asChild className="w-full bg-accent hover:bg-accent/90 text-white">
                        <a
                          href={bank.simulatorUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          Simulador {bank.name}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : property.bank_id ? (
                  <p className="text-sm text-muted-foreground">Banco: {String(property.bank_id)}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Esta propiedad aún no tiene banco asociado. (Debe seleccionarse al publicarla)
                  </p>
                )}
              </div>

              {/* Amenities */}
              {property.property_amenities && property.property_amenities.length > 0 ? (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Características del inmueble</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.property_amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <span>{amenity.amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Contact */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contactar al Vendedor</h3>

                {property.profiles ? (
                  <div className="flex items-center gap-3 mb-4">
                    {property.profiles.avatar_url ? (
                      <Image
                        src={property.profiles.avatar_url || "/placeholder.svg"}
                        alt={property.profiles.full_name || "Usuario"}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-accent font-semibold">{property.profiles.full_name?.charAt(0) || "U"}</span>
                      </div>
                    )}

                    <div>
                      <p className="font-semibold">{property.profiles.full_name || "Usuario"}</p>
                      <p className="text-sm text-muted-foreground">Propietario</p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                {property.profiles?.phone ? (
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white" size="lg">
                    <Phone className="mr-2 h-4 w-4" />
                    {property.profiles.phone}
                  </Button>
                ) : null}

                {property.profiles?.email ? (
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Mensaje
                  </Button>
                ) : null}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Publicado el {new Date(property.created_at).toLocaleDateString("es-CO")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
