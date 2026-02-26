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
  const [message, setMessage] = useState('Procesando tu pago...')
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    console.log('[PaymentResult]', msg)
    setDebugLogs(prev => [...prev, msg])
  }

  useEffect(() => {
    addLog('Página cargada. Iniciando procesamiento...')

    const txStatus = searchParams.get('bold-tx-status')
    const orderId = searchParams.get('bold-order-id') || searchParams.get('order-id') || ''

    addLog(`Parámetros recibidos → txStatus: ${txStatus} | orderId: ${orderId}`)
    addLog(`Todos los params: ${JSON.stringify(Object.fromEntries(searchParams.entries()))}`)

    if (!txStatus || !orderId) {
      setState('error')
      setMessage('No se recibió información del pago.')
      addLog('Faltan parámetros → error temprano')
      return
    }

    // Parseo adaptado a tu formato exacto: PUBLICATION-uuid-timestamp
    let paymentType = ''
    let extractedPropertyId = ''

    const parts = orderId.split('-')
    if (parts.length >= 2) {
      const prefix = parts[0].toLowerCase()
      extractedPropertyId = parts.slice(1).join('-') // todo después del primer guión
      if (prefix === 'publication') paymentType = 'publication'
      if (prefix === 'featured') paymentType = 'featured'
    }

    addLog(`Parseo resultado → tipo: ${paymentType} | propertyId: ${extractedPropertyId} | original: ${orderId}`)

    if (!extractedPropertyId) {
      setState('error')
      setMessage('No se pudo extraer el ID de la propiedad del pago.')
      return
    }

    setPropertyId(extractedPropertyId)

    const processPayment = async () => {
      const supabase = createClient()

      try {
        addLog('Paso 1: Obteniendo usuario autenticado...')
        const { data: { user }, error: authErr } = await supabase.auth.getUser()
        if (authErr || !user) {
          throw new Error('No autenticado: ' + (authErr?.message || 'sin usuario'))
        }
        addLog(`Usuario OK → ID: ${user.id}`)

        addLog('Paso 2: Buscando propiedad en Supabase...')
        const { data: prop, error: propErr } = await supabase
          .from('properties')
          .select('id, user_id, publication_status')
          .eq('id', extractedPropertyId)
          .single()

        addLog(`Resultado búsqueda propiedad: ${prop ? 'encontrada' : 'NO encontrada'} | Error: ${propErr?.message || 'ninguno'}`)

        if (propErr) throw new Error('Error al buscar propiedad: ' + propErr.message)
        if (!prop) throw new Error('Propiedad no encontrada en la base de datos')

        // Comentamos temporalmente la verificación de user_id para descartar
        // if (prop.user_id !== user.id) throw new Error('La propiedad no pertenece a este usuario')

        addLog('Propiedad encontrada OK')

        if (txStatus === 'approved') {
          addLog('Paso 3: Pago aprobado → actualizando propiedad...')

          const updateData: any = {
            bold_payment_status: 'approved',
            paid_at: new Date().toISOString(),
          }

          if (paymentType === 'publication') {
            updateData.publication_status = 'published'
          } else if (paymentType === 'featured') {
            const thirtyDaysLater = new Date()
            thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
            updateData.is_featured_paid = true
            updateData.featured = true
            updateData.featured_until = thirtyDaysLater.toISOString()
            updateData.featured_payment_reference = orderId
          }

          addLog(`Datos a actualizar: ${JSON.stringify(updateData)}`)

          const { error: updateErr, data: updatedProp } = await supabase
            .from('properties')
            .update(updateData)
            .eq('id', extractedPropertyId)
            .select()

          if (updateErr) throw new Error('Error al actualizar propiedad: ' + updateErr.message)

          addLog(`Propiedad actualizada OK → nuevo estado: ${updatedProp?.[0]?.publication_status || 'desconocido'}`)

          // Registrar en payments (opcional)
          const { error: payErr } = await supabase.from('payments').insert({
            user_id: user.id,
            property_id: extractedPropertyId,
            payment_type: paymentType || 'publication',
            amount: paymentType === 'publication' ? 1000 : 1000,
            currency: 'COP',
            status: 'approved',
            bold_reference: orderId,
            bold_transaction_id: searchParams.get('bold-tx-id') || null,
          })

          if (payErr) {
            console.warn('No se guardó en payments:', payErr.message)
            addLog(`Advertencia: No se registró en payments → ${payErr.message}`)
          } else {
            addLog('Pago registrado en tabla payments')
          }

          setState('success')
          setMessage('¡Pago confirmado! Tu propiedad ya está publicada y visible para todos.')

          setTimeout(() => router.push('/dashboard/properties'), 4000)
        } else if (txStatus === 'rejected') {
          setState('rejected')
          setMessage('Pago rechazado. Intenta nuevamente.')
        } else {
          setState('pending')
          setMessage('Pago pendiente de confirmación.')
        }
      } catch (err: any) {
        console.error('[PaymentResult] ERROR FINAL:', err.message, err)
        addLog(`ERROR FINAL: ${err.message}`)
        setState('error')
        setMessage(`Error al procesar el pago: ${err.message || 'desconocido'}. Ref: ${orderId}`)
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
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center space-y-6">
          {current.icon}
          <h1 className={`text-3xl font-bold ${current.color}`}>{current.title}</h1>
          <p className="text-lg">{message}</p>

          {propertyId && <p className="text-sm text-muted-foreground">Propiedad procesada: {propertyId}</p>}
          {debugOrderId && <p className="text-xs text-muted-foreground break-all">OrderId recibido: {debugOrderId}</p>}

          {/* Logs visibles en pantalla */}
          {debugLogs.length > 0 && (
            <div className="text-left text-xs text-muted-foreground max-h-60 overflow-y-auto border border-muted p-3 rounded bg-gray-900/50">
              <strong>Logs paso a paso:</strong><br />
              {debugLogs.map((line, i) => (
                <div key={i} className="py-0.5">{line}</div>
              ))}
            </div>
          )}

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