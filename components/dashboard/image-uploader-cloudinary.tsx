// components/dashboard/image-uploader-cloudinary.tsx
"use client"

import { useState, useEffect } from "react"
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X, Star, Upload } from 'lucide-react'

interface ImageUploaderProps {
  onImagesChange: (images: Array<{ url: string; isPrimary: boolean }>) => void
  initialImages?: Array<{ url: string; isPrimary: boolean }>
}

export function CloudinaryImageUploader({ 
  onImagesChange, 
  initialImages 
}: ImageUploaderProps) {
  // ✅ SIEMPRE inicializar como array vacío si no viene nada
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; isPrimary: boolean }>>([])

  // ✅ useEffect que SIEMPRE sincroniza, sin importar si es vacío o no
  useEffect(() => {
    const images = initialImages || []
    setUploadedImages(images)
  }, [initialImages]) // Dependencia simple

  const handleUpload = (result: any) => {
    console.log("Cloudinary result:", result)
    
    let files: any[] = []
    
    if (result?.info?.files && Array.isArray(result.info.files)) {
      files = result.info.files
    } else if (result?.info?.secure_url) {
      files = [result.info]
    }
    
    console.log("Processing files:", files.length)
    
    const newImages = files
      .filter((file: any) => file?.secure_url)
      .map((file: any) => ({
        url: file.secure_url,
        isPrimary: false
      }))

    if (newImages.length === 0) return

    setUploadedImages(prev => {
      const updated = [...prev, ...newImages]
      // Primera imagen como principal si no hay ninguna
      if (!updated.some(img => img.isPrimary)) {
        updated[0].isPrimary = true
      }
      onImagesChange(updated)
      return updated
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true
      }
      onImagesChange(updated)
      return updated
    })
  }

  const setPrimary = (index: number) => {
    setUploadedImages(prev => {
      const updated = prev.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
      onImagesChange(updated)
      return updated
    })
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
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
          maxFileSize: 10000000,
        }}
      >
        {({ open }) => (
          <Button 
            type="button" 
            onClick={() => open()} 
            variant="outline" 
            className="w-full h-20 border-dashed border-2 hover:border-accent hover:bg-accent/5 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {uploadedImages.length > 0 
                  ? `Agregar más imágenes (${uploadedImages.length})` 
                  : 'Subir imágenes (máx. 20)'}
              </span>
            </div>
          </Button>
        )}
      </CldUploadWidget>

      {uploadedImages.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((img, index) => (
              <div 
                key={`${img.url}-${index}`} 
                className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
                  img.isPrimary ? 'border-accent ring-2 ring-accent/20' : 'border-transparent'
                }`}
              >
                <Image
                  src={img.url}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                
                {img.isPrimary && (
                  <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <Star className="h-3 w-3 fill-white" />
                    Principal
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {!img.isPrimary && (
                    <Button 
                      size="sm" 
                      onClick={() => setPrimary(index)}
                      className="w-full bg-white text-black hover:bg-gray-100"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Principal
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => removeImage(index)}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/70 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <span>
              <strong>{uploadedImages.length}</strong> imagen{uploadedImages.length > 1 ? 'es' : ''}
            </span>
            {uploadedImages.some(img => img.isPrimary) && (
              <span className="text-accent flex items-center gap-1">
                <Star className="h-3 w-3 fill-accent" />
                Principal seleccionada
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}