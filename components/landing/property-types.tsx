import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

const propertyTypes = [
  {
    name: "Casas",
    icon: "/iconos/casa.png",
    count: "22 Propiedades",
    type: "house",
  },
  {
    name: "Apartamentos",
    icon: "/iconos/apartamento.png",
    count: "22 Propiedades",
    type: "apartment",
  },
  {
    name: "Apartaestudio",
    icon: "/iconos/apartaestudio.png",
    count: "22 Propiedades",
    type: "studio",
  },
  {
    name: "Locales",
    icon: "/iconos/local.png",
    count: "22 Propiedades",
    type: "local",
  },
  {
    name: "Bodegas",
    icon: "/iconos/bodega.png",
    count: "22 Propiedades",
    type: "warehouse",
  },
  {
    name: "Oficinas",
    icon: "/iconos/oficina.png",
    count: "22 Propiedades",
    type: "office",
  },
  {
    name: "Edificios",
    icon: "/iconos/edificio.png",
    count: "22 Propiedades",
    type: "building",
  },
  {
    name: "Otros",
    icon: "/iconos/otros.png",
    count: "22 Propiedades",
    type: "other",
  },
]

export function PropertyTypes() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Explora Tipos de Propiedades</h2>
          <p className="mt-4 text-muted-foreground text-lg">Encuentra inspiración entre más de 1800 opciones</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 md:gap-6">
          {propertyTypes.map((type) => (
            <Link key={type.type} href={`/properties?type=${type.type}`} className="group">
              <Card className="transition-all hover:shadow-lg hover:border-accent/50">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-accent/10 p-4 transition-colors group-hover:bg-accent/20">
                    <Image
                      src={type.icon}
                      alt={type.name}
                      width={64}
                      height={64}
                      className="h-12 w-12 sm:h-16 sm:w-16 object-contain text-accent"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground">{type.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{type.count}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
