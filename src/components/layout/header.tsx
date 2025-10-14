
'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings, Bell, LifeBuoy, Mail, MessageCircle, Instagram, Send, LayoutGrid, Users, Sparkles, AlertCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { useMovieStore } from '@/store/movieStore';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import SuggestionForm from '../suggestion-form';
import type { ManagementMember } from '@/lib/data';
import Changelog from '../changelog';
import NotificationInitializer from '../notification-initializer';
import { useToast } from '@/hooks/use-toast';
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

function NotificationRePrompt() {
  const { triggerPermissionPrompt, notificationPermission } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);
  const [render, setRender] = useState(false);
  
  useEffect(() => {
    // This ensures the component only renders on the client side after hydration.
    setRender(true);
  }, []);

  const handleRePrompt = () => {
    setShowPrompt(true);
  };

  const handleAllow = () => {
    setShowPrompt(false);
    triggerPermissionPrompt();
  };

  const handleDeny = () => {
    setShowPrompt(false);
  };
  
  if (!render || notificationPermission !== 'denied') {
    return null;
  }

  return (
    <>
      <div 
        className="bg-primary/10 text-primary-foreground p-2 text-center text-sm cursor-pointer hover:bg-primary/20"
        onClick={handleRePrompt}
      >
        <AlertCircle className="inline h-4 w-4 mr-2"/>
        Don't miss out on the latest movies. <span className="font-semibold underline">Click here to enable notifications.</span>
      </div>
       <AlertDialog open={showPrompt} onOpenChange={setShowPrompt}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                  <Bell className="h-6 w-6 text-primary" />
                  Enable Notifications
              </AlertDialogTitle>
              <AlertDialogDescription>
                  You've previously chosen not to receive notifications. Would you like to enable them now to get updates on the latest movies and web series?
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleDeny}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleAllow}>
                    Enable
                </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


function UpcomingReleasesPanel() {
  const notifications = useMovieStore((state) => state.notifications);

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

function ManagementPanel() {
    const managementTeam = useMovieStore((state) => state.managementTeam);
    const [messagingMember, setMessagingMember] = useState<ManagementMember | null>(null);

    const getDisplayName = (fullName: string) => {
        if (fullName.includes('.')) {
            return fullName.split('.').pop() || fullName;
        }
        return fullName;
    }

    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start px-3">
                        <Users className="mr-2 h-5 w-5" />
                        Contact Management
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px]">
                    <SheetHeader>
                        <SheetTitle>Management Team</SheetTitle>
                        <SheetDescription>
                            Our dedicated team is here to help you.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100%-4rem)] pr-4 mt-4">
                        <div className="space-y-4">
                            {managementTeam.length > 0 ? (
                                managementTeam.map(member => (
                                    <div key={member.id} className="p-3 bg-secondary/50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">{getDisplayName(member.name)}</h3>
                                                <p className="text-sm text-muted-foreground">{member.info}</p>
                                            </div>
                                            <Button onClick={() => setMessagingMember(member)}>
                                                <Send className="mr-2 h-4 w-4" /> Message
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-10">Management team details are not available at the moment.</p>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
             <Sheet open={!!messagingMember} onOpenChange={(isOpen) => !isOpen && setMessagingMember(null)}>
                <SheetContent className="w-[400px]">
                    <SheetHeader>
                    <SheetTitle>Contact {messagingMember ? getDisplayName(messagingMember.name) : ''}</SheetTitle>
                    <SheetDescription>
                        Your message will be sent directly to {messagingMember ? getDisplayName(messagingMember.name) : 'the admin'}.
                    </SheetDescription>
                    </SheetHeader>
                    <SuggestionForm 
                        onSubmitted={() => setMessagingMember(null)}
                        recipient={messagingMember} 
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}

function HelpCenterPanel() {
  const contactInfo = useMovieStore((state) => state.contactInfo);
  
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

            <Separator className="my-4" />
            <div className="p-1">
                <ManagementPanel />
            </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SuggestionPanel() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Suggestion
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Make a Suggestion</SheetTitle>
          <SheetDescription>
            Want to see a specific movie or series? Let us know!
          </SheetDescription>
        </SheetHeader>
        <SuggestionForm onSubmitted={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

function ChangelogPanel() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Sparkles className="mr-2 h-4 w-4" />
          What's New
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <Changelog />
      </SheetContent>
    </Sheet>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <NotificationInitializer />
      <NotificationRePrompt />
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
            <DropdownMenuSeparator />
            <ChangelogPanel />
            <HelpCenterPanel />
            <SuggestionPanel />
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
