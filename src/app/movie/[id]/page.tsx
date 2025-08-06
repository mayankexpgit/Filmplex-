
'use client';

import { useEffect, useState } from 'react';
import type { Movie, Comment as CommentType, Reactions } from '@/lib/data';
import { useMovieStore, fetchMovieData, fetchCommentsForMovie, submitComment, submitReaction } from '@/store/movieStore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Zap, ThumbsUp, Heart, Smile, SmilePlus, Frown, Angry, Send } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import MovieCardSmall from '@/components/movie-card-small';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

function MoviePageLoader() {
    return (
        <div>
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
                <div className="container max-w-screen-2xl">
                    <MovieCardSmall />
                </div>
            </header>
            <main className="container mx-auto py-8 md:py-12">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <Skeleton className="w-full max-w-sm aspect-[2/3] rounded-lg mb-8" />
                    <Skeleton className="h-10 w-3/4 mb-6" />
                    <div className="space-y-3 w-1/2 mb-6">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </main>
        </div>
    )
}

const ReactionButton = ({ Icon, count, onClick, disabled }: { Icon: React.ElementType, count: number, onClick: () => void, disabled: boolean }) => (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled} className="flex items-center gap-2 transition-all hover:bg-accent focus:ring-2 focus:ring-primary/50">
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{count}</span>
    </Button>
);

function CommentsSection({ movieId }: { movieId: string }) {
    const { comments, setComments } = useMovieStore();
    const [newComment, setNewComment] = useState("");
    const [userName, setUserName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchCommentsForMovie(movieId);
        // Clear comments when movie changes
        return () => setComments([]);
    }, [movieId, setComments]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !userName.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please enter your name and a comment.',
            });
            return;
        }
        setIsSubmitting(true);
        try {
            await submitComment(movieId, userName, newComment);
            setNewComment("");
            // User name persists for next comment
            toast({
                title: 'Success!',
                description: 'Your comment has been posted.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to post comment. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="w-full max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-foreground">Leave a Comment</h2>
            <form onSubmit={handleCommentSubmit} className="space-y-4 mb-8">
                <Input 
                    placeholder="Your Name" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    className="bg-secondary border-border"
                    disabled={isSubmitting}
                />
                <Textarea 
                    placeholder="Write your comment here..." 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    rows={4} 
                    className="bg-secondary border-border"
                    disabled={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting}>
                    <Send className="mr-2 h-4 w-4"/>
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
            </form>
            
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground">Be the first to comment!</p>
                ) : (
                    comments.slice(0, 4).map((comment: CommentType) => (
                        <div key={comment.id} className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                                {comment.user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 bg-secondary p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-foreground">@{comment.user}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const { isInitialized, latestReleases, featuredMovies } = useMovieStore();
  const [movie, setMovie] = useState<Movie | undefined>();
  const [hasReacted, setHasReacted] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      fetchMovieData();
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      const allMovies = [...latestReleases, ...featuredMovies];
      const foundMovie = allMovies.find(m => m.id === params.id);
      setMovie(foundMovie);
    }
  }, [isInitialized, latestReleases, featuredMovies, params.id]);

  if (!isInitialized || !movie) {
    return <MoviePageLoader />;
  }

  const handleReactionClick = (reaction: keyof Reactions) => {
    if (hasReacted) return;
    submitReaction(movie.id, reaction);
    setHasReacted(true);
  }

  const InfoRow = ({ label, value }: { label: string, value?: string | number | null }) => {
    if (!value && typeof value !== 'number') return null;
    return (
      <p className="text-base text-foreground">
        <span className="font-semibold">{label}: </span>
        {value}
      </p>
    )
  }

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
        <div className="container max-w-screen-2xl">
           <MovieCardSmall />
        </div>
      </header>
      <main className="container mx-auto py-8 md:py-12">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="relative w-full max-w-sm aspect-[2/3] overflow-hidden rounded-lg mb-8">
            <Image
              src={movie.posterUrl}
              alt={`Poster for ${movie.title}`}
              fill
              className="object-cover"
              data-ai-hint="movie poster"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">{movie.title} ({movie.year})</h1>
          
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <InfoRow label="iMDB Rating" value={movie.imdbRating ? `${movie.imdbRating}/10` : null} />
            <InfoRow label="Genre" value={movie.genre} />
            <InfoRow label="Stars" value={movie.stars} />
            <InfoRow label="Creator" value={movie.creator} />
            <InfoRow label="Language" value={movie.language} />
            <InfoRow label="Quality" value={movie.quality} />
            {movie.contentType === 'series' && <InfoRow label="Total Episodes" value={movie.episodes?.length} />}
          </div>
          
          <Separator className="my-4 w-full" />

          {movie.screenshots && movie.screenshots.length > 0 && (
            <section className="w-full mb-8">
              <h2 className="text-2xl font-bold mb-4 text-center">: Screen-Shots :</h2>
              <div className="flex flex-col items-center gap-4">
                {movie.screenshots.map((src, index) => (
                  <div key={index} className="relative w-full max-w-2xl aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={src}
                      alt={`Screenshot ${index + 1} for ${movie.title}`}
                      fill
                      className="object-contain"
                      data-ai-hint="movie screenshot"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {movie.contentType === 'movie' && movie.downloadLinks && movie.downloadLinks.length > 0 && (
             <section className="w-full mb-12">
              <h2 className="text-2xl font-bold mb-4 text-center">Download Links</h2>
              <div className="space-y-3 flex flex-col items-center">
                {movie.downloadLinks.map((link, index) => (
                  <Button key={index} asChild variant="default" size="lg" className="justify-between hover:brightness-110">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <div className="flex items-center gap-4">
                        <Download />
                        <span>{link.quality} {link.size && `(${link.size})`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span>Download</span>
                          <Zap className="h-4 w-4" />
                      </div>
                    </a>
                  </Button>
                ))}
              </div>
            </section>
          )}

          {movie.contentType === 'series' && movie.episodes && movie.episodes.length > 0 && (
            <section className="w-full mb-8">
                <h2 className="text-2xl font-bold mb-4 text-center">Episodes</h2>
                <div className="space-y-6 w-full max-w-2xl mx-auto">
                    {movie.episodes.map((ep, epIndex) => (
                        <div key={epIndex} className="p-4 border rounded-lg bg-card">
                            <h3 className="text-lg font-semibold mb-3">Episode {ep.episodeNumber}{ep.title && `: ${ep.title}`}</h3>
                            <div className="space-y-3 flex flex-col items-center">
                                {ep.downloadLinks.map((link, linkIndex) => (
                                     <Button key={linkIndex} asChild variant="default" size="lg" className="justify-between hover:brightness-110">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                                            <div className="flex items-center gap-4">
                                                <Download />
                                                <span>{link.quality} {link.size && `(${link.size})`}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>Download</span>
                                                <Zap className="h-4 w-4" />
                                            </div>
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          )}
          
          {movie.contentType === 'series' && movie.seasonDownloadLinks && movie.seasonDownloadLinks.length > 0 && (
             <section className="w-full mb-12">
              <h2 className="text-2xl font-bold mb-4 text-center">Download Full Season</h2>
              <div className="space-y-3 flex flex-col items-center">
                {movie.seasonDownloadLinks.map((link, index) => (
                  <Button key={index} asChild variant="default" size="lg" className="justify-between hover:brightness-110">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <div className="flex items-center gap-4">
                        <Download />
                        <span>{link.quality} {link.size && `(${link.size})`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span>Download</span>
                          <Zap className="h-4 w-4" />
                      </div>
                    </a>
                  </Button>
                ))}
              </div>
            </section>
          )}

          {movie.description && (
            <section className="mb-8 w-full">
              <h2 className="text-2xl font-bold mb-4 text-center text-foreground">Description</h2>
              <div 
                className="prose prose-lg prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: movie.description.replace(/\n/g, '<br />') }}
              />
            </section>
          )}
          
          <Separator className="my-8 w-full" />
          
          <section className="w-full mb-8">
              <h2 className="text-2xl font-bold mb-4 text-center text-foreground">What's your reaction?</h2>
              <div className="flex justify-center flex-wrap gap-4">
                  <ReactionButton Icon={ThumbsUp} count={movie.reactions?.like ?? 0} onClick={() => handleReactionClick('like')} disabled={hasReacted} />
                  <ReactionButton Icon={Heart} count={movie.reactions?.love ?? 0} onClick={() => handleReactionClick('love')} disabled={hasReacted} />
                  <ReactionButton Icon={Smile} count={movie.reactions?.haha ?? 0} onClick={() => handleReactionClick('haha')} disabled={hasReacted} />
                  <ReactionButton Icon={SmilePlus} count={movie.reactions?.wow ?? 0} onClick={() => handleReactionClick('wow')} disabled={hasReacted} />
                  <ReactionButton Icon={Frown} count={movie.reactions?.sad ?? 0} onClick={() => handleReactionClick('sad')} disabled={hasReacted} />
                  <ReactionButton Icon={Angry} count={movie.reactions?.angry ?? 0} onClick={() => handleReactionClick('angry')} disabled={hasReacted} />
              </div>
              {hasReacted && <p className="text-center text-sm text-primary mt-4">Thanks for your reaction!</p>}
          </section>

          <Separator className="my-8 w-full" />
          
          <CommentsSection movieId={movie.id} />

        </div>
      </main>
    </div>
  );
}

    