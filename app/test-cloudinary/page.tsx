"use client"
import { CldUploadWidget } from 'next-cloudinary'

export default function TestPage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl mb-6">Prueba Cloudinary</h1>
      <CldUploadWidget
        uploadPreset="properties_unsigned"
        onSuccess={(result) => {
          alert("¡Éxito! URL: " + result?.info?.secure_url)
          console.log(result?.info)
        }}
        onError={(error) => {
          alert("Error: " + JSON.stringify(error))
        }}
      >
        {({ open }) => (
          <button
            onClick={open}
            className="px-6 py-3 bg-blue-600 text-white rounded"
          >
            Probar subida
          </button>
        )}
      </CldUploadWidget>
    </div>
  )
}
