'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Home, MapPin, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'  // opcional

const API_KEY = 'KeXJ3hJ1V7UuaTMGwFjFzMd679gFAaF3OEayjcd9OPA'
const SECRET_KEY = 'Pr1XTpBRgvHE3nvFmJEwLw'
const AMOUNT = 50000

export default function DemoContent() {
  const searchParams = useSearchParams()
  const [orderId] = useState(() => `PROP-${Date.now()}`)
  const [signature, setSignature] = useState<string>('')
  const [status, setStatus] = useState<'pending' | 'paid'>('pending')

  // Detectar pago exitoso después de redirección
  useEffect(() => {
    const txStatus = searchParams.get('bold-tx-status')
    if (txStatus === 'approved') {
      setStatus('paid')
      if (toast) toast.success('¡Pago exitoso! Propiedad publicada.', { duration: 6000 })
      sessionStorage.setItem('demo-property-paid', 'true')
    }
  }, [searchParams])

  // Cargar estado guardado
  useEffect(() => {
    if (sessionStorage.getItem('demo-property-paid') === 'true') {
      setStatus('paid')
    }
  }, [])

  // Generar hash SHA-256
  useEffect(() => {
    const generate = async () => {
      const data = `${orderId}${AMOUNT}COP${SECRET_KEY}`
      const encoder = new TextEncoder()
      const buffer = encoder.encode(data)
      try {
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        setSignature(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''))
      } catch (err) {
        console.error('Error hash:', err)
        if (toast) toast.error('Error preparando pago')
      }
    }
    generate()
  }, [orderId])

  // Cargar Bold + insertar botón
  useEffect(() => {
    if (!signature) return

    // Cargar librería Bold (solo una vez)
    if (!document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://checkout.bold.co/library/boldPaymentButton.js'
      script.async = true
      document.head.appendChild(script)
    }

    const btn = document.createElement('script')

    btn.setAttribute('data-bold-button', 'dark-L')
    btn.setAttribute('data-api-key', API_KEY)
    btn.setAttribute('data-order-id', orderId)
    btn.setAttribute('data-amount', AMOUNT.toString())
    btn.setAttribute('data-currency', 'COP')
    btn.setAttribute('data-description', 'Publicación propiedad - Casa Pitalito')
    btn.setAttribute('data-redirection-url', window.location.origin + '/demo-dashboard')
    btn.setAttribute('data-render-mode', 'embedded')
    btn.setAttribute('data-integrity-signature', signature)

    btn.setAttribute('data-customer-data', JSON.stringify({
      email: "demo@ejemplo.com",
      fullName: "Demo User",
      phone: "3101234567",
      dialCode: "+57",
      documentType: "CC",
      documentNumber: "1234567890"
    }))

    const container = document.getElementById('bold-button-container')
    if (container) {
      container.innerHTML = ''
      container.appendChild(btn)
    }

    return () => { if (container) container.innerHTML = '' }
  }, [signature, orderId])

  // JSX (igual que antes, pero sin header para mantenerlo simple)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          Mis Propiedades
          <Badge variant="outline" className={status === 'paid' ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}>
            {status === 'paid' ? 'Publicada' : 'Pendiente de Pago'}
          </Badge>
        </h2>

        <Card className="bg-gray-900 border-gray-800 shadow-2xl">
          <div className="h-64 relative">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Casa"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>

          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle className="text-2xl">Casa Familiar en Pitalito</CardTitle>
                <p className="text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" /> Pitalito, Huila
                </p>
              </div>
              <Badge className={status === 'paid' ? "bg-green-600" : "bg-yellow-600"}>
                {status === 'paid' ? 'Publicada' : 'Pendiente'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><div className="text-gray-400 text-sm">Hab</div><div className="text-xl">3</div></div>
              <div><div className="text-gray-400 text-sm">Baños</div><div className="text-xl">2</div></div>
              <div><div className="text-gray-400 text-sm">m²</div><div className="text-xl">150</div></div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-800 pt-4">
              <div className="text-2xl font-bold text-green-400 flex items-center gap-1">
                <DollarSign /> 350.000.000
              </div>
              <span className="text-gray-400">COP</span>
            </div>

            {status === 'pending' && (
              <div className="pt-4 border-t border-gray-800">
                <p className="text-center mb-4">
                  Paga <strong className="text-orange-400">50.000 COP</strong> para publicar
                </p>
                <div id="bold-button-container" className="min-h-[60px] flex justify-center">
                  {!signature && <Skeleton className="h-12 w-64 bg-gray-800" />}
                </div>
              </div>
            )}

            {status === 'paid' && (
              <div className="text-center pt-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-900/50 border border-green-700 rounded-lg text-green-300">
                  <CheckCircle className="h-5 w-5" /> ¡Publicada exitosamente!
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}