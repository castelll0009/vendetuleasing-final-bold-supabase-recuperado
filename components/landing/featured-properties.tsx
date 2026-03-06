// components/landing/featured-properties.tsx
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { FeaturedPropertiesCarousel } from "@/components/landing/featured-properties-carousel"

export async function FeaturedProperties() {
  noStore()

  const supabase = await createClient()

  // Consulta principal: solo destacadas y publicadas
  const { data: featuredProperties, error: featuredError } = await supabase
    .from("properties")
    .select("*")
    .eq("publication_status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(12)

  if (featuredError) {
    console.error("[FeaturedProperties] Error al consultar destacadas:", featuredError)
  }

  let propertiesToShow = featuredProperties || []

  // Fallback: si no hay destacadas, usar las más recientes publicadas
  if (propertiesToShow.length === 0) {
    console.log("[FeaturedProperties] No hay propiedades destacadas → usando fallback a recientes")
    const { data: fallback, error: fallbackError } = await supabase
      .from("properties")
      .select("*")
      .eq("publication_status", "published")
      .order("created_at", { ascending: false })
      .limit(12)

    if (fallbackError) {
      console.error("[FeaturedProperties] Error en fallback:", fallbackError)
    }

    propertiesToShow = fallback || []
  }

  // ────────────────────────────────────────────────
  // Cargar SOLO la imagen principal de cada propiedad
  // (mismo patrón que en properties/page.tsx)
  // ────────────────────────────────────────────────
  let processed = propertiesToShow.map((prop) => ({
    id: prop.id,
    title: prop.title,
    price: prop.price,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    square_feet: prop.square_feet,
    address: prop.address,
    city: prop.city,
    status: prop.status,
    primary_image_url: "/placeholder-property.jpg", // default temporal
  }))

  if (propertiesToShow.length > 0) {
    const propertyIds = propertiesToShow.map((p) => p.id)

    const { data: images, error: imagesError } = await supabase
      .from("property_images")
      .select("property_id, image_url")
      .in("property_id", propertyIds)
      .eq("is_primary", true)
      .limit(propertiesToShow.length) // 1 por propiedad aprox

    if (imagesError) {
      console.error("[FeaturedProperties] Error al cargar imágenes:", imagesError)
    }

    // Crear mapa de imágenes
    const imageMap = new Map<string, string>()
    images?.forEach((img) => {
      if (img.property_id && img.image_url) {
        imageMap.set(img.property_id, img.image_url)
      }
    })

    // Asignar imágenes a las propiedades
    processed = processed.map((prop) => ({
      ...prop,
      primary_image_url: imageMap.get(prop.id) || "/placeholder-property.jpg",
    }))
  }

  // Si aún no hay nada → mostrar mensaje amigable
  if (processed.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Propiedades Destacadas</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Actualmente no hay propiedades destacadas disponibles.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <Link href="/properties">Ver todas las propiedades</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Propiedades Destacadas
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Las mejores oportunidades en leasing, seleccionadas especialmente para ti.
          </p>
        </div>

        <FeaturedPropertiesCarousel properties={processed} />

        <div className="mt-12 text-center">
          <Button
            asChild
            size="lg"
            className="h-14 px-10 text-lg font-medium bg-accent hover:bg-accent/90 shadow-lg transition-all"
          >
            <Link href="/properties">
              Ver todas las propiedades →
            </Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            +{processed.length} propiedades destacadas • Actualizado diariamente
          </p>
        </div>
      </div>
    </section>
  )
}