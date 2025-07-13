import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ObjectionIQ - AI-Powered Insurance Sales Training",
  description: "Master insurance sales with voice-first AI training. Practice with realistic customer personas and overcome objections with confidence. Transform your sales skills with our premium AI-powered platform.",
  keywords: "insurance sales, training, AI, voice recognition, sales practice, objections, sales coaching, customer personas, sales skills, insurance training",
  authors: [{ name: "ObjectionIQ Team" }],
  creator: "ObjectionIQ",
  publisher: "ObjectionIQ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://objectioniq.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "ObjectionIQ - AI-Powered Insurance Sales Training",
    description: "Master insurance sales with voice-first AI training. Practice with realistic customer personas and overcome objections with confidence.",
    url: 'https://objectioniq.com',
    siteName: 'ObjectionIQ',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ObjectionIQ - AI-Powered Insurance Sales Training',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ObjectionIQ - AI-Powered Insurance Sales Training",
    description: "Master insurance sales with voice-first AI training. Practice with realistic customer personas and overcome objections with confidence.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
