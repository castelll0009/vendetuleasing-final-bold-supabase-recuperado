"use client"

import { useState } from "react"  // ← ¡Importantísimo!

import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X, Star } from 'lucide-react'

interface ImageUploaderProps {
  onImagesChange: (images: Array<{ url: string; isPrimary: boolean }>) => void
  initialImages?: Array<{ url: string; isPrimary: boolean }>
}

export function CloudinaryImageUploader({ 
  onImagesChange, 
  initialImages = [] 
}: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; isPrimary: boolean }>>(initialImages)

  const handleUpload = (result: any) => {
    const secureUrl = result?.info?.secure_url
    if (!secureUrl) return

    const newImage = { 
      url: secureUrl, 
      isPrimary: uploadedImages.length === 0 
    }

    const updated = [...uploadedImages, newImage]
    setUploadedImages(updated)
    onImagesChange(updated)
  }

  const removeImage = (index: number) => {
    const updated = uploadedImages.filter((_, i) => i !== index)
    if (uploadedImages[index]?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true
    }
    setUploadedImages(updated)
    onImagesChange(updated)
  }

  const setPrimary = (index: number) => {
    const updated = uploadedImages.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }))
    setUploadedImages(updated)
    onImagesChange(updated)
  }

  return (
    <div className="space-y-4">
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        onSuccess={handleUpload}
        options={{
          multiple: true,
          maxFiles: 20,
          resourceType: "image",
        }}
      >
        {({ open }) => (
          <Button type="button" onClick={() => open()} variant="outline" className="w-full">
            Subir imágenes a Cloudinary
          </Button>
        )}
      </CldUploadWidget>

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((img, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={img.url}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              {img.isPrimary && (
                <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" />
                  Principal
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                {!img.isPrimary && (
                  <Button size="sm" onClick={() => setPrimary(index)}>
                    <Star className="h-4 w-4 mr-1" />
                    Principal
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => removeImage(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadedImages.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {uploadedImages.length} imagen{uploadedImages.length > 1 ? 'es' : ''} subida{uploadedImages.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
