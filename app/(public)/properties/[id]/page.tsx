import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PropertyDetails } from "@/components/properties/property-details"

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from("properties")
    .select(
      `
      *,
      property_images(id, image_url, is_primary),
      property_amenities(amenity),
      profiles(full_name, phone, email, avatar_url)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Increment views
  await supabase
    .from("properties")
    .update({ views: property.views + 1 })
    .eq("id", id)

  return <PropertyDetails property={property} />
}
