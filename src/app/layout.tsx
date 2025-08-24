import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'FILMPLEX',
  description: 'The future of cinema.',
  icons: {
    icon: '/favicon2.ico?v=2', // main favicon with cache busting
    apple: '/apple-touch-icon.png?v=2', // Apple touch icon
    other: [
      { rel: 'icon', sizes: '16x16', url: '/favicon-16x16.png?v=2' },
      { rel: 'icon', sizes: '32x32', url: '/favicon-32x32.png?v=2' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />

        {/* Manifest */}
        <link rel="manifest" href="/site.webmanifest?v=2" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <div className="flex-grow">{children}</div>

        <Toaster />

        <footer className="w-full bg-secondary text-secondary-foreground py-4 mt-auto">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>
              FILMPLEX powered by anm organization and regulated by dev.mayank
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
