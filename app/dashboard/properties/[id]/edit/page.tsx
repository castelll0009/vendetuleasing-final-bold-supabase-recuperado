import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PropertyForm } from "@/components/dashboard/property-form"
import { notFound } from 'next/navigation'

interface EditPropertyPageProps {
  params: {
    id: string
  }
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error || !property) {
    notFound()
  }

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
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            square_feet: property.square_feet || 0,
            address: property.address,
            city: property.city,
            state: property.state || "",
            country: property.country || "Colombia",
            zip_code: property.zip_code || "",
            featured: property.featured || false,
          }}
        />
      </div>
    </DashboardLayout>
  )
}
