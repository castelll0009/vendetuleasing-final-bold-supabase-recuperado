'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Home, MapPin, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'  // opcional: npm install sonner

const API_KEY = 'KeXJ3hJ1V7UuaTMGwFjFzMd679gFAaF3OEayjcd9OPA'
const SECRET_KEY = 'Pr1XTpBRgvHE3nvFmJEwLw'
const AMOUNT = 50000  // 50.000 COP

export default function DemoDashboard() {
  const searchParams = useSearchParams()
  const [orderId] = useState(() => `PROP-${Date.now()}`)
  const [signature, setSignature] = useState<string>('')
  const [status, setStatus] = useState<'pending' | 'paid'>('pending')

  // Detectar si ya se pagó (vía query string después de redirección)
  useEffect(() => {
    const txStatus = searchParams.get('bold-tx-status')
    if (txStatus === 'approved') {
      setStatus('paid')
      toast.success('¡Pago exitoso! La propiedad ahora está publicada.', {
        duration: 6000,
      })
      // Opcional: guardar en sessionStorage para que persista al refresh
      sessionStorage.setItem('demo-property-paid', 'true')
    }
  }, [searchParams])

  // Cargar estado desde sessionStorage al montar
  useEffect(() => {
    if (sessionStorage.getItem('demo-property-paid') === 'true') {
      setStatus('paid')
    }
  }, [])

  // Generar hash de integridad (SHA-256)
  useEffect(() => {
    const generateSignature = async () => {
      const data = `${orderId}${AMOUNT}COP${SECRET_KEY}`
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      try {
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        setSignature(hashHex)
      } catch (err) {
        console.error('Error generando hash:', err)
        toast.error('Error al preparar el botón de pago')
      }
    }

    generateSignature()
  }, [orderId])

  // Cargar librería de Bold + insertar el botón cuando tengamos signature
  useEffect(() => {
    if (!signature) return

    // Cargar el script de Bold solo una vez
    if (!document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://checkout.bold.co/library/boldPaymentButton.js'
      script.async = true
      document.head.appendChild(script)
    }

    // Crear el <script> del botón
    const buttonScript = document.createElement('script')

    buttonScript.setAttribute('data-bold-button', 'dark-L')
    buttonScript.setAttribute('data-api-key', API_KEY)
    buttonScript.setAttribute('data-order-id', orderId)
    buttonScript.setAttribute('data-amount', AMOUNT.toString())
    buttonScript.setAttribute('data-currency', 'COP')
    buttonScript.setAttribute('data-description', 'Publicación de propiedad - Casa Familiar en Pitalito')
    buttonScript.setAttribute('data-redirection-url', window.location.origin + '/demo-dashboard')
    buttonScript.setAttribute('data-render-mode', 'embedded')
    buttonScript.setAttribute('data-integrity-signature', signature)

    // Datos prellenados (opcional pero mejora UX)
    buttonScript.setAttribute('data-customer-data', JSON.stringify({
      email: "demo@ejemplo.com",
      fullName: "Usuario Demo",
      phone: "3101234567",
      dialCode: "+57",
      documentType: "CC",
      documentNumber: "1234567890"
    }))

    const container = document.getElementById('bold-button-container')
    if (container) {
      container.innerHTML = ''
      container.appendChild(buttonScript)
    }

    return () => {
      // Limpieza opcional
      if (container) container.innerHTML = ''
    }
  }, [signature, orderId])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-2xl">
              VT
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-500">Vende Tu Leasing</h1>
          </div>
          <Button variant="outline" className="border-orange-600 text-orange-400 hover:bg-orange-950">
            Propiedades Publicadas
          </Button>
        </header>

        <main>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            Mis Propiedades
            <Badge variant="outline" className={status === 'paid' ? "bg-green-900 text-green-300 border-green-700" : "bg-yellow-900 text-yellow-300 border-yellow-700"}>
              {status === 'paid' ? 'Publicada' : '1 Pendiente de Pago'}
            </Badge>
          </h2>

          <Card className="bg-gray-900 border-gray-800 shadow-2xl max-w-3xl mx-auto overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-700 relative">
              {/* Imagen placeholder - puedes reemplazar con una URL real */}
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Casa en Pitalito"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Casa Familiar en Pitalito</CardTitle>
                  <CardDescription className="text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Pitalito, Huila, Colombia
                  </CardDescription>
                </div>
                <Badge className={status === 'paid' ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}>
                  {status === 'paid' ? (
                    <>Publicada <CheckCircle className="ml-1 h-4 w-4" /></>
                  ) : (
                    <>Pendiente <AlertCircle className="ml-1 h-4 w-4" /></>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-gray-400 text-sm">Habitaciones</div>
                  <div className="text-xl font-bold">3</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Baños</div>
                  <div className="text-xl font-bold">2</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Área</div>
                  <div className="text-xl font-bold">150 m²</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                <div className="flex items-center gap-2 text-2xl font-bold text-green-400">
                  <DollarSign className="h-6 w-6" />
                  350.000.000
                </div>
                <div className="text-sm text-gray-400">COP</div>
              </div>

              <p className="text-gray-300 text-sm">
                Hermosa casa moderna con jardín amplio, cocina integral, garaje doble y excelente ubicación cerca de colegios y centros comerciales.
              </p>

              {status === 'pending' && (
                <div className="pt-6 border-t border-gray-800">
                  <p className="text-center text-lg mb-4">
                    Para publicar esta propiedad paga la tarifa de <strong className="text-orange-400">50.000 COP</strong>
                  </p>

                  <div id="bold-button-container" className="min-h-[60px] flex justify-center items-center">
                    {!signature && <Skeleton className="h-12 w-64 rounded-lg bg-gray-800" />}
                  </div>
                </div>
              )}

              {status === 'paid' && (
                <div className="pt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-900/50 border border-green-700 rounded-lg text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    Propiedad publicada exitosamente
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}