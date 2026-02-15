import { Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function VideosPage() {
  const videos = [
    {
      id: 1,
      title: "Cómo comprar tu primera propiedad",
      description: "Aprende el proceso completo para adquirir tu primera vivienda",
      thumbnail: "/cozy-suburban-house.png",
      duration: "8:45",
    },
    {
      id: 2,
      title: "Guía de leasing habitacional",
      description: "Todo lo que necesitas saber sobre el leasing habitacional",
      thumbnail: "/contract-document.png",
      duration: "12:30",
    },
    {
      id: 3,
      title: "Consejos para vender rápido",
      description: "Estrategias efectivas para vender tu propiedad",
      thumbnail: "/sold.jpg",
      duration: "6:15",
    },
    {
      id: 4,
      title: "Inversión en bienes raíces",
      description: "Cómo invertir inteligentemente en propiedades",
      thumbnail: "/investment-growth.png",
      duration: "15:20",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Videos Explicativos</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Aprende todo sobre el proceso de compra, venta y leasing de propiedades
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <div className="bg-accent rounded-full p-4">
                      <Play className="h-8 w-8 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-heading text-lg font-semibold mb-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
