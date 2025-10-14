
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';
import { getMessagingToken, onMessageListener } from '@/lib/firebase';
import { usePathname } from 'next/navigation';

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


function requestPermission() {
  console.log('Requesting permission...');
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      getMessagingToken();
    } else {
      console.log('Unable to get permission to notify.');
    }
  });
}

function ClientSideLayout({ children }: { children: React.ReactNode }) {
  'use client';
  
  const pathname = usePathname();

  useEffect(() => {
    // We don't want to ask for permission on admin routes
    if (pathname && pathname.startsWith('/admin')) {
        return;
    }
      
    if ('Notification' in window) {
      requestPermission();
    }
    onMessageListener().then(payload => {
        // You can handle foreground messages here, e.g., show a custom toast
        console.log('Received foreground message: ', payload);
    }).catch(err => console.log('failed: ', err));
  }, [pathname]);

  return (
    <>
        <div className="flex-grow">
          {children}
        </div>
        <Toaster />
        <footer className="w-full bg-secondary text-secondary-foreground py-4 mt-auto">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} FILMPLEX. All Rights Reserved. | Version 1.9</p>
          </div>
        </footer>
    </>
  );
}


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
        <ClientSideLayout>{children}</ClientSideLayout>
      </body>
    </html>
  );
}
