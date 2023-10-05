import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Web Dashboard',
  description: 'Motivational GitHub badge dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}