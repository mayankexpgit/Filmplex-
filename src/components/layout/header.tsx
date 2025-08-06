
'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings, Bell } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useMovieStore, fetchMovieData } from '@/store/movieStore';
import { useEffect } from 'react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

function UpcomingReleasesPanel() {
  const { notifications, isInitialized } = useMovieStore();

  useEffect(() => {
    if (!isInitialized) {
      fetchMovieData(); // This now fetches notifications too
    }
  }, [isInitialized]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bell className="h-6 w-6" />
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
              <Link href="/admin">Admin panel</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Contact</DropdownMenuItem>
            <DropdownMenuItem>Suggestion</DropdownMenuItem>
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
