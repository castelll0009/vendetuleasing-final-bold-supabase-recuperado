// app/properties/page.tsx
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyFilters } from "@/components/properties/property-filters";
import { PropertySearchBar } from "@/components/properties/property-search-bar";
import type { PropertyStatus, PropertyType } from "@/lib/types/database";

interface SearchParams {
  q?: string;
  status?: PropertyStatus;
  type?: string;           // ahora string porque puede ser "all"
  city?: string;
  min_price?: string;
  max_price?: string;
  bedrooms?: string;
  bathrooms?: string;
  parking?: string;
  stratum?: string;
  min_sqft?: string;
  max_sqft?: string;
  amenities?: string;
  min_admin?: string;
  max_admin?: string;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // ────────────────────────────────────────────────
  // Construcción de la consulta base
  // ────────────────────────────────────────────────
  let query = supabase
    .from("properties")
    .select("*")
    .eq("publication_status", "published")
    .order("created_at", { ascending: false });

  // Búsqueda general (q)
  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,address.ilike.%${params.q}%,city.ilike.%${params.q}%,property_id_code.ilike.%${params.q}%`
    );
  }

  // Filtros específicos
  if (params.status) {
    query = query.eq("status", params.status);
  }

  // Tipo de propiedad → solo filtra si NO es "all"
  if (params.type && params.type !== "all") {
    query = query.eq("property_type", params.type);
  }

  if (params.city && params.city !== "all") {
    query = query.ilike("city", `%${params.city}%`);
  }

  // Precio (COP – valores grandes)
  if (params.min_price) {
    const min = Number.parseFloat(params.min_price);
    if (!Number.isNaN(min)) {
      query = query.gte("price", min);
    }
  }

  if (params.max_price) {
    const max = Number.parseFloat(params.max_price);
    if (!Number.isNaN(max)) {
      query = query.lte("price", max);
    }
  }

  // Administración
  if (params.min_admin) {
    const minAdmin = Number.parseFloat(params.min_admin);
    if (!Number.isNaN(minAdmin)) {
      query = query.gte("administration_fee", minAdmin);
    }
  }

  if (params.max_admin) {
    const maxAdmin = Number.parseFloat(params.max_admin);
    if (!Number.isNaN(maxAdmin)) {
      query = query.lte("administration_fee", maxAdmin);
    }
  }

  // Habitaciones, baños, parqueaderos, estrato (≥)
  if (params.bedrooms) {
    const beds = Number.parseInt(params.bedrooms, 10);
    if (!Number.isNaN(beds)) query = query.gte("bedrooms", beds);
  }

  if (params.bathrooms) {
    const baths = Number.parseInt(params.bathrooms, 10);
    if (!Number.isNaN(baths)) query = query.gte("bathrooms", baths);
  }

  if (params.parking) {
    const park = Number.parseInt(params.parking, 10);
    if (!Number.isNaN(park)) query = query.gte("parking_spaces", park); // ← cambia "parking_spaces" si el campo se llama diferente
  }

  // Área (m²)
  if (params.min_sqft) {
    const minArea = Number.parseInt(params.min_sqft, 10);
    if (!Number.isNaN(minArea)) query = query.gte("square_feet", minArea);
  }

  if (params.max_sqft) {
    const maxArea = Number.parseInt(params.max_sqft, 10);
    if (!Number.isNaN(maxArea)) query = query.lte("square_feet", maxArea);
  }

  // Estrato (si existe el campo en la tabla)
  // if (params.stratum && params.stratum !== "none") {
  //   query = query.eq("stratum", params.stratum);
  // }

  // ────────────────────────────────────────────────
  // Ejecución de la consulta principal
  // ────────────────────────────────────────────────
  const { data: properties, error } = await query;

  if (error) {
    console.error("[PropertiesPage] Error al consultar propiedades:", error);
    // Aquí podrías retornar un componente de error amigable
  }

  let enhancedProperties = properties || [];

  // ────────────────────────────────────────────────
  // Cargar SOLO la imagen principal de cada propiedad
  // ────────────────────────────────────────────────
  if (enhancedProperties.length > 0) {
    const propertyIds = enhancedProperties.map((p) => p.id);

    const { data: images } = await supabase
      .from("property_images")
      .select("property_id, image_url")
      .in("property_id", propertyIds)
      .eq("is_primary", true)
      .limit(1); // optimización: solo 1 por propiedad

    const imageMap = new Map<string, string>();
    images?.forEach((img) => {
      if (img.property_id && img.image_url) {
        imageMap.set(img.property_id, img.image_url);
      }
    });

    enhancedProperties = enhancedProperties.map((prop) => ({
      ...prop,
      primary_image_url: imageMap.get(prop.id) || "/placeholder-property.jpg",
    }));
  }

  // ────────────────────────────────────────────────
  // Filtro de amenidades (client-side por ahora)
  // Nota: si quieres mover esto a server-side → crea vista o usa join
  // ────────────────────────────────────────────────
  let filteredProperties = enhancedProperties;

  if (params.amenities) {
    const desiredAmenities = params.amenities
      .split(",")
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);

    if (desiredAmenities.length > 0) {
      const propertyIds = filteredProperties.map((p) => p.id);

      const { data: propAmenities } = await supabase
        .from("property_amenities")
        .select("property_id, amenity")
        .in("property_id", propertyIds);

      if (propAmenities) {
        const matchingProperties = new Set<string>();

        propAmenities.forEach((pa) => {
          const amenityLower = pa.amenity.toLowerCase();
          if (desiredAmenities.some((da) => amenityLower.includes(da))) {
            matchingProperties.add(pa.property_id);
          }
        });

        filteredProperties = filteredProperties.filter((p) =>
          matchingProperties.has(p.id)
        );
      }
    }
  }

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título y contador */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Propiedades Disponibles
          </h1>
          <p className="mt-2 text-muted-foreground">
            {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
            {params.q && ` para "${params.q}"`}
          </p>
        </div>

        {/* Barra de búsqueda rápida */}
        <div className="mb-8">
          <PropertySearchBar
            initialQuery={params.q}
            initialStatus={params.status}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros laterales (desktop) / botón mobile */}
          <aside className="lg:w-80 lg:flex-shrink-0">
            <PropertyFilters initialParams={params} />
          </aside>

          {/* Resultados */}
          <main className="flex-1">
            {filteredProperties.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={{
                      ...property,
                      property_images: property.primary_image_url
                        ? [{ image_url: property.primary_image_url, is_primary: true }]
                        : [],
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-2xl font-semibold mb-3">
                  No encontramos propiedades
                </h2>
                <p className="text-muted-foreground max-w-md">
                  {params.q || Object.keys(params).length > 0
                    ? "Prueba ajustando los filtros o buscando con otros términos."
                    : "No hay propiedades publicadas en este momento."}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}