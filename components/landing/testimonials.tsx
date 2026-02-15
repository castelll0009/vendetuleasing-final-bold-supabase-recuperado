import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "María González",
    company: "Propietaria",
    rating: 5,
    text: "Diseño increíble, fácil de personalizar y una calidad de diseño superlativa. La plataforma en la nube optimiza el rendimiento. No nos desviamos de nuestros diseños originales.",
    avatar: "/diverse-woman-portrait.png",
  },
  {
    name: "Carlos Rodríguez",
    company: "Inversionista",
    rating: 5,
    text: "Diseño increíble, fácil de personalizar y una calidad de diseño superlativa. La plataforma en la nube optimiza el rendimiento. No nos desviamos de nuestros diseños originales.",
    avatar: "/man.jpg",
  },
  {
    name: "Ana Martínez",
    company: "Agente Inmobiliaria",
    rating: 5,
    text: "Diseño increíble, fácil de personalizar y una calidad de diseño superlativa. La plataforma en la nube optimiza el rendimiento. No nos desviamos de nuestros diseños originales.",
    avatar: "/professional-woman.png",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 text-foreground flex flex-wrap justify-center items-center gap-3">
            La gente ama vivir con
            <span className="flex items-center gap-3 text-accent">
              <img
                src="/only-logo.png"
                alt="Logo Vende Tu Leasing"
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain"
              />
              Vende Tu Leasing
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Testimonios de nuestros clientes satisfechos
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-6 text-muted-foreground text-pretty">
                  {testimonial.text}
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
