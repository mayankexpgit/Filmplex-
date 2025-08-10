
'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare, ArrowLeft, ThumbsUp, Heart, Smile, SmilePlus, Frown, Angry } from 'lucide-react';
import { useMovieStore, deleteComment as storeDeleteComment, fetchCommentsForMovie } from '@/store/movieStore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { Movie, Reactions } from '@/lib/data';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

const ReactionDisplay = ({ Icon, count, label }: { Icon: React.ElementType, count: number, label: string }) => (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary">
        <Icon className="w-6 h-6" />
        <span className="font-bold text-lg">{count}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
    </div>
);

function MovieCommentsView({ movie, onBack }: { movie: Movie, onBack: () => void }) {
    const { comments } = useMovieStore();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        fetchCommentsForMovie(movie.id);
    }, [movie.id]);

    const handleDelete = (commentId: string) => {
        startTransition(async () => {
            try {
                await storeDeleteComment(movie.id, commentId);
                toast({
                    title: 'Comment Removed',
                    description: `The comment has been successfully deleted.`,
                });
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Database Error',
                    description: 'Could not delete the comment. Please try again.',
                });
            }
        });
    };

    const totalReactions = movie.reactions ? Object.values(movie.reactions).reduce((a, b) => a + b, 0) : 0;

    return (
        <div>
             <Button variant="ghost" onClick={onBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Movie List
            </Button>
            <CardHeader className="p-0 mb-4">
                <CardTitle>{movie.title} - Comments & Reactions</CardTitle>
                <CardDescription>View and manage user feedback for this movie.</CardDescription>
            </CardHeader>
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-xl">Reactions</CardTitle>
                    <CardDescription>Total reactions: {totalReactions}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
                        <ReactionDisplay Icon={ThumbsUp} count={movie.reactions?.like ?? 0} label="Likes"/>
                        <ReactionDisplay Icon={Heart} count={movie.reactions?.love ?? 0} label="Loves"/>
                        <ReactionDisplay Icon={Smile} count={movie.reactions?.haha ?? 0} label="Haha"/>
                        <ReactionDisplay Icon={SmilePlus} count={movie.reactions?.wow ?? 0} label="Wow"/>
                        <ReactionDisplay Icon={Frown} count={movie.reactions?.sad ?? 0} label="Sad"/>
                        <ReactionDisplay Icon={Angry} count={movie.reactions?.angry ?? 0} label="Angry"/>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            <Card className="mt-6">
                 <CardHeader>
                    <CardTitle className="text-xl">Comments</CardTitle>
                    <CardDescription>Total comments: {comments.length}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                    {comments.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">No comments for this movie yet.</p>
                    ) : (
                        <div className="space-y-4">
                        {comments.map((item) => (
                            <div key={item.id} className="p-3 bg-secondary rounded-lg flex justify-between items-start">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                <p className="text-sm text-foreground font-semibold">@{item.user}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.text}</p>
                                <p className="text-xs text-muted-foreground pt-1">
                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} disabled={isPending}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </div>
                        ))}
                        </div>
                    )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}


export default function CommentsManager() {
    const { latestReleases, featuredMovies, allComments, setAllComments } = useMovieStore();
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const allMovies = useMemo(() => {
        const uniqueMovies = [...latestReleases, ...featuredMovies].filter(
            (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
        );
        return uniqueMovies.sort((a,b) => a.title.localeCompare(b.title));
    }, [latestReleases, featuredMovies]);

    const filteredMovies = useMemo(() => {
        if (!searchQuery) return allMovies;
        return allMovies.filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allMovies, searchQuery]);

    if (selectedMovie) {
        return <MovieCommentsView movie={selectedMovie} onBack={() => setSelectedMovie(null)} />
    }

    return (
        <Card>
        <CardHeader>
            <CardTitle>Manage Comments</CardTitle>
            <CardDescription>Select a movie to view its comments and reactions.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <Input 
                    placeholder="Search for a movie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <ScrollArea className="h-[500px] pr-4">
            {filteredMovies.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No movies found.</p>
            ) : (
                <div className="space-y-2">
                {filteredMovies.map((movie) => (
                    <div 
                        key={movie.id} 
                        className="p-3 bg-secondary rounded-lg flex justify-between items-center cursor-pointer hover:bg-accent"
                        onClick={() => setSelectedMovie(movie)}
                    >
                        <div className="flex-1 space-y-1">
                            <p className="text-base font-semibold text-foreground">{movie.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {movie.year} &bull; {movie.genre}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{(movie.reactions ? Object.values(movie.reactions).reduce((a, b) => a + b, 0) : 0)} reactions</span>
                             <MessageSquare className="h-4 w-4"/>
                        </div>
                    </div>
                ))}
                </div>
            )}
            </ScrollArea>
        </CardContent>
        </Card>
    );
}
