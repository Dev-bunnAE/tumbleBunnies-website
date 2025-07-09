import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { AuthProvider } from '@/lib/firebase';
import type { Metadata } from 'next';
import Head from 'next/head';
import './globals.css';

export const metadata: Metadata = {
  title: 'TumbleBunnies | Joyful Kids Classes',
  description: 'Book playful gymnastics, dance, and activity classes for kids. Safe, fun, and confidence-building for every bunny!',
  openGraph: {
    title: 'TumbleBunnies | Joyful Kids Classes',
    description: 'Book playful gymnastics, dance, and activity classes for kids. Safe, fun, and confidence-building for every bunny!',
    url: 'https://tumblebunnies.com',
    siteName: 'TumbleBunnies',
    images: [
      {
        url: 'https://tumblebunnies.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TumbleBunnies - Joyful Kids Classes',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TumbleBunnies | Joyful Kids Classes',
    description: 'Book playful gymnastics, dance, and activity classes for kids. Safe, fun, and confidence-building for every bunny!',
    images: ['https://tumblebunnies.com/og-image.jpg'],
    creator: '@TumbleBunnies',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TumbleBunnies" />
        <meta property="og:title" content="TumbleBunnies | Joyful Kids Classes" />
        <meta property="og:description" content="Book playful gymnastics, dance, and activity classes for kids. Safe, fun, and confidence-building for every bunny!" />
        <meta property="og:image" content="https://tumblebunnies.com/og-image.jpg" />
        <meta property="og:url" content="https://tumblebunnies.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TumbleBunnies | Joyful Kids Classes" />
        <meta name="twitter:description" content="Book playful gymnastics, dance, and activity classes for kids. Safe, fun, and confidence-building for every bunny!" />
        <meta name="twitter:image" content="https://tumblebunnies.com/og-image.jpg" />
        <meta name="twitter:creator" content="@TumbleBunnies" />
        <link rel="canonical" href="https://tumblebunnies.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "TumbleBunnies",
            "url": "https://tumblebunnies.com",
            "logo": "https://tumblebunnies.com/logo.png",
            "sameAs": [
              "https://www.facebook.com/tumblebunnies/",
              "https://www.instagram.com/tumblebunnies/?hl=en"
            ],
            "description": "Book playful gymnastics, dance, and activity classes for kids. Safe, fun, and confidence-building for every bunny!"
          })
        }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap"
          rel="stylesheet"
          data-font-display="swap"
        />
      </Head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
