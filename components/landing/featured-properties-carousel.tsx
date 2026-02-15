"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import { PropertyCard } from "@/components/properties/property-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface CarouselProps {
  properties: any[]
}

export function FeaturedPropertiesCarousel({ properties }: CarouselProps) {
  if (!properties || properties.length === 0) return null

  return (
    <div className="relative">
      {/* Botón PREV personalizado */}
      <button
        className="
          prevButton
          hidden md:flex
          absolute left-0 top-1/2 -translate-y-1/2 z-40
          bg-accent text-white p-3 rounded-full shadow-lg
          hover:bg-accent/90 transition
        "
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Botón NEXT personalizado */}
      <button
        className="
          nextButton
          hidden md:flex
          absolute right-0 top-1/2 -translate-y-1/2 z-40
          bg-accent text-white p-3 rounded-full shadow-lg
          hover:bg-accent/90 transition
        "
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".nextButton",
          prevEl: ".prevButton",
        }}
        pagination={{ clickable: true }}
        grabCursor={true}
        spaceBetween={16}
        breakpoints={{
          0: { slidesPerView: 1.05 },
          640: { slidesPerView: 1.3 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="!pb-12"
      >
        {properties.map((property) => (
          <SwiperSlide key={property.id}>
            <div className="h-full">
              <PropertyCard property={property} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
