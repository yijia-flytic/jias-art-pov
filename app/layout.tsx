import type { Metadata } from 'next'
import { Fraunces } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
})

export const metadata: Metadata = {
  title: "Jia's point of view",
  description: 'Daily observations on art, one painting at a time. A learning record by an absolute beginner.',
  openGraph: {
    title: "Jia's point of view",
    description: 'Daily observations on art, one painting at a time.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body className="bg-paper text-ink min-h-screen">
        {children}
      </body>
    </html>
  )
}
