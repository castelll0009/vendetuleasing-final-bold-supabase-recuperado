"use client"

import React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Eye, Edit, Trash2, Building2, Star, Clock, CheckCircle } from "lucide-react"
import type { Property } from "@/lib/types/database"
import { BoldPaymentButton } from "@/components/dashboard/bold-payment-button"
// fake button only used during local testing, hide in production
// import { FakeBoldPaymentButton } from "@/components/dashboard/fake-bold-button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PropertiesTableProps {
  properties: Array<
    Property & {
      property_images?: Array<{ image_url: string; is_primary: boolean }>
    }
  >
}

export function PropertiesTable({ properties: initialProperties }: PropertiesTableProps) {
  const router = useRouter()
  const [properties, setProperties] = useState(initialProperties)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  // simulation helper previously here; removed/commented

  /*
  const [simulatingId, setSimulatingId] = useState<string | null>(null)

  const simulatePublish = async (propertyId: string) => {
    // ... simulation code removed per request
  }
  */


  const statusLabels = {
    for_sale: "En Venta",
    for_rent: "En Renta",
    sold: "Vendida",
    rented: "Rentada",
  }

  const publicationStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    pending_payment: { label: "Pendiente de Pago", variant: "destructive", icon: <Clock className="h-3 w-3" /> },
    published: { label: "Publicada", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
    expired: { label: "Expirada", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
    rejected: { label: "Rechazada", variant: "destructive", icon: <Clock className="h-3 w-3" /> },
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    const supabase = createClient()

    // make sure we have a valid logged in user so the RLS policy will allow deletion
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn("[v0] delete request without authenticated user", authError)
      alert("Debes iniciar sesión para eliminar la propiedad")
      setIsDeleting(false)
      setDeleteId(null)
      return
    }

    // cleanup dependent records that reference this property
    // the schema currently has FKs on payments, property_images, property_amenities,
    // and transactions, so we delete in that order to avoid constraint errors.
    const cleanupTables = [
      "payments",
      "property_images",
      "property_amenities",
      "transactions",
    ]

    for (const tbl of cleanupTables) {
      const { error: e } = await supabase
        .from(tbl)
        .delete()
        .match({ property_id: deleteId })

      if (e) {
        console.warn(
          `[v0] failed to clean up \`${tbl}\` before deleting property`,
          e
        )
        // continue anyway – the subsequent delete of the property will
        // either succeed (if FK has ON DELETE CASCADE) or return a
        // descriptive error we can show to the user
      }
    }

    // now delete the property itself (still guarded by RLS and matching user)
    const { error } = await supabase
      .from("properties")
      .delete()
      .match({ id: deleteId, user_id: user.id })

    if (error) {
      console.error("[v0] Error deleting property:", error)
      alert(error.message || "Error al eliminar la propiedad")
    } else {
      setProperties((prev) => prev.filter((p) => p.id !== deleteId))
      router.refresh()
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">No tienes propiedades publicadas</p>
            <p className="text-muted-foreground mb-6">Comienza publicando tu primera propiedad</p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-white">
              <Link href="/dashboard/properties/new">Publicar Propiedad</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Propiedad</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Publicacion</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Precio</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Destacar</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Fecha</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.map((property) => {
                  console.log("[PropertiesTable] property row:", {
                    id: property.id,
                    status: property.status,
                    publication_status: (property as any).publication_status,
                    is_featured_paid: (property as any).is_featured_paid,
                    featured_until: (property as any).featured_until,
                    price: property.price,
                    title: property.title,
                    city: property.city,
                  })

                  const primaryImage = property.property_images?.find((img) => img.is_primary)
                  const imageUrl = primaryImage?.image_url || property.property_images?.[0]?.image_url

                  return (
                    <tr key={property.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                            {imageUrl ? (
                              <Image
                                src={imageUrl || "/placeholder.svg"}
                                alt={property.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{property.title}</p>
                            <p className="text-sm text-muted-foreground">{property.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{statusLabels[property.status]}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const pubStatus = (property as any).publication_status || "pending_payment"
                          const config = publicationStatusConfig[pubStatus] || publicationStatusConfig.pending_payment
                          return (
                            <div className="flex flex-col gap-2">
                              <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                                {config.icon}
                                {config.label}
                              </Badge>
                              {pubStatus === "pending_payment" && (
                                <>
                                  <BoldPaymentButton
                                    propertyId={property.id}
                                    propertyTitle={property.title}
                                    amount={1000}
                                    paymentType="publication"
                                  />
                                  {/* fake button for local testing
                                  <FakeBoldPaymentButton
                                    propertyId={property.id}
                                    propertyTitle={property.title}
                                    amount={1000}
                                    paymentType="publication"
                                  />
                                  */}
                                </>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-accent">{formatPrice(property.price)}</p>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const isFeaturedPaid = (property as any).is_featured_paid
                          const featuredUntil = (property as any).featured_until
                          const isActive = isFeaturedPaid && featuredUntil && new Date(featuredUntil) > new Date()
                          const pubStatus = (property as any).publication_status || "pending_payment"

                          if (isActive) {
                            return (
                              <Badge variant="default" className="flex items-center gap-1 w-fit bg-[#181A20] text-white">
                                <Star className="h-3 w-3 fill-current" />
                                Destacada
                              </Badge>
                            )
                          }

                          if (pubStatus === "published") {
                            return (
                              <>
                                <BoldPaymentButton
                                  propertyId={property.id}
                                  propertyTitle={property.title}
                                  amount={1000}
                                  paymentType="featured"
                                />
                                {/* fake button for local testing
                                <FakeBoldPaymentButton
                                  propertyId={property.id}
                                  propertyTitle={property.title}
                                  amount={100000}
                                  paymentType="featured"
                                />
                                */}
                              </>
                            )
                          }

                          return (
                            <span className="text-xs text-muted-foreground">Publica primero</span>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(property.created_at).toLocaleDateString("es-CO")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/properties/${property.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/properties/${property.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(property.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la propiedad y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
