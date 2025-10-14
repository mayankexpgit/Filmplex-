'use client';

import { useState, useMemo, useTransition } from 'react';
import { useMovieStore } from '@/store/movieStore';
import type { Movie } from '@/lib/data';
import { isAfter, subHours, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { Send, BellRing, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationPreview = ({ movie, title, body }: { movie: Movie; title: string; body: string }) => (
    <div className="bg-black/70 backdrop-blur-sm p-4 rounded-3xl max-w-sm mx-auto border border-gray-700">
        <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                    src="/android-chrome-192x192.png"
                    alt="App Icon"
                    fill
                    className="rounded-full"
                />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-white">FILMPLEX</p>
                <p className="text-xs text-gray-300">now</p>
            </div>
             <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                    src={movie.posterUrl}
                    alt="Movie Poster"
                    fill
                    className="rounded-lg object-cover"
                />
            </div>
        </div>
        <div className="mt-3">
            <p className="font-semibold text-white">{title}</p>
            <p className="text-sm text-gray-200">{body}</p>
        </div>
    </div>
);


export default function NotificationSender() {
    const { allMovies } = useMovieStore();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationBody, setNotificationBody] = useState('');

    const recentMovies = useMemo(() => {
        const threshold = subHours(new Date(), 48);
        return allMovies
            .filter(movie => movie.createdAt && isAfter(parseISO(movie.createdAt), threshold))
            .sort((a, b) => parseISO(b.createdAt!).getTime() - parseISO(a.createdAt!).getTime());
    }, [allMovies]);

    const handlePrepareNotification = (movie: Movie) => {
        setSelectedMovie(movie);
        setNotificationTitle(movie.title);
        setNotificationBody(`Watch or Download ${movie.title} (${movie.year}) now on FILMPLEX!`);
    };
    
    const handleSendNotification = () => {
        if (!selectedMovie) return;
        
        startTransition(async () => {
            // TODO: Call the actual function to send the notification via FCM
            console.log('Sending notification for:', selectedMovie.title);
            console.log('Title:', notificationTitle);
            console.log('Body:', notificationBody);

            // Placeholder for the actual API call.
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast({
                title: 'Notification Sent!',
                description: `A notification for "${selectedMovie.title}" has been sent to all subscribed users.`,
            });
            setSelectedMovie(null);
        });
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Send Push Notifications</CardTitle>
                    <CardDescription>Manually send a push notification to all subscribed users for recently uploaded content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h3 className="text-lg font-semibold mb-2">Movies Uploaded in Last 48 Hours</h3>
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                            {recentMovies.length > 0 ? (
                                recentMovies.map(movie => (
                                    <div key={movie.id} className="p-3 bg-secondary rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{movie.title}</p>
                                            <p className="text-sm text-muted-foreground">{movie.year} &bull; {movie.genre}</p>
                                        </div>
                                        <Button size="sm" onClick={() => handlePrepareNotification(movie)}>
                                            <BellRing className="mr-2 h-4 w-4" />
                                            Prepare Notification
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-10">No movies have been uploaded in the last 48 hours.</p>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Dialog open={!!selectedMovie} onOpenChange={(isOpen) => !isOpen && setSelectedMovie(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Prepare & Send Push Notification</DialogTitle>
                        <DialogDescription>Edit the content and preview how the notification will look on a user's device.</DialogDescription>
                    </DialogHeader>

                    {selectedMovie && (
                        <div className="space-y-6 py-4">
                             <div>
                                <h4 className="font-semibold text-center mb-2">Device Popup Preview</h4>
                                <NotificationPreview 
                                    movie={selectedMovie} 
                                    title={notificationTitle}
                                    body={notificationBody}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notif-title">Notification Title</Label>
                                <Input 
                                    id="notif-title"
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="notif-body">Notification Body</Label>
                                <Input 
                                    id="notif-body"
                                    value={notificationBody}
                                    onChange={(e) => setNotificationBody(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isPending}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSendNotification} disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            {isPending ? 'Sending...' : 'Send Notification'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
