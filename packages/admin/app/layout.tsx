import type { Metadata } from 'next'
import '../styles/globals.css'
import { RootProvider } from '@nexora/shared'

export const metadata: Metadata = {
  title: 'Nexora Admin Dashboard',
  description: 'Super admin portal for managing Nexora platform',
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
