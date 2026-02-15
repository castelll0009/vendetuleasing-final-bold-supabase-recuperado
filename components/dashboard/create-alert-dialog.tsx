"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { PropertyType } from "@/lib/types/database"

interface CreateAlertDialogProps {
  userId: string
}

export function CreateAlertDialog({ userId }: CreateAlertDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    property_type: "" as PropertyType | "",
    city: "",
    min_price: "",
    max_price: "",
    min_bedrooms: "",
    max_bedrooms: "",
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const alertData = {
        user_id: userId,
        property_type: formData.property_type || null,
        city: formData.city || null,
        min_price: formData.min_price ? Number.parseFloat(formData.min_price) : null,
        max_price: formData.max_price ? Number.parseFloat(formData.max_price) : null,
        min_bedrooms: formData.min_bedrooms ? Number.parseInt(formData.min_bedrooms) : null,
        max_bedrooms: formData.max_bedrooms ? Number.parseInt(formData.max_bedrooms) : null,
        active: true,
      }

      const { error } = await supabase.from("price_alerts").insert(alertData)

      if (error) throw error

      setIsOpen(false)
      setFormData({
        property_type: "",
        city: "",
        min_price: "",
        max_price: "",
        min_bedrooms: "",
        max_bedrooms: "",
      })
      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating alert:", error)
      alert("Error al crear la alerta")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Alerta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Alerta de Precio</DialogTitle>
          <DialogDescription>
            Configura los criterios para recibir notificaciones sobre propiedades que te interesen
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="property_type">Tipo de Propiedad</Label>
            <Select
              value={formData.property_type}
              onValueChange={(value: PropertyType) => setFormData({ ...formData, property_type: value })}
            >
              <SelectTrigger id="property_type">
                <SelectValue placeholder="Cualquier tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Cualquier tipo</SelectItem>
                <SelectItem value="house">Casa</SelectItem>
                <SelectItem value="apartment">Apartamento</SelectItem>
                <SelectItem value="office">Oficina</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="townhome">Townhome</SelectItem>
                <SelectItem value="bungalow">Bungalow</SelectItem>
                <SelectItem value="condo">Condominio</SelectItem>
                <SelectItem value="land">Terreno</SelectItem>
                <SelectItem value="commercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Ej: Bogotá"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_price">Precio Mínimo (COP)</Label>
              <Input
                id="min_price"
                type="number"
                value={formData.min_price}
                onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="max_price">Precio Máximo (COP)</Label>
              <Input
                id="max_price"
                type="number"
                value={formData.max_price}
                onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                placeholder="Sin límite"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_bedrooms">Habitaciones Mínimas</Label>
              <Input
                id="min_bedrooms"
                type="number"
                value={formData.min_bedrooms}
                onChange={(e) => setFormData({ ...formData, min_bedrooms: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="max_bedrooms">Habitaciones Máximas</Label>
              <Input
                id="max_bedrooms"
                type="number"
                value={formData.max_bedrooms}
                onChange={(e) => setFormData({ ...formData, max_bedrooms: e.target.value })}
                placeholder="Sin límite"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            {isSubmitting ? "Creando..." : "Crear Alerta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
