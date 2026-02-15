"use client";

import { BANK_MAP } from "@/lib/banks";
import { ExternalLink, Landmark } from "lucide-react";

import type React from "react";
import { CloudinaryImageUploader } from "./image-uploader-cloudinary";
import { put } from "@vercel/blob";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { PropertyType, PropertyStatus } from "@/lib/types/database";
import { BANKS, type BankId } from "@/lib/banks";

interface PropertyFormProps {
  userId: string;
  initialData?: {
    title: string;
    description: string;
    property_type: PropertyType;
    status: PropertyStatus;
    price: number;
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    address: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    featured: boolean;
    bank_id?: string;
  };
  propertyId?: string;
}

const amenitiesList = [
  "Ático",
  "Cancha de baloncesto",
  "Aire acondicionado",
  "Césped",
  "Televisión por cable",
  "Secadora",
  "Ducha a aire libre",
  "Arandela",
  "Vista del lago",
  "Bodega",
  "Patio delantero",
  "Refrigerador",
];

export function PropertyForm({
  userId,
  initialData,
  propertyId,
}: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<
    Array<{ url: string; isPrimary: boolean }>
  >([]);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    property_type: initialData?.property_type || ("house" as PropertyType),
    status: initialData?.status || ("for_sale" as PropertyStatus),
    price: initialData?.price || 0,
    bedrooms: initialData?.bedrooms || 1,
    bathrooms: initialData?.bathrooms || 1,
    square_feet: initialData?.square_feet || 0,
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    country: initialData?.country || "Colombia",
    zip_code: initialData?.zip_code || "",
    featured: initialData?.featured || false,
    bank_id: initialData?.bank_id || "", // ✅ nuevo
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const supabase = createClient();

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Por favor inicia sesión para continuar");
      }

      console.log("[v0] Authenticated user:", user.id);
      console.log("[v0] Submitting property with data:", formData);
      console.log("[v0] Selected amenities:", selectedAmenities);
      console.log("[v0] Selected images:", selectedImages.length);

      if (
        !formData.title ||
        !formData.price ||
        !formData.address ||
        !formData.city ||
        !formData.bank_id
      ) {
        throw new Error(
          "Por favor completa todos los campos requeridos (incluye el banco del leasing)"
        );
      }

      if (selectedImages.length === 0) {
        throw new Error("Por favor agrega al menos una imagen a tu propiedad");
      }

      let propertyId_local = propertyId;

      if (!propertyId_local) {
        console.log("[v0] Creating new property");

        const propertyData = {
          ...formData,
          user_id: user.id,
          publication_status: "pending_payment",
        };

        console.log("[v0] Property data to insert:", propertyData);

        const { data: property, error } = await supabase
          .from("properties")
          .insert(propertyData)
          .select()
          .single();

        if (error) {
          console.error("[v0] Supabase error:", error);
          throw new Error(`Error al crear la propiedad: ${error.message}`);
        }

        console.log("[v0] Property created successfully:", property);
        propertyId_local = property.id;
      } else {
        console.log("[v0] Updating property:", propertyId_local);
        const { error } = await supabase
          .from("properties")
          .update(formData)
          .eq("id", propertyId_local)
          .eq("user_id", user.id);

        if (error) {
          console.error("[v0] Error updating property:", error);
          throw new Error(`Error al actualizar: ${error.message}`);
        }

        await supabase
          .from("property_images")
          .delete()
          .eq("property_id", propertyId_local);
      }

      if (selectedImages.length > 0) {
        // Filtrar solo las que realmente tienen una URL válida
        const validImageUrls = selectedImages
          .filter(
            (img): img is { url: string; isPrimary: boolean } =>
              typeof img.url === "string" &&
              img.url.trim() !== "" &&
              img.url.startsWith("http")
          )
          .map((img) => ({
            property_id: propertyId_local!,
            image_url: img.url,
            is_primary: img.isPrimary,
          }));

        if (validImageUrls.length === 0) {
          throw new Error(
            "No se pudo obtener ninguna URL válida de las imágenes subidas. Intenta subirlas de nuevo."
          );
        }

        const { error: imageError } = await supabase
          .from("property_images")
          .insert(validImageUrls);

        if (imageError) {
          console.error("Error detallado de Supabase:", imageError);
          throw new Error(`Error al guardar imágenes: ${imageError.message}`);
        }
      }

      await supabase
        .from("property_amenities")
        .delete()
        .eq("property_id", propertyId_local);

      if (selectedAmenities.length > 0) {
        const amenitiesData = selectedAmenities.map((amenity) => ({
          property_id: propertyId_local,
          amenity,
        }));
        await supabase.from("property_amenities").insert(amenitiesData);
      }

      console.log("[v0] Property saved successfully, redirecting...");
      router.push("/dashboard/properties");
      router.refresh();
    } catch (error) {
      console.error("[v0] Error saving property:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al guardar la propiedad";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>

            <div>
              <Label htmlFor="title">Título de la Propiedad *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Hermosa casa en el centro de la ciudad"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe tu propiedad..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_type">Tipo de Propiedad *</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value: PropertyType) =>
                    setFormData({ ...formData, property_type: value })
                  }
                >
                  <SelectTrigger id="property_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="studio">Apartaestudio</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="warehouse">Bodega</SelectItem>
                    <SelectItem value="office">Oficina</SelectItem>
                    <SelectItem value="building">Edificio</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: PropertyStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="for_sale">En Venta</SelectItem>
                    <SelectItem value="sold">Vendida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Image Uploader */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Subir Imágenes</h3>
            <CloudinaryImageUploader onImagesChange={setSelectedImages} />
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalles de la Propiedad</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio (COP) *</Label>
                <Input
                  id="price"
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number.parseFloat(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="square_feet">Metros Cuadrados (m²)</Label>
                <Input
                  id="square_feet"
                  type="number"
                  value={formData.square_feet}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      square_feet: Number.parseInt(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="bedrooms">Habitaciones</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bedrooms: Number.parseInt(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="bathrooms">Baños</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bathrooms: Number.parseInt(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ubicación</h3>

            <div>
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Calle 123 #45-67"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Bogotá"
                />
              </div>

              <div>
                <Label htmlFor="state">Departamento</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="Cundinamarca"
                />
              </div>

              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="Colombia"
                />
              </div>

              <div>
                <Label htmlFor="zip_code">Código Postal</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) =>
                    setFormData({ ...formData, zip_code: e.target.value })
                  }
                  placeholder="110111"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Comodidades</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm cursor-pointer"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked as boolean })
              }
            />
            <label htmlFor="featured" className="text-sm cursor-pointer">
              Marcar como propiedad destacada
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              {isSubmitting
                ? "Guardando..."
                : propertyId
                ? "Actualizar Propiedad"
                : "Publicar Propiedad"}
            </Button>
          </div>
          <div>
            <Label htmlFor="bank_id">Banco del leasing / crédito *</Label>
            <Select
              value={formData.bank_id}
              onValueChange={(value: BankId) =>
                setFormData({ ...formData, bank_id: value })
              }
            >
              <SelectTrigger id="bank_id">
                <SelectValue placeholder="Selecciona un banco" />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground mt-2">
              Este dato es obligatorio para generar automáticamente los enlaces
              oficiales en la ficha del inmueble.
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
