import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'GigArmor — Parametric Insurance for India\'s Gig Workforce',
  description: 'AI-powered income protection. Weather disrupts your earnings — we pay you in 60 seconds. No paperwork. No waiting.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
