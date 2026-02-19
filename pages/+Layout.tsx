import '../assets/main.css'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br via-white to-purple-50/30 text-gray-900 antialiased" style={{ '--tw-gradient-from': 'rgba(var(--color-primary-rgb, 59,130,246), 0.05)' } as React.CSSProperties}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </div>
  )
}
