import { Shield, TrendingUp, Users, Clock, Award, HeadphonesIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BenefitsPage() {
  const benefits = [
    {
      icon: Shield,
      title: "Transacciones Seguras",
      description: "Todas las transacciones están protegidas con los más altos estándares de seguridad",
    },
    {
      icon: TrendingUp,
      title: "Mejor Rentabilidad",
      description: "Maximiza el retorno de tu inversión con nuestras herramientas de análisis",
    },
    {
      icon: Users,
      title: "Red de Expertos",
      description: "Accede a una red de profesionales inmobiliarios certificados",
    },
    {
      icon: Clock,
      title: "Proceso Rápido",
      description: "Agilizamos todos los trámites para que cierres más rápido",
    },
    {
      icon: Award,
      title: "Garantía de Calidad",
      description: "Todas las propiedades son verificadas por nuestro equipo",
    },
    {
      icon: HeadphonesIcon,
      title: "Soporte 24/7",
      description: "Estamos disponibles para ayudarte en cualquier momento",
    },
  ]

  return (
    <main className="container mx-auto px-4 py-12 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Beneficios</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre todas las ventajas de usar Vende Tu Leasing para tus transacciones inmobiliarias
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="font-heading text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-accent/5 rounded-lg p-8 text-center">
          <h2 className="font-heading text-2xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-muted-foreground mb-6">Únete a miles de usuarios que ya confían en nosotros</p>
          <a
            href="/auth/sign-up"
            className="inline-block bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Registrarse Gratis
          </a>
        </div>
      </div>
    </main>
  )
}
