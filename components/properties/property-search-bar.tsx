"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyAutocomplete } from "./property-autocomplete"

interface PropertySearchBarProps {
  initialQuery?: string
  initialStatus?: string
}

export function PropertySearchBar({ initialQuery = "", initialStatus = "for_sale" }: PropertySearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchStatus, setSearchStatus] = useState(initialStatus)

  useEffect(() => {
    setSearchStatus(initialStatus)
  }, [initialStatus])

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (query) {
      params.set("q", query)
    } else {
      params.delete("q")
    }

    if (searchStatus) {
      params.set("status", searchStatus)
    }

    router.push(`/properties?${params.toString()}`)
  }

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="w-full space-y-4">
      <Tabs value={searchStatus} onValueChange={setSearchStatus} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted">
          <TabsTrigger value="for_sale" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            Comprar
          </TabsTrigger>
          <TabsTrigger value="sold" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            Vendido
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-2">
        <PropertyAutocomplete
          onSearch={handleSearch}
          placeholder="Buscar por dirección, ciudad o código postal..."
          status={searchStatus}
        />
        <Button variant="outline" onClick={handleClear} className="h-12 bg-transparent">
          Limpiar
        </Button>
      </div>
    </div>
  )
}
