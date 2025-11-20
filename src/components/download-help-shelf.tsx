
'use client';

import { useMovieStore } from '@/store/movieStore';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { DownloadCloud, HelpCircle, ShieldCheck, Video, Send, Zap, LifeBuoy } from 'lucide-react';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { Separator } from './ui/separator';

export default function DownloadHelpPanel() {
  const { isInitialized, contactInfo } = useMovieStore();

  const howToDownloadLink = "https://www.instagram.com/reel/DOZ1BdNkxPo/?igsh=MWM3cTl6YmI2b3BxdQ==";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <LifeBuoy className="mr-2 h-4 w-4"/>
            Download Help
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <DownloadCloud className="h-5 w-5 text-primary" />
            <span>Download Assistance</span>
          </SheetTitle>
          <SheetDescription>
            Solutions for common download problems.
          </SheetDescription>
        </SheetHeader>
        
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

        <SheetFooter>
          <SheetClose asChild>
            <Button>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
