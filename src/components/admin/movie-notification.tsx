
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMovieStore, addNotification, deleteNotification } from '@/store/movieStore';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function MovieNotification() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const movies = useMovieStore((state) => state.latestReleases);
  const notifications = useMovieStore((state) => state.notifications);

  const [selectedMovieId, setSelectedMovieId] = useState<string | undefined>();
  const [releaseDate, setReleaseDate] = useState<Date | undefined>();

  const handleAddNotification = () => {
    if (!selectedMovieId || !releaseDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a movie and a release date.',
      });
      return;
    }

    const movie = movies.find((m) => m.id === selectedMovieId);
    if (!movie) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selected movie not found.',
      });
      return;
    }
    
    if (notifications.some(n => n.movieTitle === movie.title)) {
       toast({
        variant: 'destructive',
        title: 'Already Exists',
        description: 'A notification for this movie already exists.',
      });
      return;
    }

    startTransition(async () => {
      try {
        await addNotification({
          movieTitle: movie.title,
          posterUrl: movie.posterUrl,
          releaseDate: format(releaseDate, 'PPP'), // e.g., Jun 9, 2024
        });
        toast({
          title: 'Success!',
          description: `Notification for "${movie.title}" has been added.`,
        });
        setSelectedMovieId(undefined);
        setReleaseDate(undefined);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not add the notification.',
        });
      }
    });
  };

  const handleDeleteNotification = (id: string) => {
    startTransition(async () => {
      try {
        await deleteNotification(id);
        toast({
          title: 'Success!',
          description: 'Notification has been removed.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not remove the notification.',
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Upcoming Release Notification</CardTitle>
          <CardDescription>
            Select a movie and set a future release date to notify users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Movie</Label>
            <Select value={selectedMovieId} onValueChange={setSelectedMovieId} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select a movie to feature" />
              </SelectTrigger>
              <SelectContent>
                {movies.map((movie) => (
                  <SelectItem key={movie.id} value={movie.id}>
                    {movie.title} ({movie.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Upcoming Release Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !releaseDate && 'text-muted-foreground'
                  )}
                  disabled={isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {releaseDate ? format(releaseDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={releaseDate}
                  onSelect={setReleaseDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleAddNotification} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {isPending ? 'Adding...' : 'Add Notification'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Current Notifications</CardTitle>
              <CardDescription>
                  This is what users will see in the notification panel.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {notifications.length === 0 ? (
                  <p className="text-muted-foreground text-center">No active notifications.</p>
              ) : (
                  notifications.map(notif => (
                      <div key={notif.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-16 flex-shrink-0">
                                <Image src={notif.posterUrl} alt={notif.movieTitle} fill className="rounded-md object-cover" />
                            </div>
                            <div>
                                <p className="font-semibold">{notif.movieTitle}</p>
                                <p className="text-sm text-muted-foreground">{notif.releaseDate}</p>
                            </div>
                          </div>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteNotification(notif.id)} disabled={isPending}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                  ))
              )}
          </CardContent>
      </Card>

    </div>
  );
}
