import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: "Kyrie's External Brain",
  description: 'A book-aware chatbot with paraphrased understanding',
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

