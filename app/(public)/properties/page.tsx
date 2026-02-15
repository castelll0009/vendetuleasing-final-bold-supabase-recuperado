import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyFilters } from "@/components/properties/property-filters";
import { PropertySearchBar } from "@/components/properties/property-search-bar";
import type { PropertyStatus, PropertyType } from "@/lib/types/database";

interface SearchParams {
  q?: string;
  status?: PropertyStatus;
  type?: PropertyType;
  city?: string;
  min_price?: string;
  max_price?: string;
  bedrooms?: string;
  bathrooms?: string;
  min_sqft?: string;
  max_sqft?: string;
  amenities?: string;
  advanced?: string;
  min_admin?: string; // 👈 nuevo filtro
  max_admin?: string; // 👈 nuevo filtro
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(
      `
        *,
        property_images(image_url, is_primary),
        profiles(full_name)
      `
    )
    .eq("publication_status", "published")
    .order("created_at", { ascending: false });

  // Apply filters
  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,address.ilike.%${params.q}%,city.ilike.%${params.q}%`
    );
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.type) {
    query = query.eq("property_type", params.type);
  }

  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }

  if (params.min_price) {
    query = query.gte("price", Number.parseFloat(params.min_price));
  }

  if (params.max_price) {
    query = query.lte("price", Number.parseFloat(params.max_price));
  }

  if (params.bedrooms) {
    query = query.gte("bedrooms", Number.parseInt(params.bedrooms));
  }

  if (params.bathrooms) {
    query = query.gte("bathrooms", Number.parseInt(params.bathrooms));
  }

  if (params.min_sqft) {
    query = query.gte("square_feet", Number.parseInt(params.min_sqft));
  }

  if (params.max_sqft) {
    query = query.lte("square_feet", Number.parseInt(params.max_sqft));
  }
  if (params.min_admin) {
    query = query.gte("administration_fee", Number(params.min_admin));
  }

  if (params.max_admin) {
    query = query.lte("administration_fee", Number(params.max_admin));
  }

  const { data: properties, error } = await query;

  if (error) {
    console.error("[v0] Error fetching properties:", error);
  }

  // Filter by amenities if provided (client-side filtering since amenities are in separate table)
  let filteredProperties = properties || [];
  if (params.amenities) {
    const amenitiesList = params.amenities.split(",");
    const propertyIds = filteredProperties.map((p) => p.id);

    const { data: propertyAmenities } = await supabase
      .from("property_amenities")
      .select("property_id, amenity")
      .in("property_id", propertyIds);

    if (propertyAmenities) {
      const propertiesWithAmenities = new Set<string>();
      propertyAmenities.forEach((pa) => {
        if (
          amenitiesList.some((a) =>
            pa.amenity.toLowerCase().includes(a.toLowerCase())
          )
        ) {
          propertiesWithAmenities.add(pa.property_id);
        }
      });
      filteredProperties = filteredProperties.filter((p) =>
        propertiesWithAmenities.has(p.id)
      );
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Propiedades Disponibles
          </h1>
          <p className="mt-2 text-muted-foreground">
            {filteredProperties.length}{" "}
            {filteredProperties.length === 1
              ? "propiedad encontrada"
              : "propiedades encontradas"}
            {params.q && ` para "${params.q}"`}
          </p>
        </div>

        <div className="mb-6">
          <PropertySearchBar
            initialQuery={params.q}
            initialStatus={params.status}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <PropertyFilters initialParams={params} />
          </aside>

          {/* Properties Grid */}
          <div className="flex-1">
            {filteredProperties.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-xl font-semibold text-foreground mb-2">
                  No se encontraron propiedades
                </p>
                <p className="text-muted-foreground">
                  {params.q
                    ? `No hay resultados para "${params.q}". Intenta con otros términos de búsqueda.`
                    : "Intenta ajustar tus filtros de búsqueda"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
