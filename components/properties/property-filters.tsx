"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SlidersHorizontal, X } from "lucide-react"

interface PropertyFiltersProps {
  initialParams: {
    status?: string
    type?: string
    city?: string
    min_price?: string
    max_price?: string
    bedrooms?: string
    bathrooms?: string
    parking?: string
    stratum?: string
    min_sqft?: string
    max_sqft?: string
    amenities?: string
      min_admin?: string; // 👈 nuevo filtro
  max_admin?: string; // 👈 nuevo filtro
  }
}

const amenitiesList = [
  "Piscina",
  "Aire acondicionado",

]

export function PropertyFilters({ initialParams }: PropertyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const [filters, setFilters] = useState({
    status: initialParams.status || "",
    type: initialParams.type || "all",
    city: initialParams.city || "all",
    min_price: initialParams.min_price || "20",
    max_price: initialParams.max_price || "70987",
    bedrooms: initialParams.bedrooms || "",
    bathrooms: initialParams.bathrooms || "",
    parking: initialParams.parking || "",
    stratum: initialParams.stratum || "",
    min_sqft: initialParams.min_sqft || "",
    max_sqft: initialParams.max_sqft || "",
    property_id: "",
    amenities: initialParams.amenities ? initialParams.amenities.split(",") : [],
  })

  const handleApplyFilters = () => {
    const params = new URLSearchParams()

    if (filters.status) params.set("status", filters.status)
    if (filters.type && filters.type !== "all") params.set("type", filters.type)
    if (filters.city && filters.city !== "all") params.set("city", filters.city)
    if (filters.min_price) params.set("min_price", filters.min_price)
    if (filters.max_price) params.set("max_price", filters.max_price)
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms)
    if (filters.bathrooms) params.set("bathrooms", filters.bathrooms)
    if (filters.parking) params.set("parking", filters.parking)
    if (filters.stratum) params.set("stratum", filters.stratum)
    if (filters.min_sqft) params.set("min_sqft", filters.min_sqft)
    if (filters.max_sqft) params.set("max_sqft", filters.max_sqft)
    if (filters.amenities.length > 0) params.set("amenities", filters.amenities.join(","))

    router.push(`/properties?${params.toString()}`)
    setIsOpen(false)
  }

  const handleResetFilters = () => {
    setFilters({
      status: "",
      type: "all",
      city: "all",
      min_price: "20",
      max_price: "70987",
      bedrooms: "",
      bathrooms: "",
      parking: "",
      stratum: "",
      min_sqft: "",
      max_sqft: "",
      property_id: "",
      amenities: [],
    })
    router.push("/properties")
  }

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Gama de precios</Label>
        <div className="space-y-4">
          <Slider
            min={20}
            max={100000}
            step={100}
            value={[Number.parseFloat(filters.min_price), Number.parseFloat(filters.max_price)]}
            onValueChange={([min, max]) => {
              setFilters((prev) => ({
                ...prev,
                min_price: min.toString(),
                max_price: max.toString(),
              }))
            }}
            className="mb-4"
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="min_price" className="text-sm">
                Mínimo
              </Label>
              <Input
                id="min_price"
                type="number"
                value={filters.min_price}
                onChange={(e) => setFilters((prev) => ({ ...prev, min_price: e.target.value }))}
                placeholder="$ 20"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="max_price" className="text-sm">
                Máximo
              </Label>
              <Input
                id="max_price"
                type="number"
                value={filters.max_price}
                onChange={(e) => setFilters((prev) => ({ ...prev, max_price: e.target.value }))}
                placeholder="$ 70987"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Property Type & ID */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type" className="text-sm font-semibold mb-2 block">
            Tipo
          </Label>
          <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Cualquier tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier tipo</SelectItem>
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
          <Label htmlFor="property_id" className="text-sm font-semibold mb-2 block">
            ID de Propiedad
          </Label>
          <Input
            id="property_id"
            value={filters.property_id}
            onChange={(e) => setFilters((prev) => ({ ...prev, property_id: e.target.value }))}
            placeholder="RTD0494213"
          />
        </div>
      </div>

      {/* Bedrooms, Bathrooms, Parking & Stratum */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold mb-2 block">Habitaciones</Label>
          <Input
            type="number"
            value={filters.bedrooms}
            onChange={(e) => setFilters((prev) => ({ ...prev, bedrooms: e.target.value }))}
            placeholder="Cualquier"
            min="0"
          />
        </div>
        <div>
          <Label className="text-sm font-semibold mb-2 block">Baños</Label>
          <Input
            type="number"
            value={filters.bathrooms}
            onChange={(e) => setFilters((prev) => ({ ...prev, bathrooms: e.target.value }))}
            placeholder="Cualquier"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold mb-2 block">Parqueaderos</Label>
          <Input
            type="number"
            value={filters.parking}
            onChange={(e) => setFilters((prev) => ({ ...prev, parking: e.target.value }))}
            placeholder="Cualquier"
            min="0"
          />
        </div>
        <div>
          <Label className="text-sm font-semibold mb-2 block">Estrato</Label>
          <Select
            value={filters.stratum}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, stratum: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cualquier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Cualquier estrato</SelectItem>
              <SelectItem value="1">Estrato 1</SelectItem>
              <SelectItem value="2">Estrato 2</SelectItem>
              <SelectItem value="3">Estrato 3</SelectItem>
              <SelectItem value="4">Estrato 4</SelectItem>
              <SelectItem value="5">Estrato 5</SelectItem>
              <SelectItem value="6">Estrato 6</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
{/* Filtro: Valor de la administración */}
<div className="space-y-2">
  <label className="text-sm font-medium">Valor de la administración</label>
  <div className="flex gap-2">
    <Input
      name="min_admin"
      placeholder="Mínimo"
      defaultValue={initialParams.min_admin}
      type="number"
    />
    <Input
      name="max_admin"
      placeholder="Máximo"
      defaultValue={initialParams.max_admin}
      type="number"
    />
  </div>
</div>

      {/* Location */}
      <div>
        <Label htmlFor="city" className="text-sm font-semibold mb-2 block">
          Ubicación
        </Label>
        <Select value={filters.city} onValueChange={(value) => setFilters((prev) => ({ ...prev, city: value }))}>
          <SelectTrigger id="city">
            <SelectValue placeholder="Todas las ciudades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ciudades</SelectItem>
            <SelectItem value="Bogotá">Bogotá</SelectItem>
            <SelectItem value="Medellín">Medellín</SelectItem>
            <SelectItem value="Cali">Cali</SelectItem>
            <SelectItem value="Cartagena">Cartagena</SelectItem>
            <SelectItem value="Barranquilla">Barranquilla</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Square Meters */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Metros Cuadrados (m²)</Label>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="number"
              value={filters.min_sqft}
              onChange={(e) => setFilters((prev) => ({ ...prev, min_sqft: e.target.value }))}
              placeholder="Mín."
            />
          </div>
          <div className="flex-1">
            <Input
              type="number"
              value={filters.max_sqft}
              onChange={(e) => setFilters((prev) => ({ ...prev, max_sqft: e.target.value }))}
              placeholder="Máximo"
            />
          </div>
        </div>
      </div>

      {/* Caracteristicas del inmueble */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Caracteristicas del inmueble</Label>
        <div className="grid grid-cols-2 gap-3">
          {amenitiesList.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <label htmlFor={amenity} className="text-sm cursor-pointer">
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleResetFilters}
          className="flex-1 hover:bg-accent/10 hover:text-accent bg-transparent"
        >
          <X className="mr-2 h-4 w-4" />
          Restablecer
        </Button>
        <Button type="button" onClick={handleApplyFilters} className="flex-1 bg-accent hover:bg-accent/90 text-white">
          Buscar
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: Dialog */}
      <div className="lg:hidden mb-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full bg-transparent">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Más filtros
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Más filtros</DialogTitle>
            </DialogHeader>
            <FilterContent />
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop: Card */}
      <Card className="hidden lg:block sticky top-20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros</span>
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Limpiar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterContent />
        </CardContent>
      </Card>
    </>
  )
}
