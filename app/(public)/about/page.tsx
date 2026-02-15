import { Target, Eye, Award, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Misión",
      description:
        "Facilitar el acceso a la vivienda propia mediante soluciones innovadoras de leasing habitacional y servicios inmobiliarios de calidad.",
    },
    {
      icon: Eye,
      title: "Visión",
      description:
        "Ser la plataforma líder en Colombia para transacciones inmobiliarias, reconocida por nuestra transparencia y excelencia en el servicio.",
    },
    {
      icon: Award,
      title: "Valores",
      description:
        "Integridad, transparencia, innovación y compromiso con nuestros clientes son los pilares que guían cada una de nuestras acciones.",
    },
    {
      icon: Users,
      title: "Equipo",
      description:
        "Contamos con un equipo de profesionales altamente capacitados y comprometidos con ayudarte a alcanzar tus metas inmobiliarias.",
    },
  ]

  return (
    <main className="container mx-auto px-4 py-12 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Quiénes Somos</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Somos una plataforma innovadora dedicada a transformar la experiencia de comprar, vender y arrendar
            propiedades en Colombia
          </p>
        </div>

        <div className="mb-16">
          <img src="/modern-office-space.png" alt="Oficina" className="w-full h-64 object-cover rounded-lg shadow-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {values.map((value, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="font-heading text-xl">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-accent/5 rounded-lg p-8">
          <h2 className="font-heading text-2xl font-bold mb-4 text-center">Nuestra Historia</h2>
          <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground">
            <p>
              Fundada en 2020, Vende Tu Leasing nació con la visión de democratizar el acceso a la vivienda propia en
              Colombia. Identificamos que muchas familias enfrentaban barreras para acceder a créditos hipotecarios
              tradicionales, y vimos en el leasing habitacional una solución innovadora.
            </p>
            <p>
              Desde entonces, hemos ayudado a más de 5,000 familias a encontrar su hogar ideal y hemos facilitado
              transacciones por más de $500,000 millones de pesos. Nuestro compromiso es seguir innovando y mejorando
              nuestros servicios para hacer realidad el sueño de la vivienda propia.
            </p>
            <p>
              Hoy, somos más que una plataforma inmobiliaria: somos un aliado confiable en uno de los momentos más
              importantes de tu vida.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
