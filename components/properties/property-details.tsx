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
  MessageCircle,
} from "lucide-react"
import { BANK_MAP, type BankId } from "@/lib/banks"
import type { Property } from "@/lib/types/database"

interface PropertyDetailsProps {
  property: Property & {
    bank_id?: string | null
    property_images?: Array<{ id: string; image_url: string; is_primary: boolean }>
    property_amenities?: Array<{ amenity: string }>
    profiles?: { full_name: string | null; phone: string | null; email: string | null; avatar_url: string | null }
    primary_image_url?: string  // opcional, por si lo pasas directamente
  }
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  // Imágenes
  const images = property.property_images || []
  const primaryImage = property.primary_image_url 
    ? { image_url: property.primary_image_url, is_primary: true }
    : images.find(img => img.is_primary) || images[0]

  // Amenidades
  const amenities = property.property_amenities?.map(a => a.amenity) || []

  // Banco
  const bankId = property.bank_id as BankId | undefined
  const bank = bankId ? BANK_MAP[bankId] : undefined

  // Status
  const statusLabels: Record<string, string> = {
    for_sale: "En Venta",
    sold: "Vendida",
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // ── Preparación de enlaces de contacto ───────────────────────────────────────
  const owner = property.profiles || {}

  // Limpiar número de teléfono (quitar todo lo que no sea dígito o +)
  const cleanPhone = owner.phone
    ? owner.phone.replace(/[^\d+]/g, "")
    : ""

  // Formato legible para mostrar al usuario (con espacios cada 3 dígitos después del +57)
  const displayPhone = cleanPhone
    ? cleanPhone.replace(/(\+57)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4")
    : null

  // Mensaje prellenado para WhatsApp
  const whatsappMessage = encodeURIComponent(
    `Hola, estoy interesado en la propiedad "${property.title || "en venta"}". ` +
    `¿Podrías darme más información? Gracias.`
  )

  // Asunto y cuerpo para email
  const emailSubject = encodeURIComponent(`Consulta sobre ${property.title || "su propiedad"}`)
  const emailBody = encodeURIComponent(
    `Hola ${owner.full_name || "Propietario"},\n\n` +
    `Estoy interesado en la propiedad "${property.title || "publicada en Vende Tu Leasing"}".\n` +
    `Quisiera más detalles (precio, disponibilidad, visitas, condiciones, etc.).\n\n` +
    `Gracias de antemano.\nSaludos cordiales.`
  )

  // Enlaces finales
  const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsappMessage}` : null
  const mailtoLink = owner.email
    ? `mailto:${owner.email}?subject=${emailSubject}&body=${emailBody}`
    : null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Columna principal - Imágenes y descripción */}
        <div className="lg:col-span-2 space-y-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg">
              {primaryImage || images.length > 0 ? (
                <Image
                  src={primaryImage?.image_url || images[selectedImage]?.image_url || "/placeholder-property.jpg"}
                  alt={property.title || "Propiedad"}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <MapPin className="h-24 w-24 text-muted-foreground" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {property.featured && (
                  <Badge className="bg-accent text-white px-3 py-1 text-sm">Destacada</Badge>
                )}
                <Badge variant="secondary" className="bg-background/90 text-foreground px-3 py-1 text-sm">
                  {statusLabels[property.status] || "Disponible"}
                </Badge>
              </div>

              {/* Botones de compartir y favorito */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="icon" variant="secondary" className="bg-background/80 hover:bg-background/90">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="secondary" className="bg-background/80 hover:bg-background/90">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index 
                        ? "border-accent ring-2 ring-accent/30" 
                        : "border-transparent hover:border-accent/50"
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={`Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información principal */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Título y precio */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 line-clamp-2">
                    {property.title}
                  </h1>
                  <p className="flex items-center text-lg text-muted-foreground">
                    <MapPin className="mr-2 h-5 w-5 flex-shrink-0" />
                    {property.address ? `${property.address}, ` : ""}
                    {property.city}, {property.country || "Colombia"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-4xl md:text-5xl font-bold text-accent">
                    {formatPrice(Number(property.price))}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ID: {property.property_id_code || "No asignado"}
                  </p>
                </div>
              </div>

              {/* Características rápidas */}
              <div className="flex flex-wrap gap-6 py-6 border-t border-b">
                {property.bedrooms !== undefined && property.bedrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-full">
                      <Bed className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Habitaciones</p>
                      <p className="text-xl font-semibold">{property.bedrooms}</p>
                    </div>
                  </div>
                )}

                {property.bathrooms !== undefined && property.bathrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-full">
                      <Bath className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Baños</p>
                      <p className="text-xl font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                )}

                {property.square_feet !== undefined && property.square_feet > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-full">
                      <Maximize className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Área</p>
                      <p className="text-xl font-semibold">{property.square_feet} m²</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Eye className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vistas</p>
                    <p className="text-xl font-semibold">{property.views || 0}</p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Descripción</h2>
                <div className="prose text-muted-foreground max-w-none">
                  {property.description ? (
                    <p className="whitespace-pre-line leading-relaxed">
                      {property.description}
                    </p>
                  ) : (
                    <p className="italic text-muted-foreground/70">
                      No hay descripción disponible para esta propiedad.
                    </p>
                  )}
                </div>
              </div>

              {/* Amenidades */}
              {amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Características</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Banco del Leasing */}
              <div className="pt-6 border-t">
                <h2 className="text-2xl font-semibold mb-4">Banco del Leasing</h2>

                {bank ? (
                  <Card className="bg-gradient-to-br from-accent/5 to-background border-accent/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm min-w-[120px] flex items-center justify-center">
                          <img 
                            src={bank.logo} 
                            alt={bank.name} 
                            className="h-12 w-auto object-contain" 
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-accent" />
                            {bank.name}
                          </h3>
                          <p className="text-muted-foreground mt-2">
                            Esta propiedad se gestiona a través de leasing con {bank.name}.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <Button asChild variant="outline" className="w-full">
                          <a href={bank.infoUrl} target="_blank" rel="noopener noreferrer">
                            Más información sobre leasing
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>

                        <Button asChild className="w-full bg-accent hover:bg-accent/90">
                          <a href={bank.simulatorUrl} target="_blank" rel="noopener noreferrer">
                            Simular crédito con {bank.name}
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="p-6 bg-muted/50 rounded-lg text-center">
                    <Landmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Esta propiedad aún no tiene banco de leasing asociado.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Contacto y datos rápidos */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Contacto con vendedor */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">Contactar al vendedor</h3>

                {owner.full_name || owner.phone || owner.email ? (
                  <div className="flex items-center gap-4">
                    {owner.avatar_url ? (
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={owner.avatar_url}
                          alt={owner.full_name || "Vendedor"}
                          fill
                          className="rounded-full object-cover border-2 border-background"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-2xl font-bold text-accent border-2 border-background">
                        {owner.full_name?.charAt(0) || "?"}
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-lg">
                        {owner.full_name || "Propietario"}
                      </p>
                      <p className="text-sm text-muted-foreground">Propietario</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Información del propietario no disponible
                  </p>
                )}

                {/* Número de contacto visible + botones debajo */}
                <div className="pt-4 border-t space-y-4">
                  {displayPhone && (
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Número de contacto</p>
                      <p className="text-xl font-semibold flex items-center justify-center gap-2">
                        <Phone className="h-5 w-5 text-accent" />
                        {displayPhone}
                      </p>
                    </div>
                  )}

                  {/* Botones de WhatsApp y Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* WhatsApp */}
                    {whatsappLink && (
                      <Button 
                        asChild 
                        size="lg" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Contactar por WhatsApp"
                        >
                          <MessageCircle className="mr-2 h-5 w-5" />
                          WhatsApp
                        </a>
                      </Button>
                    )}

                    {/* Enviar correo */}
                    {mailtoLink && (
                      <Button 
                        asChild 
                        variant="outline" 
                        size="lg"
                      >
                        <a href={mailtoLink} aria-label="Enviar correo al vendedor">
                          <Mail className="mr-2 h-5 w-5" />
                          Enviar email
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Fecha de publicación */}
                <div className="pt-4 text-center text-sm text-muted-foreground border-t">
                  Publicado el{" "}
                  {new Date(property.created_at).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Datos adicionales */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Detalles adicionales</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Código de propiedad</dt>
                    <dd className="font-medium">{property.property_id_code || "No asignado"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Vistas</dt>
                    <dd className="font-medium">{property.views || 0}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}