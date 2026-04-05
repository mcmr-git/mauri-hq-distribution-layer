import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mauri HQ + Distribution Layer',
  description: 'Editorial home and longform distribution project for Michele Mauri.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
