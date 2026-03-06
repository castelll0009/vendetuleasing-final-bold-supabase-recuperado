// components/landing/featured-properties-carousel.tsx
"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, FreeMode } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/free-mode"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Maximize } from "lucide-react"
import Link from "next/link"

interface Property {
  id: string
  title: string
  price: number
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  address?: string
  city: string
  primary_image_url: string
  status?: string
}

interface FeaturedPropertiesCarouselProps {
  properties: Property[]
}

export function FeaturedPropertiesCarousel({ properties }: FeaturedPropertiesCarouselProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)

  return (
    <>
      <style jsx global>{`
        .swiper {
          overflow: visible !important;
        }
        
        .swiper-button-next,
        .swiper-button-prev {
          color: hsl(var(--accent)) !important;
          background: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          top: 40%;
          transform: translateY(-50%);
          z-index: 20;
        }
        
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: hsl(var(--accent));
          color: white !important;
          transform: translateY(-50%) scale(1.1);
        }
        
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 12px !important;
          font-weight: 900;
        }
        
        .swiper-button-next {
          right: -16px;
        }
        
        .swiper-button-prev {
          left: -16px;
        }
        
        .swiper-button-disabled {
          opacity: 0.3 !important;
          cursor: not-allowed;
        }
        
        .swiper-pagination {
          position: relative;
          margin-top: 1.5rem;
          bottom: 0 !important;
        }
        
        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: hsl(var(--muted-foreground)) !important;
          opacity: 0.3;
          margin: 0 4px !important;
        }
        
        .swiper-pagination-bullet-active {
          background: hsl(var(--accent)) !important;
          opacity: 1;
          width: 20px;
          border-radius: 4px;
        }
      `}</style>

      <div className="relative px-4 md:px-8">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, FreeMode]}
          freeMode={{
            enabled: true,
            sticky: false,
            momentumRatio: 0.5,
            momentumVelocityRatio: 0.5,
          }}
          spaceBetween={20}
          slidesPerView="auto"
          resistance={true}
          resistanceRatio={0.5}
          pagination={{ 
            clickable: true,
            dynamicBullets: properties.length > 10,
          }}
          navigation={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={400}
          watchOverflow={true}
          className="!overflow-visible"
        >
          {properties.map((property) => (
            <SwiperSlide 
              key={property.id} 
              className="!w-[280px] sm:!w-[320px] md:!w-[340px] lg:!w-[360px]"
            >
              <Link href={`/properties/${property.id}`} className="block group">
                <div className="relative overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 bg-card border border-border">
                  {/* Imagen */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={property.primary_image_url}
                      alt={property.title}
                      fill
                      sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 360px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={properties.indexOf(property) < 4}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge className="bg-accent hover:bg-accent text-white text-sm px-3 py-1 mb-1 shadow-lg font-bold">
                        {formatPrice(property.price)}
                      </Badge>
                      <h3 className="text-white text-base font-semibold line-clamp-2 drop-shadow-md mt-1">
                        {property.title}
                      </h3>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-accent" />
                      <span className="line-clamp-1 text-xs">
                        {property.address ? `${property.address}, ` : ""}{property.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-foreground">
                      {property.bedrooms !== undefined && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-accent" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms !== undefined && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-accent" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.square_feet !== undefined && (
                        <div className="flex items-center gap-1">
                          <Maximize className="h-3.5 w-3.5 text-accent" />
                          <span>{property.square_feet}m²</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  )
}