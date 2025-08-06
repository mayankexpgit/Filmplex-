
'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings, Bell, LifeBuoy, Mail, MessageCircle, Instagram, Send, LayoutGrid } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { useMovieStore, fetchMovieData } from '@/store/movieStore';
import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

function UpcomingReleasesPanel() {
  const { notifications, isInitialized } = useMovieStore();

  useEffect(() => {
    if (!isInitialized) {
      fetchMovieData();
    }
  }, [isInitialized]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6" />
          {notifications.length > 0 && (
             <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {notifications.length}
            </div>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Upcoming Releases</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)] pr-4 mt-4">
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">
                        <p>No upcoming releases announced yet.</p>
                        <p className="text-sm">Check back later!</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div key={notif.id}>
                            <div className="flex items-start gap-4 p-2">
                                <div className="relative w-20 h-28 flex-shrink-0">
                                    <Image
                                        src={notif.posterUrl}
                                        alt={notif.movieTitle}
                                        fill
                                        className="rounded-md object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-base">{notif.movieTitle}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Coming on: <span className="font-medium text-primary">{notif.releaseDate}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Get ready for the release! We'll have it available for you right here.
                                    </p>
                                </div>
                            </div>
                            <Separator className="mt-4" />
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

const SocialLink = ({ href, Icon, label }: { href: string; Icon: React.ElementType; label: string }) => {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-secondary transition-colors">
      <div className="flex items-center gap-4">
        <Icon className="h-6 w-6 text-primary" />
        <span className="font-medium">{label}</span>
      </div>
    </a>
  );
};

const InfoRow = ({ Icon, label, value }: { Icon: React.ElementType; label: string, value: string }) => {
   if (!value) return null;
  return (
     <div className="flex items-center gap-4 p-3">
        <Icon className="h-6 w-6 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium">{value}</p>
        </div>
      </div>
  )
}

function HelpCenterPanel() {
  const { contactInfo, isInitialized } = useMovieStore();
  
  useEffect(() => {
    if (!isInitialized) {
      fetchMovieData();
    }
  }, [isInitialized]);
  
  return (
     <Sheet>
      <SheetTrigger asChild>
         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <LifeBuoy className="mr-2 h-4 w-4"/>
            Help Center
         </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Help Center</SheetTitle>
          <SheetDescription>
            Have questions or need assistance? Reach out to us through any of these platforms.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-2">
            <h3 className="px-3 text-sm font-semibold text-muted-foreground">Join our Community</h3>
            <SocialLink href={contactInfo.telegramUrl} Icon={Send} label="Join on Telegram" />
            <SocialLink href={contactInfo.whatsappUrl} Icon={MessageCircle} label="Join on WhatsApp" />
            <SocialLink href={contactInfo.instagramUrl} Icon={Instagram} label="Follow on Instagram" />
            <Separator className="my-4" />
            <h3 className="px-3 text-sm font-semibold text-muted-foreground">Direct Contact</h3>
            <InfoRow Icon={Mail} label="Email Address" value={contactInfo.email} />
            <InfoRow Icon={MessageCircle} label="WhatsApp Number" value={contactInfo.whatsappNumber} />
        </div>
      </SheetContent>
    </Sheet>
  )
}


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-6 w-6" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Admin panel
              </Link>
            </DropdownMenuItem>
             <HelpCenterPanel />
            <DropdownMenuItem>
              <MessageCircle className="mr-2 h-4 w-4" />
              Suggestion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <a href="/" className="flex items-center gap-2">
          <div className="text-5xl font-bold flex items-center">
            <span className="text-6xl text-primary">F</span>
            <span className="text-5xl text-primary tracking-tighter scale-y-110">
              ILMPLE
            </span>
            <span className="text-6xl text-primary">X</span>
          </div>
        </a>

        <div className="w-10">
          <UpcomingReleasesPanel />
        </div>
      </div>
    </header>
  );
}
