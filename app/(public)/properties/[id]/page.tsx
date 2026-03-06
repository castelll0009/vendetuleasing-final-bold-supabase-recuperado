import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PropertyDetails } from "@/components/properties/property-details"

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Traer la propiedad principal (sin joins complejos)
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single()

  if (propError || !property) {
    console.error("[PropertyDetail] Error fetching property:", propError)
    notFound()
  }

  // 2. Traer imágenes
  const { data: images } = await supabase
    .from("property_images")
    .select("id, image_url, is_primary")
    .eq("property_id", id)
    .order("is_primary", { ascending: false }) // primaria primero

  // 3. Traer amenidades
  const { data: amenities } = await supabase
    .from("property_amenities")
    .select("amenity")
    .eq("property_id", id)

  // 4. Traer perfil del propietario (solo si user_id existe)
  let profile = null
  if (property.user_id) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("full_name, phone, email, avatar_url")
      .eq("id", property.user_id)
      .single()

    profile = userProfile
  }

  // 5. Incrementar vistas
  await supabase
    .from("properties")
    .update({ views: (property.views || 0) + 1 })
    .eq("id", id)

  // 6. Combinar todo en un solo objeto para PropertyDetails
  const enhancedProperty = {
    ...property,
    property_images: images || [],
    property_amenities: amenities || [],
    profiles: profile,
  }

  return <PropertyDetails property={enhancedProperty} />
}