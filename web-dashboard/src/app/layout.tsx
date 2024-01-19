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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}