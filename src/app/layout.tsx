
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import FloatingTelegramButton from '@/components/floating-telegram-button';
import { Analytics } from '@vercel/analytics/react';
import MalwareProtectionShelf from '@/components/malware-protection-shelf';


export const metadata: Metadata = {
  title: 'FILMPLEX',
  description: 'The future of cinema.',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <div className="flex-grow">
          {children}
        </div>
        <MalwareProtectionShelf />
        <FloatingTelegramButton />
        <Toaster />
        <footer className="w-full bg-secondary text-secondary-foreground py-4 mt-auto">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} FILMPLEX. All Rights Reserved. | Version 1.9</p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
