import { Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const videos = [
  {
    id: 1,
    title: "¿Qué es el Leasing Habitacional?",
    description: "Aprende los conceptos básicos del leasing habitacional y cómo funciona",
    thumbnail: "/modern-house-exterior.png",
    duration: "5:30",
  },
  {
    id: 2,
    title: "Cómo Publicar tu Propiedad",
    description: "Guía paso a paso para publicar tu propiedad en nuestra plataforma",
    thumbnail: "/person-using-laptop-real-estate.jpg",
    duration: "8:15",
  },
  {
    id: 3,
    title: "Proceso de Compra",
    description: "Conoce todo el proceso desde la búsqueda hasta la firma del contrato",
    thumbnail: "/signing-contract-house-keys.jpg",
    duration: "10:45",
  },
  {
    id: 4,
    title: "Beneficios del Leasing",
    description: "Descubre las ventajas fiscales y financieras del leasing habitacional",
    thumbnail: "/financial-benefits-calculator.jpg",
    duration: "6:20",
  },
]

export function ExplanatoryVideos() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-poppins text-3xl md:text-4xl font-bold text-foreground mb-4">Videos Explicativos</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Aprende todo sobre el proceso de compra, venta y leasing habitacional con nuestros videos educativos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-poppins font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
