
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMovieStore } from '@/store/movieStore';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export default function FloatingTelegramButton() {
  const { contactInfo } = useMovieStore();
  const pathname = usePathname();

  // Hide the button if there is no URL or if we are on an admin page
  if (!contactInfo?.telegramUrl || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-8 z-50 group">
      <a 
        href={contactInfo.telegramUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Join our Telegram Channel"
        className="flex items-center gap-3"
      >
        <Button asChild size="icon" className="rounded-full h-14 w-14 shadow-lg bg-[#2AABEE] hover:bg-[#229ED9] transition-transform duration-300 group-hover:scale-110">
            <div>
              <Send className="h-7 w-7 text-white" />
            </div>
        </Button>
        <div className="bg-background border border-border px-4 py-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 pointer-events-none">
            <p className="font-bold text-foreground whitespace-nowrap">Get faster update</p>
        </div>
      </a>
    </div>
  );
}
