// app/dashboard/properties/[id]/edit/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PropertyForm } from "@/components/dashboard/property-form"
import { notFound } from 'next/navigation'

interface EditPropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Cargar propiedad con todas sus relaciones
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (propertyError || !property) {
    notFound()
  }

  // Cargar imágenes existentes
  const { data: images } = await supabase
    .from("property_images")
    .select("image_url, is_primary")
    .eq("property_id", id)
    .order("is_primary", { ascending: false })

  // Cargar amenities existentes
  const { data: amenities } = await supabase
    .from("property_amenities")
    .select("amenity")
    .eq("property_id", id)

  // Formatear imágenes para el componente
  const existingImages = images?.map(img => ({
    url: img.image_url,
    isPrimary: img.is_primary || false
  })) || []

  // Extraer lista de amenities
  const existingAmenities = amenities?.map(a => a.amenity) || []

  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Propiedad</h1>
          <p className="text-muted-foreground mt-2">Actualiza la información de tu propiedad</p>
        </div>

        <PropertyForm 
          userId={user.id} 
          propertyId={property.id}
          initialData={{
            title: property.title,
            description: property.description || "",
            property_type: property.property_type,
            status: property.status,
            price: property.price,
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            square_feet: property.square_feet || 0,
            address: property.address,
            city: property.city,
            state: property.state || "",
            country: property.country || "Colombia",
            zip_code: property.zip_code || "",
            featured: property.featured || false,
            bank_id: property.bank_id || "", // ✅ Cargar banco existente
          }}
          existingImages={existingImages} // ✅ Nuevo prop
          existingAmenities={existingAmenities} // ✅ Nuevo prop
        />
      </div>
    </DashboardLayout>
  )
}