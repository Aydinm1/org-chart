import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { withBasePath } from '../lib/base-path'

export const metadata: Metadata = {
  title: 'Midwest Institutions Directory',
  description: 'Airtable-backed organizational directory for Midwest Institutions.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={
          {
            '--directory-bg-pattern': `url("${withBasePath('/assets/background.png')}")`,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  )
}
