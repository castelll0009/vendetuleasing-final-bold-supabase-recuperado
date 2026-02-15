"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface Property {
  id: string
  title: string
  address: string
  city: string
  price: number
  property_images: { image_url: string; is_primary: boolean }[]
}

interface PropertyAutocompleteProps {
  onSearch: (query: string) => void
  placeholder?: string
  status?: string
}

export function PropertyAutocomplete({
  onSearch,
  placeholder = "Buscar por dirección, ciudad...",
  status = "for_sale",
}: PropertyAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Property[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchProperties = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        setShowDropdown(false)
        return
      }

      setIsLoading(true)
      console.log("[v0] Searching for:", searchQuery, "with status:", status)

      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from("properties")
          .select(`
            id, 
            title, 
            address, 
            city, 
            price,
            property_images(image_url, is_primary)
          `)
          .eq("status", status)
          .or(`title.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
          .limit(5)

        console.log("[v0] Search results:", data, "Error:", error)

        if (error) {
          console.error("[v0] Error searching properties:", error.message)
          setSuggestions([])
          setShowDropdown(false)
        } else if (data && data.length > 0) {
          console.log("[v0] Found", data.length, "properties")
          setSuggestions(data)
          setShowDropdown(true)
        } else {
          console.log("[v0] No properties found")
          setSuggestions([])
          setShowDropdown(true) // Show "no results" message
        }
      } catch (error) {
        console.error("[v0] Error in search:", error)
        setSuggestions([])
        setShowDropdown(false)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProperties, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, status])

  const handleSearch = () => {
    setShowDropdown(false)
    onSearch(searchQuery)
  }

  const handleSelectProperty = (property: Property) => {
    setShowDropdown(false)
    setSearchQuery("")
    router.push(`/properties/${property.id}`)
  }

  const getPrimaryImage = (property: Property) => {
    if (!property.property_images || property.property_images.length === 0) {
      return null
    }
    const primaryImage = property.property_images.find((img) => img.is_primary)
    return primaryImage?.image_url || property.property_images[0]?.image_url || null
  }

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch()
          }
        }}
        className="pl-10 h-12"
      />

      {showDropdown && searchQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {isLoading && <div className="p-4 text-center text-sm text-muted-foreground">Buscando propiedades...</div>}

          {!isLoading &&
            suggestions.length > 0 &&
            suggestions.map((property) => {
              const imageUrl = getPrimaryImage(property)
              return (
                <button
                  key={property.id}
                  onClick={() => handleSelectProperty(property)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={property.title}
                      width={60}
                      height={60}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{property.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3" />
                      {property.address}, {property.city}
                    </p>
                    <p className="text-sm font-semibold text-[#ff8414] mt-1">${property.price.toLocaleString()}</p>
                  </div>
                </button>
              )
            })}

          {!isLoading && suggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No se encontraron propiedades que coincidan con "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
