import '../assets/main.css'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '../lib/auth-context'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
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
    </AuthProvider>
  )
}
