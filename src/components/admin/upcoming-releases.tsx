
'use client';

import { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Trash2, PlusCircle, Bell, Loader2 } from 'lucide-react';
import { useMovieStore, addNotification, deleteNotification } from '@/store/movieStore';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@/lib/data';

export default function UpcomingReleasesManager() {
    const { notifications } = useMovieStore();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [movieTitle, setMovieTitle] = useState('');
    const [posterUrl, setPosterUrl] = useState('');
    const [releaseDate, setReleaseDate] = useState('');

    const handleAddNotification = () => {
        if (!movieTitle || !posterUrl || !releaseDate) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill in all fields to add a notification.',
            });
            return;
        }

        startTransition(async () => {
            const newNotification: Omit<Notification, 'id'> = {
                movieTitle,
                posterUrl,
                releaseDate,
            };
            try {
                await addNotification(newNotification);
                toast({
                    title: 'Success!',
                    description: `Added "${movieTitle}" to upcoming releases.`,
                });
                // Reset form
                setMovieTitle('');
                setPosterUrl('');
                setReleaseDate('');
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Database Error',
                    description: 'Could not add the notification. Please try again.',
                });
            }
        });
    };

    const handleDeleteNotification = (id: string) => {
        startTransition(async () => {
            try {
                await deleteNotification(id);
                toast({
                    title: 'Notification Removed',
                    description: 'The upcoming release has been removed.',
                });
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Database Error',
                    description: 'Could not remove the notification. Please try again.',
                });
            }
        });
    };

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Add Upcoming Release</CardTitle>
                    <CardDescription>Announce a movie or series that is coming soon.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="notif-title">Movie Title</Label>
                        <Input
                            id="notif-title"
                            value={movieTitle}
                            onChange={(e) => setMovieTitle(e.target.value)}
                            placeholder="e.g., The Matrix 5"
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notif-poster">Poster URL</Label>
                        <Input
                            id="notif-poster"
                            value={posterUrl}
                            onChange={(e) => setPosterUrl(e.target.value)}
                            placeholder="https://image.tmdb.org/..."
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notif-date">Release Date Text</Label>
                        <Input
                            id="notif-date"
                            value={releaseDate}
                            onChange={(e) => setReleaseDate(e.target.value)}
                            placeholder="e.g., October 31, 2025"
                            disabled={isPending}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleAddNotification} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        Add Notification
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Upcoming Releases</CardTitle>
                    <CardDescription>This is what users see in the notification panel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <div key={notif.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                                        <div className="flex items-center gap-4">
                                            <Image src={notif.posterUrl} alt={notif.movieTitle} width={40} height={60} className="rounded-md" />
                                            <div>
                                                <p className="font-semibold">{notif.movieTitle}</p>
                                                <p className="text-xs text-muted-foreground">{notif.releaseDate}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteNotification(notif.id)} disabled={isPending}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground py-16">
                                    <Bell className="mx-auto h-12 w-12" />
                                    <p className="mt-4">No upcoming releases announced.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
