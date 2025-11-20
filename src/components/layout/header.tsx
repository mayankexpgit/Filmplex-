
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
import { Settings, Bell, LifeBuoy, Mail, MessageCircle, Instagram, Send, LayoutGrid, Users, Sparkles, Gift, History } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { useMovieStore, submitRequest, fetchRequests } from '@/store/movieStore';
import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import type { ManagementMember, UserRequest } from '@/lib/data';
import Changelog from '../changelog';
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
} from "@/components/ui/alert-dialog";
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import DownloadHelpPanel from '../download-help-shelf';


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
                                                <h3 className="font-semibold">{member.displayName}</h3>
                                                <p className="text-sm text-muted-foreground">{member.info}</p>
                                            </div>
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

function RequestForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [movieName, setMovieName] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Movie Name Required',
        description: 'Please enter the name of the movie or series.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const newRequest = await submitRequest(movieName, comment);
        
        // Save to local storage
        const history = JSON.parse(localStorage.getItem('request_history') || '[]');
        history.push(newRequest);
        localStorage.setItem('request_history', JSON.stringify(history));

        toast({
          title: 'Request Sent!',
          description: "Thanks for your feedback. You can check its status in the 'Request History'.",
          variant: 'success'
        });
        setMovieName('');
        setComment('');
        onSubmitted();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not send your request. Please try again.',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label htmlFor="request-movie-name">Movie / Series Name</Label>
        <Input
          id="request-movie-name"
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
          placeholder="e.g. The Matrix"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="request-comment">Comment (Optional)</Label>
        <Textarea
          id="request-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any specific details? e.g. 'Please upload in 4K quality'"
          rows={3}
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {isPending ? 'Sending...' : 'Submit Request'}
      </Button>
    </form>
  );
}

function RequestHistory() {
  const [history, setHistory] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const syncHistory = async () => {
      setIsLoading(true);
      const localHistory: UserRequest[] = JSON.parse(localStorage.getItem('request_history') || '[]');
      if (localHistory.length === 0) {
          setHistory([]);
          setIsLoading(false);
          return;
      }
      
      try {
          const allServerRequests = await fetchRequests();
          const serverRequestsMap = new Map(allServerRequests.map(req => [req.id, req]));
          
          const updatedHistory = localHistory.map(localReq => {
              const serverReq = serverRequestsMap.get(localReq.id);
              return serverReq ? { ...localReq, status: serverReq.status } : localReq;
          });

          localStorage.setItem('request_history', JSON.stringify(updatedHistory));
          setHistory(updatedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

      } catch (error) {
          console.error("Failed to sync request history:", error);
          setHistory(localHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } finally {
          setIsLoading(false);
      }
  };


  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('request_history') || '[]');
    setHistory(savedHistory.sort((a: UserRequest, b: UserRequest) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  const getStatusBadge = (status: UserRequest['status']) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'uploaded':
        return <Badge variant="success">Uploaded</Badge>;
      case 'unavailable':
        return <Badge variant="destructive">Unavailable</Badge>;
      case 'soon':
        return <Badge variant="default" className="bg-blue-500">Coming Soon</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && syncHistory()}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
           Request History
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <div className="p-2 font-semibold">Your Past Requests</div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-64">
          {history.length > 0 ? (
            history.map(req => (
              <DropdownMenuItem key={req.id} onSelect={(e) => e.preventDefault()} className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-medium">{req.movieName}</span>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(parseISO(req.timestamp), { addSuffix: true })}</span>
                </div>
                {getStatusBadge(req.status)}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              You haven't made any requests yet.
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function RequestZonePanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Gift className="mr-2 h-4 w-4" />
          Request Zone
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Request Zone</SheetTitle>
          <SheetDescription>
            Can't find what you're looking for? Let us know!
          </SheetDescription>
        </SheetHeader>
        <RequestForm onSubmitted={() => { /* Potentially refresh history or give a slight delay before closing */ }} />
        <Separator className="my-6" />
        <RequestHistory />
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
            <DropdownMenuSeparator />
            <ChangelogPanel />
            <RequestZonePanel />
            <HelpCenterPanel />
            <DownloadHelpPanel />
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
