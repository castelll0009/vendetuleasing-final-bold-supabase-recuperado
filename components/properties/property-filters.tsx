"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SlidersHorizontal, X } from "lucide-react"

// ─── Constantes ───────────────────────────────────────────────────────────────
const PRICE_MIN = 5000000       // 5 millones
const PRICE_MAX = 3000000000    // 3.000 millones
const PRICE_STEP = 1000000      // pasos de 1 millón

const ADMIN_MIN = 0
const ADMIN_MAX = 5000000

const amenitiesList = ["Piscina", "Aire acondicionado"]

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface PropertyFiltersProps {
  initialParams: Record<string, string | undefined>
}

type Filters = ReturnType<typeof buildInitialFilters>

interface FilterContentProps {
  filters: Filters
  priceRange: [number, number]
  onPriceChange: (values: number[]) => void
  onPriceCommit: (values: number[]) => void
  onFilterChange: (key: string, value: string) => void
  toggleAmenity: (amenity: string) => void
  resetFilters: () => void
  setIsOpen: (open: boolean) => void
  formatPrice: (val: string | number) => string
}

// ─── Helper estado inicial ────────────────────────────────────────────────────
function buildInitialFilters(params: Record<string, string | undefined>) {
  return {
    type:      params.type      || "all",
    city:      params.city      || "all",
    min_price: params.min_price || PRICE_MIN.toString(),
    max_price: params.max_price || PRICE_MAX.toString(),
    bedrooms:  params.bedrooms  || "",
    bathrooms: params.bathrooms || "",
    parking:   params.parking   || "",
    stratum:   params.stratum   || "none",
    min_sqft:  params.min_sqft  || "",
    max_sqft:  params.max_sqft  || "",
    min_admin: params.min_admin || ADMIN_MIN.toString(),
    max_admin: params.max_admin || ADMIN_MAX.toString(),
    amenities: params.amenities
      ? params.amenities.split(",").filter(Boolean)
      : [],
  }
}

// ─── FilterContent (fuera del padre para evitar remounts) ────────────────────
function FilterContent({
  filters,
  priceRange,
  onPriceChange,
  onPriceCommit,
  onFilterChange,
  toggleAmenity,
  resetFilters,
  setIsOpen,
  formatPrice,
}: FilterContentProps) {
  return (
    <div className="space-y-6">

      {/* ── Precio ── */}
      <div>
        <Label className="font-semibold">Precio (COP)</Label>

        <Slider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={priceRange}
          onValueChange={onPriceChange}   // mueve el thumb visualmente
          onValueCommit={onPriceCommit}   // persiste al soltar
          className="mt-4"
        />

        {/* Inputs sincronizados bidireccionalmente con el slider */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Mínimo
            </Label>
            <Input
              type="number"
              min={PRICE_MIN}
              max={priceRange[1] - PRICE_STEP}
              step={PRICE_STEP}
              value={priceRange[0]}
              onChange={(e) => {
                const raw = Number(e.target.value)
                const clamped = Math.min(
                  Math.max(raw, PRICE_MIN),
                  priceRange[1] - PRICE_STEP
                )
                onPriceChange([clamped, priceRange[1]])
                onPriceCommit([clamped, priceRange[1]])
              }}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Máximo
            </Label>
            <Input
              type="number"
              min={priceRange[0] + PRICE_STEP}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceRange[1]}
              onChange={(e) => {
                const raw = Number(e.target.value)
                const clamped = Math.max(
                  Math.min(raw, PRICE_MAX),
                  priceRange[0] + PRICE_STEP
                )
                onPriceChange([priceRange[0], clamped])
                onPriceCommit([priceRange[0], clamped])
              }}
            />
          </div>
        </div>

        {/* Etiquetas formateadas del rango actual */}
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* ── Administración ── */}
      <div>
        <Label className="font-semibold">Administración (COP)</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Mínimo"
            value={filters.min_admin}
            onChange={(e) => onFilterChange("min_admin", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Máximo"
            value={filters.max_admin}
            onChange={(e) => onFilterChange("max_admin", e.target.value)}
          />
        </div>
      </div>

      {/* ── Tipo de propiedad ── */}
      <div>
        <Label className="font-semibold">Tipo de propiedad</Label>
        <Select
          value={filters.type}
          onValueChange={(v) => onFilterChange("type", v)}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Cualquier tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier tipo</SelectItem>
            <SelectItem value="house">Casa</SelectItem>
            <SelectItem value="apartment">Apartamento</SelectItem>
            <SelectItem value="studio">Apartaestudio</SelectItem>
            <SelectItem value="local">Local</SelectItem>
            <SelectItem value="office">Oficina</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Ciudad ── */}
      <div>
        <Label className="font-semibold">Ciudad</Label>
        <Select
          value={filters.city}
          onValueChange={(v) => onFilterChange("city", v)}
        >
          <SelectTrigger className="mt-1.5">
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

      {/* ── Habitaciones / Baños / Parqueaderos ── */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { key: "bedrooms",  label: "Habitaciones" },
            { key: "bathrooms", label: "Baños" },
            { key: "parking",   label: "Parqueaderos" },
          ] as const
        ).map(({ key, label }) => (
          <div key={key}>
            <Label className="text-sm">{label}</Label>
            <Input
              type="number"
              min={0}
              placeholder="Cualquier"
              value={filters[key]}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className="mt-1.5"
            />
          </div>
        ))}
      </div>

      {/* ── Estrato ── */}
      <div>
        <Label className="font-semibold">Estrato</Label>
        <Select
          value={filters.stratum}
          onValueChange={(v) => onFilterChange("stratum", v)}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Cualquier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Cualquier estrato</SelectItem>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SelectItem key={n} value={String(n)}>
                Estrato {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Área (m²) ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Área mínima (m²)</Label>
          <Input
            type="number"
            value={filters.min_sqft}
            onChange={(e) => onFilterChange("min_sqft", e.target.value)}
            placeholder="Mín."
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-sm">Área máxima (m²)</Label>
          <Input
            type="number"
            value={filters.max_sqft}
            onChange={(e) => onFilterChange("max_sqft", e.target.value)}
            placeholder="Máx."
            className="mt-1.5"
          />
        </div>
      </div>

      {/* ── Amenidades ── */}
      <div>
        <Label className="font-semibold">Características</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
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

      {/* ── Botones ── */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={resetFilters} className="flex-1">
          <X className="mr-2 h-4 w-4" />
          Restablecer
        </Button>
        <Button onClick={() => setIsOpen(false)} className="flex-1">
          Ver resultados
        </Button>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function PropertyFilters({ initialParams }: PropertyFiltersProps) {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const [filters, setFilters] = useState<Filters>(() =>
    buildInitialFilters(initialParams)
  )

  // Estado local del slider: se actualiza en cada px del drag sin disparar
  // efectos secundarios. Solo se persiste en filters al soltar (onValueCommit).
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(initialParams.min_price ?? PRICE_MIN),
    Number(initialParams.max_price ?? PRICE_MAX),
  ])

  // ── URL update (debounced) ──────────────────────────────────────────────────
  const debouncedUpdate = useDebouncedCallback((params: URLSearchParams) => {
    router.replace(`/properties?${params.toString()}`, { scroll: false })
  }, 450)

  const updateUrl = useCallback(
    (currentFilters: Filters) => {
      const params = new URLSearchParams()

      if (currentFilters.type    !== "all")  params.set("type",    currentFilters.type)
      if (currentFilters.city    !== "all")  params.set("city",    currentFilters.city)
      if (currentFilters.stratum !== "none") params.set("stratum", currentFilters.stratum)

      const minP = Number(currentFilters.min_price)
      const maxP = Number(currentFilters.max_price)
      if (!Number.isNaN(minP) && minP > PRICE_MIN) params.set("min_price", minP.toString())
      if (!Number.isNaN(maxP) && maxP < PRICE_MAX) params.set("max_price", maxP.toString())

      const minA = Number(currentFilters.min_admin)
      const maxA = Number(currentFilters.max_admin)
      if (!Number.isNaN(minA) && minA > 0)        params.set("min_admin", minA.toString())
      if (!Number.isNaN(maxA) && maxA < ADMIN_MAX) params.set("max_admin", maxA.toString())

      ;(["bedrooms", "bathrooms", "parking", "min_sqft", "max_sqft"] as const).forEach(
        (key) => {
          const val = currentFilters[key]
          if (val && val.trim() !== "") params.set(key, val)
        }
      )

      if (currentFilters.amenities.length > 0) {
        params.set("amenities", currentFilters.amenities.join(","))
      }

      debouncedUpdate(params)
    },
    [debouncedUpdate]
  )

  // Sincronizar al navegar atrás/adelante
  useEffect(() => {
    const minP = Number(searchParams.get("min_price") ?? PRICE_MIN)
    const maxP = Number(searchParams.get("max_price") ?? PRICE_MAX)

    setFilters((prev) => ({
      ...prev,
      min_price: searchParams.get("min_price") || PRICE_MIN.toString(),
      max_price: searchParams.get("max_price") || PRICE_MAX.toString(),
      min_admin: searchParams.get("min_admin") || ADMIN_MIN.toString(),
      max_admin: searchParams.get("max_admin") || ADMIN_MAX.toString(),
      type:      searchParams.get("type")      || "all",
      city:      searchParams.get("city")      || "all",
      stratum:   searchParams.get("stratum")   || "none",
    }))

    setPriceRange([minP, maxP])
  }, [searchParams])

  // Actualizar URL cuando filters cambia
  useEffect(() => {
    updateUrl(filters)
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Mueve el thumb visualmente — NO toca filters ni la URL */
  const handlePriceChange = useCallback((values: number[]) => {
    setPriceRange([values[0], values[1]])
  }, [])

  /** Al soltar el thumb — persiste en filters → updateUrl (debounced) */
  const handlePriceCommit = useCallback((values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      min_price: values[0].toString(),
      max_price: values[1].toString(),
    }))
  }, [])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const toggleAmenity = useCallback((amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }, [])

  const resetFilters = useCallback(() => {
    const reset = buildInitialFilters({})
    setFilters(reset)
    setPriceRange([PRICE_MIN, PRICE_MAX])
    router.replace("/properties", { scroll: false })
    setIsOpen(false)
  }, [router])

  const formatPrice = useCallback((val: string | number) => {
    const num = Number(val)
    return Number.isNaN(num) ? String(val) : num.toLocaleString("es-CO")
  }, [])

  const sharedProps: FilterContentProps = {
    filters,
    priceRange,
    onPriceChange:  handlePriceChange,
    onPriceCommit:  handlePriceCommit,
    onFilterChange: handleFilterChange,
    toggleAmenity,
    resetFilters,
    setIsOpen,
    formatPrice,
  }

  return (
    <>
      {/* ── Mobile: Dialog ── */}
      <div className="lg:hidden mb-6">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros avanzados
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Filtros</DialogTitle>
            </DialogHeader>
            <FilterContent {...sharedProps} />
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Desktop: Card sticky ── */}
      <Card className="hidden lg:block sticky top-24">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            Filtros
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Limpiar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterContent {...sharedProps} />
        </CardContent>
      </Card>
    </>
  )
}
