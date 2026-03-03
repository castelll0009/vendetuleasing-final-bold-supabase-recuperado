'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface FakeBoldPaymentButtonProps {
  propertyId: string
  propertyTitle: string
  amount: number
  paymentType: 'publication' | 'featured'
}

export function FakeBoldPaymentButton({ propertyId, propertyTitle, amount, paymentType }: FakeBoldPaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      // build fake order id similar to production logic
      const orderId = `${paymentType.toUpperCase()}-${propertyId.replace(/-/g, '').slice(0, 8)}-${Date.now()}`
      const payload: any = {
        order_id: orderId,
        status: 'approved',
        transaction_id: null,
        payment_method: null,
        property_id: propertyId, // use direct id for simulation
      }
      console.log('[FakeBold] enviando a verify-payment', payload)
      const res = await fetch('/api/bold/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      console.log('[FakeBold] respuesta verify-payment', data)
      if (!res.ok) {
        throw new Error(data.error || 'Error verify-payment')
      }
      setSuccess(true)
    } catch (err: any) {
      console.error('[FakeBold] EXCEPCIÓN', err)
      setError(err.message || 'Error al simular pago')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return <span className="text-green-600 text-sm">Pago simulado ✅</span>
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Simulando pago...</span>
        </div>
      )}
      <button
        disabled={loading}
        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        onClick={handleClick}
      >
        {loading ? 'Procesando...' : `Pagar ${amount} COP`}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
