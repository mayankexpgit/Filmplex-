
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getMessagingToken, onMessageListener } from '@/lib/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from './ui/button';
import { ShieldCheck, BellRing } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';


const NOTIFICATION_PROMPT_SEEN_KEY = 'filmplex_notification_prompt_seen';

function requestPermissionAndToken() {
  console.log('Requesting notification permission...');
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
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !pathname.startsWith('/admin')) {
      const promptSeen = localStorage.getItem(NOTIFICATION_PROMPT_SEEN_KEY);
      
      // Show custom prompt only if not seen before and permission is 'default'
      if (!promptSeen && Notification.permission === 'default') {
        setShowCustomPrompt(true);
      } else if (Notification.permission === 'granted') {
        // If permission is already granted, just get the token silently.
        getMessagingToken();
      }

      const unsubscribe = onMessageListener()
        .then((payload) => {
          console.log('Received foreground message: ', payload);
          // Here you could display a toast or an in-app notification
        })
        .catch((err) => console.log('failed to receive foreground message: ', err));
      
      return () => {
        // In a real app, you might want to handle the promise resolution
        // but for this, we assume it's okay to detach.
      };
    }
  }, [pathname]);

  const handleAllow = () => {
    localStorage.setItem(NOTIFICATION_PROMPT_SEEN_KEY, 'true');
    setShowCustomPrompt(false);
    requestPermissionAndToken();
  };

  const handleDeny = () => {
    localStorage.setItem(NOTIFICATION_PROMPT_SEEN_KEY, 'true');
    setShowCustomPrompt(false);
  };

  return (
    <AlertDialog open={showCustomPrompt} onOpenChange={setShowCustomPrompt}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <BellRing className="h-6 w-6 text-primary" />
            Get Notified About New Movies & Web Series!
          </AlertDialogTitle>
          <AlertDialogDescription>
            Click "Yes, notify me" to receive instant alerts when new movies and web series are available. We respect your privacy and will only send you important updates. You can manage these settings in your browser anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary border border-border">
          <ShieldCheck className="h-8 w-8 text-green-500 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Smart Protection</h4>
            <p className="text-xs text-muted-foreground">Avoid Malware, virus and any apk download.</p>
          </div>
          <div className="flex items-center space-x-2">
              <Switch id="smart-protection-switch" checked={true} readOnly disabled className="opacity-100 cursor-default" />
              <Label htmlFor="smart-protection-switch" className="text-sm font-medium">Enable</Label>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDeny}>⚠️ No, thanks</AlertDialogCancel>
          <AlertDialogAction onClick={handleAllow}>
            😄 Yes, notify me
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

