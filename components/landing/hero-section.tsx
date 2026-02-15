"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { PropertyAutocomplete } from "@/components/properties/property-autocomplete"

export function   HeroSection() {
  const [searchType, setSearchType] = useState("for_sale")
  const router = useRouter()

  const handleSearch = (query: string) => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    params.set("status", searchType)
    router.push(`/properties?${params.toString()}`)
  }

  const handleAdvancedSearch = () => {
    router.push("/properties?advanced=true")
  }

  return (
    <section
      className="relative h-[100vh] bg-cover bg-center bg-no-repeat flex items-center"
      style={{ backgroundImage: "url('/hero.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#181A20]/20"></div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/hero-brand.png"
              alt="Vende Tu Leasing Logo"
              width={450}
              height={150}
              className="h-24 md:h-36 w-auto"
              priority
            />
          </div>

          {/* Hero Text */}
          <p className="text-lg md:text-xl mb-8 text-white/90 text-pretty font-inter">
            Encuentra la propiedad ideal entre nuestro amplio catálogo de inmuebles disponibles.
          </p>

          <div className="w-full max-w-3xl">
            <Tabs value={searchType} onValueChange={setSearchType} className="mb-4">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-white/10 backdrop-blur-sm">
                <TabsTrigger
                  value="for_sale"
                  className="data-[state=active]:bg-[#ff8414] data-[state=active]:text-white text-white/80"
                >
                  Comprar
                </TabsTrigger>
                <TabsTrigger
                  value="sold"
                  className="data-[state=active]:bg-[#ff8414] data-[state=active]:text-white text-white/80"
                >
                  Vendido
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-3">
                <PropertyAutocomplete
                  onSearch={handleSearch}
                  placeholder="Ingresa dirección, ciudad o código postal..."
                  status={searchType}
                />
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAdvancedSearch}
                  className="h-12 gap-2 bg-white hover:bg-gray-50 text-[#181A20] border-gray-300"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Avanzado
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#181A20]/50 to-transparent pointer-events-none" />
    </section>
  )
}
