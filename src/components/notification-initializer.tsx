
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getMessagingToken, onMessageListener } from '@/lib/firebase';

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

export default function NotificationInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (!pathname.startsWith('/admin')) {
        requestPermission();
      }
    }
    onMessageListener()
      .then((payload) => {
        console.log('Received foreground message: ', payload);
        // Here you could display a toast or an in-app notification
      })
      .catch((err) => console.log('failed: ', err));
  }, [pathname]);

  return null;
}
