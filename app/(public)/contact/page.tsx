import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Contacto</h1>
          <p className="text-lg text-muted-foreground">
            Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-heading text-xl">Teléfono</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">+57 (1) 234 5678</p>
              <p className="text-muted-foreground">+57 300 123 4567</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-heading text-xl">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">info@vendetuleasing.com</p>
              <p className="text-muted-foreground">soporte@vendetuleasing.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-heading text-xl">Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Calle 100 #15-20</p>
              <p className="text-muted-foreground">Bogotá, Colombia</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Envíanos un mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Nombre completo
                  </label>
                  <Input id="name" placeholder="Tu nombre" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="tu@email.com" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Teléfono
                  </label>
                  <Input id="phone" placeholder="+57 300 123 4567" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Mensaje
                  </label>
                  <Textarea id="message" placeholder="¿En qué podemos ayudarte?" rows={4} />
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90 text-white">Enviar Mensaje</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Horario de atención</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Lunes a Viernes</p>
                  <p className="text-muted-foreground">8:00 AM - 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Sábados</p>
                  <p className="text-muted-foreground">9:00 AM - 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Domingos</p>
                  <p className="text-muted-foreground">Cerrado</p>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Para emergencias fuera del horario de atención, contáctanos al WhatsApp: +57 300 123 4567
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
