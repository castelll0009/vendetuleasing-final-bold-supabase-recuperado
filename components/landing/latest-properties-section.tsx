// components/landing/latest-properties-section.tsx
"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Search, Home, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function LatestPropertiesSection() {
  const benefits = [
    {
      icon: Search,
      title: "Búsqueda Inteligente",
      description: "Filtra por precio, ubicación, habitaciones y más para encontrar exactamente lo que necesitas."
    },
    {
      icon: Home,
      title: "Propiedades Verificadas",
      description: "Todas nuestras propiedades son revisadas y verificadas para tu tranquilidad."
    },
    {
      icon: TrendingUp,
      title: "Mejores Precios",
      description: "Accede a oportunidades exclusivas de leasing con las mejores condiciones del mercado."
    },
    {
      icon: Shield,
      title: "Proceso Seguro",
      description: "Acompañamiento legal y financiero durante todo el proceso de arrendamiento."
    }
  ]

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6">
              Catálogo Completo
            </span>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Encuentra tu{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">
                propiedad ideal
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explora nuestra amplia selección de propiedades en leasing. 
              Desde apartamentos modernos hasta casas familiares, 
              tenemos la opción perfecta para ti.
            </p>
          </motion.div>
        </div>

        {/* Grid de beneficios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-accent/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                <benefit.icon className="h-6 w-6 text-accent group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-2 rounded-full bg-muted/50 border border-border">
            <Button 
              asChild 
              size="lg" 
              className="h-14 px-10 text-lg font-semibold bg-accent hover:bg-accent/90 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              <Link href="/properties" className="flex items-center gap-3">
                <Search className="h-5 w-5" />
                Explorar Propiedades
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <span className="text-sm text-muted-foreground px-4 hidden sm:inline">
             propiedades en leasing, actualizadas diariamente
            </span>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Actualizado diariamente • Propiedades destacadas • Sin comisiones ocultas
          </p>
        </motion.div>

        {/* Estadísticas de confianza */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 pt-12 border-t border-border/50"
        >
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">150+</div>
              <div className="text-sm text-muted-foreground mt-1">Propiedades Activas</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Clientes Satisfechos</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">98%</div>
              <div className="text-sm text-muted-foreground mt-1">Tasa de Éxito</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">24h</div>
              <div className="text-sm text-muted-foreground mt-1">Respuesta Garantizada</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}