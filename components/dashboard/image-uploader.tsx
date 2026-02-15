"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Star } from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  onImagesChange: (images: Array<{ file: File; isPrimary: boolean }>) => void
}

export function ImageUploader({ onImagesChange }: ImageUploaderProps) {
  const [images, setImages] = useState<Array<{ file: File; isPrimary: boolean; preview: string }>>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const preview = event.target?.result as string
        setImages((prev) => {
          const newImages = [...prev, { file, preview, isPrimary: prev.length === 0 }]
          onImagesChange(newImages.map(({ file, isPrimary }) => ({ file, isPrimary })))
          return newImages
        })
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index)

      // Si se elimina la imagen principal, hacer la primera imagen como principal
      if (prev[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true
      }

      onImagesChange(newImages.map(({ file, isPrimary }) => ({ file, isPrimary })))
      return newImages
    })
  }

  const setPrimaryImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
      onImagesChange(newImages.map(({ file, isPrimary }) => ({ file, isPrimary })))
      return newImages
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Imágenes de la Propiedad</h3>

      {/* Upload Area */}
      <Card className="border-2 border-dashed p-6">
        <label className="flex flex-col items-center justify-center cursor-pointer gap-2">
          <Upload className="h-8 w-8 text-accent" />
          <span className="text-sm font-medium">Sube tus imágenes aquí</span>
          <span className="text-xs text-muted-foreground">o haz clic para seleccionar</span>
          <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
        </label>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={image.preview || "/placeholder.svg"}
                  alt={`Preview ${index}`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" />
                  Principal
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {!image.isPrimary && (
                  <Button size="sm" variant="secondary" onClick={() => setPrimaryImage(index)} className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Principal
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => removeImage(index)} className="text-xs">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Message */}
      {images.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No has agregado imágenes aún. ¡Añade al menos una para que tu propiedad sea más atractiva!
        </p>
      )}

      {images.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {images.length} imagen{images.length !== 1 ? "es" : ""} cargada{images.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}
