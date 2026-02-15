import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { FeaturedPropertiesCarousel } from "@/components/landing/featured-properties-carousel"
import type { Property } from "@/lib/types/database"

export async function FeaturedProperties() {
  noStore()

  const supabase = await createClient()

  // First, try to get featured paid properties
  const { data: featuredData } = await supabase
    .from("properties")
    .select(
      `
      *,
      property_images(image_url, is_primary),
      profiles(full_name)
    `
    )
    .eq("is_featured_paid", true)
    .eq("publication_status", "published")
    .gte("featured_until", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(12)

  // If no featured paid properties, fall back to all published properties
  const { data, error } = featuredData && featuredData.length > 0
    ? { data: featuredData, error: null }
    : await supabase
        .from("properties")
        .select(
          `
          *,
          property_images(image_url, is_primary),
          profiles(full_name)
        `
        )
        .eq("publication_status", "published")
        .order("created_at", { ascending: false })
        .limit(12)

  if (error) {
    console.error("[FeaturedProperties] Error fetching properties:", error)
    return null
  }

  const properties =
    (data as Array<
      Property & {
        property_images?: Array<{ image_url: string; is_primary: boolean }>
        profiles?: { full_name: string | null }
      }
    >) ?? []

  if (!properties.length) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Propiedades Destacadas
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Descubre las mejores ofertas inmobiliarias
          </p>
        </div>

        {/* Carrusel con Swiper */}
        <FeaturedPropertiesCarousel properties={properties} />

        <div className="mt-12 text-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-white bg-transparent"
          >
            <Link href="/properties">Ver Todas las Propiedades</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
