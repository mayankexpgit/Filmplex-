'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMovieStore } from '@/store/movieStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { DownloadCloud, HelpCircle, ShieldCheck, Video, Send, Zap } from 'lucide-react';
import Link from 'next/link';
import { Separator } from './ui/separator';

export default function DownloadHelpShelf() {
  const { isInitialized, contactInfo } = useMovieStore();
  const pathname = usePathname();

  // Hide the component if data is not initialized or if we are on an admin page
  if (!isInitialized || pathname.startsWith('/admin')) {
    return null;
  }

  const howToDownloadLink = "https://www.instagram.com/reel/DOZ1BdNkxPo/?igsh=MWM3cTl6YmI2b3BxdQ==";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group fixed bottom-8 right-8 z-50 flex items-end gap-3 cursor-pointer">
           <div className="relative hidden sm:block">
              <div className="absolute -bottom-2 -right-12 w-20 h-20 opacity-0 group-hover:opacity-0 transition-opacity duration-300 animate-point-to-button">
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M85.3553 14.6447C87.308 16.5973 87.308 19.7631 85.3553 21.7157L31.0711 75.9999L25 69.9288L79.2843 15.6447C81.2369 13.692 84.4027 13.692 86.3553 15.6447L85.3553 14.6447Z" fill="hsl(var(--primary))"/>
                      <path d="M25 70L28 92L50 89L25 70Z" fill="hsl(var(--primary))"/>
                  </svg>
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground whitespace-nowrap">Problem while facing download?</p>
          </div>
           <Button
            variant="outline"
            size="icon"
            className="rounded-full h-14 w-14 shadow-lg bg-background/80 border-border/40 backdrop-blur-sm group-hover:bg-accent"
            aria-label="Download Help"
          >
            <span className="material-symbols-outlined text-primary text-2xl">file_download_off</span>
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DownloadCloud className="h-5 w-5 text-primary" />
            <span>Download Assistance</span>
          </DialogTitle>
          <DialogDescription>
            Solutions for common download problems.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
            <div className="p-4 rounded-lg bg-secondary border border-primary/20">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    Problem 1: File Not Downloading
                </h3>
                <p className="text-sm text-muted-foreground">
                    If the download doesn't start after clicking the link, please use a <b className="text-foreground">VPN service</b>. This often resolves network-related issues.
                </p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary border border-primary/20">
                 <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <HelpCircle className="h-5 w-5 text-amber-500" />
                    Problem 2: Link Not Opening / Other Issues
                </h3>
                <div className="space-y-3">
                     <Button asChild className="w-full justify-start gap-3">
                        <a href={howToDownloadLink} target="_blank" rel="noopener noreferrer">
                            <Video className="h-5 w-5" />
                            <span>Watch: How to Download</span>
                        </a>
                    </Button>
                    <Button asChild variant="default" className="w-full justify-start gap-3">
                         <a href={contactInfo.telegramUrl} target="_blank" rel="noopener noreferrer">
                            <Send className="h-5 w-5" />
                            <span className="flex items-center gap-1">Just in <Zap className="h-4 w-4" /> Min Contact (Telegram)</span>
                        </a>
                    </Button>
                </div>
            </div>

        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
