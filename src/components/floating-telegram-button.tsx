'use client';

import Link from 'next/link';
import { useMovieStore } from '@/store/movieStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Send } from 'lucide-react'; // Using Send icon for Telegram

export default function FloatingTelegramButton() {
  const { contactInfo } = useMovieStore();
  
  if (!contactInfo?.telegramUrl) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-8 left-8 z-50">
            <Button asChild size="icon" className="rounded-full h-14 w-14 shadow-lg bg-[#2AABEE] hover:bg-[#229ED9]">
              <a href={contactInfo.telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Join our Telegram Channel">
                <Send className="h-7 w-7 text-white" />
              </a>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Get faster update</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
