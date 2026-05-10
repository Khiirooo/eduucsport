import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EducSport - Plateforme EPS Belgique FWB',
  description: 'La plateforme digitale des etudiants et enseignants en education physique. Creez vos preparations, planifiez vos cycles, gerez vos ecoles.',
}

export const viewport: Viewport = {
  themeColor: '#0d9488',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
