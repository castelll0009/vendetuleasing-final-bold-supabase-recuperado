"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import type { Profile } from "@/lib/types/database"

interface SettingsFormProps {
  profile: Profile | null
  userEmail: string
}

export function SettingsForm({ profile, userEmail }: SettingsFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    email: userEmail,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error("Por favor inicia sesión para continuar")
      }

      console.log("[v0] Updating profile for user:", user.id)

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("id", user.id)

      if (error) {
        console.error("[v0] Supabase error:", error)
        throw new Error(`Error al actualizar: ${error.message}`)
      }

      console.log("[v0] Profile updated successfully")
      alert("Perfil actualizado exitosamente")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar el perfil"
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" value={formData.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">El correo no se puede cambiar</p>
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+57 300 123 4567"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-white">
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
