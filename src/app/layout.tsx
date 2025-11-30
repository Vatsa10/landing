import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aapka Aarogya Kosh',
  description: 'Your Personal Health Record Manager - Upload, organize, and track your medical prescriptions and lab reports with AI-powered insights.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In production, you'd implement proper server-side auth checking
  // For demo, we'll handle auth on client side
  
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
