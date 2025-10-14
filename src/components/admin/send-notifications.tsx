
'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
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
import { Send, BellRing, Loader2, ShieldCheck, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/ai/flows/send-fcm-notification-flow';
import { Switch } from '../ui/switch';
import { getFirestore, collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NotificationPreview = ({ movie, title, body }: { movie: Movie; title: string; body: string }) => (
    <div className="bg-black/70 backdrop-blur-sm p-4 rounded-3xl max-w-sm mx-auto border border-gray-700">
        <div className="flex items-start gap-4">
            <div className="relative w-24 h-36 flex-shrink-0">
                <Image
                    src={movie.posterUrl}
                    alt="Movie Poster"
                    fill
                    className="rounded-lg object-cover"
                />
            </div>
            <div className="flex-1 space-y-1">
                <p className="text-sm font-bold text-white">FILMPLEX</p>
                <p className="text-xs text-gray-300">now</p>
                <p className="font-semibold text-white pt-2">{title}</p>
                <p className="text-sm text-gray-200">{body}</p>
            </div>
        </div>
    </div>
);

const PermissionPromptPreview = () => (
    <Card>
        <CardHeader>
            <CardTitle>Permission Prompt Preview</CardTitle>
            <CardDescription>This is what new users see when they are first asked for notification permission.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="w-full max-w-md mx-auto p-6 rounded-lg bg-background border shadow-lg text-foreground">
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                        <BellRing className="h-6 w-6 text-primary" />
                        Get Notified About New Movies & Web Series!
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                         Click "Yes, notify me" to receive instant alerts when new movies and web series are available. We respect your privacy and will only send you important updates. You can manage these settings in your browser anytime.
                    </p>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary border border-border my-4">
                    <ShieldCheck className="h-8 w-8 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Smart Protection</h4>
                        <p className="text-xs text-muted-foreground">Avoid Malware, virus and any apk download.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="smart-protection-switch-preview" checked={true} disabled className="opacity-100 cursor-default" />
                        <Label htmlFor="smart-protection-switch-preview" className="text-sm font-medium">Enable</Label>
                    </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                    <Button variant="outline">⚠️ No, thanks</Button>
                    <Button>😄 Yes, notify me</Button>
                </div>
            </div>
        </CardContent>
    </Card>
);


export default function NotificationSender() {
    const { allMovies } = useMovieStore();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [subscribedCount, setSubscribedCount] = useState<number | null>(null);

    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationBody, setNotificationBody] = useState('');

    useEffect(() => {
        const fetchSubscribedCount = async () => {
            try {
                const tokensCollection = collection(db, 'fcmTokens');
                const snapshot = await getCountFromServer(tokensCollection);
                setSubscribedCount(snapshot.data().count);
            } catch (error) {
                console.error("Could not fetch subscribed count:", error);
                setSubscribedCount(0);
            }
        };
        fetchSubscribedCount();
    }, []);

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
            try {
                const result = await sendNotification({
                    title: notificationTitle,
                    body: notificationBody,
                    icon: '/favicon-32x32.png', // A small icon
                    image: selectedMovie.posterUrl
                });

                toast({
                    title: 'Notification Sent!',
                    description: `Successfully sent to ${result.successCount} devices. ${result.failureCount} failed. ${result.tokensRemoved} invalid tokens removed.`,
                    variant: 'success'
                });
                // Refetch count after sending and cleaning
                const tokensCollection = collection(db, 'fcmTokens');
                const snapshot = await getCountFromServer(tokensCollection);
                setSubscribedCount(snapshot.data().count);
            } catch(error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Sending Failed',
                    description: error.message || 'Could not send notifications. Please try again later.'
                });
            } finally {
                setSelectedMovie(null);
            }
        });
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Send Push Notifications</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                        <span>Manually send a push notification to all subscribed users.</span>
                         {subscribedCount !== null && (
                            <div className="flex items-center gap-2 text-sm font-semibold p-2 rounded-md bg-secondary">
                                <Users className="h-5 w-5 text-primary"/>
                                <span>Total Subscribed Devices: {subscribedCount}</span>
                            </div>
                        )}
                    </CardDescription>
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

            <PermissionPromptPreview />

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
        </div>
    );
}
