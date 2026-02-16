import { Suspense } from 'react'
import DemoContent from './DemoContent'

export default function DemoDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Cargando dashboard...
      </div>
    }>
      <DemoContent />
    </Suspense>
  )
}