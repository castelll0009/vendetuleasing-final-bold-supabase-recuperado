'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type PaymentState = 'loading' | 'success' | 'error' | 'pending' | 'rejected'

export default function PaymentResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<PaymentState>('loading')
  const [message, setMessage] = useState('Procesando pago...')

  useEffect(() => {
    const txStatus = searchParams.get('bold-tx-status')
    const orderId = searchParams.get('bold-order-id') || searchParams.get('order-id') || ''

    console.log('[PaymentResult] Parámetros:', { txStatus, orderId })

    if (!txStatus || !orderId) {
      setState('error')
      setMessage('No se recibió información del pago.')
      return
    }

    // Parseo simple y efectivo para tu formato real
    let propertyId = ''
    if (orderId.includes('-')) {
      propertyId = orderId.split('-').slice(1).join('-') // quita prefijo PUBLICATION-
    } else {
      propertyId = orderId // si viene solo el UUID
    }

    console.log('[PaymentResult] ID extraído:', propertyId)

    if (!propertyId) {
      setState('error')
      setMessage('No se pudo identificar la propiedad.')
      return
    }

    const process = async () => {
      const supabase = createClient()

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No autenticado')

        console.log('[PaymentResult] Usuario:', user.id)

        // Buscar propiedad
        const { data: prop, error: propErr } = await supabase
          .from('properties')
          .select('user_id')
          .eq('id', propertyId)
          .single()

        if (propErr) throw new Error('Error buscando propiedad: ' + propErr.message)
        if (!prop) throw new Error('Propiedad no encontrada')
        if (prop.user_id !== user.id) throw new Error('Propiedad no pertenece al usuario')

        console.log('[PaymentResult] Propiedad OK')

        if (txStatus === 'approved') {
          const { error: updateErr } = await supabase
            .from('properties')
            .update({
              publication_status: 'published',
              bold_payment_status: 'approved',
              paid_at: new Date().toISOString(),
            })
            .eq('id', propertyId)

          if (updateErr) throw new Error('Error actualizando: ' + updateErr.message)

          console.log('[PaymentResult] Actualizado a published OK')

          setState('success')
          setMessage('¡Pago confirmado! Tu propiedad ya está publicada.')

          setTimeout(() => router.push('/dashboard/properties'), 4000)
        } else if (txStatus === 'rejected') {
          setState('rejected')
          setMessage('Pago rechazado.')
        } else {
          setState('pending')
          setMessage('Pago pendiente.')
        }
      } catch (err: any) {
        console.error('[PaymentResult] ERROR:', err.message)
        setState('error')
        setMessage('Error al procesar: ' + (err.message || 'desconocido'))
      }
    }

    process()
  }, [searchParams, router])

  const states = {
    loading: { icon: <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />, title: 'Procesando...', color: 'text-muted-foreground' },
    success: { icon: <CheckCircle className="h-16 w-16 text-green-600" />, title: '¡Éxito!', color: 'text-green-600' },
    rejected: { icon: <XCircle className="h-16 w-16 text-destructive" />, title: 'Rechazado', color: 'text-destructive' },
    pending: { icon: <Clock className="h-16 w-16 text-amber-500" />, title: 'Pendiente', color: 'text-amber-500' },
    error: { icon: <XCircle className="h-16 w-16 text-destructive" />, title: 'Error', color: 'text-destructive' },
  }

  const current = states[state]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {current.icon}
          <h1 className={`text-3xl font-bold ${current.color}`}>{current.title}</h1>
          <p className="text-lg">{message}</p>

          <div className="flex flex-col gap-4 mt-8">
            <Button asChild className="bg-accent hover:bg-accent/90 text-white">
              <a href="/dashboard/properties">Ir a Mis Propiedades</a>
            </Button>

            {(state === 'rejected' || state === 'error') && (
              <Button variant="outline" asChild>
                <a href="/dashboard/properties/new">Intentar publicar de nuevo</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}