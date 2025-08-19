import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'FILMPLEX',
  description: 'The future of cinema.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="https://placehold.co/32x32/F5B50A/000000?text=F" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <div className="flex-grow">
          {children}
        </div>
        <Toaster />
        <footer className="w-full bg-secondary text-secondary-foreground py-4 mt-auto">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>FILMPLEX powered by anm organization and regulated by dev.mayank</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
