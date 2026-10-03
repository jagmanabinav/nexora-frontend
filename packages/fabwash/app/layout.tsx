import type { Metadata } from 'next'
import '../styles/globals.css'
import { RootProvider } from '@nexora/shared'

export const metadata: Metadata = {
  title: 'FabWash - Laundry Management',
  description: 'Fabric receiving, DC management, invoicing, and customer management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
