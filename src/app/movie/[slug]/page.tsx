
'use client';

import { useEffect, useState } from 'react';
import type { Movie, Comment as CommentType, Reactions } from '@/lib/data';
import { useMovieStore, fetchInitialData, fetchCommentsForMovie, submitComment, submitReaction } from '@/store/movieStore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Zap, ThumbsUp, Heart, Smile, SmilePlus, Frown, Angry, Send, Star, LayoutGrid, Users, Video, CalendarDays, Globe, Languages, BadgeCheck, Clock, ListVideo, CheckCircle, Rocket, Flame, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import MovieCardSmall from '@/components/movie-card-small';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { createSlug } from '@/lib/utils';
import FilmpilexLoader from '@/components/ui/filmplex-loader';
import { recordDownload } from '@/services/movieService';

// Custom Download Icon SVG component
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <g className="animate-[bounce-y_1s_infinite]">
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </g>
    </svg>
);


function MoviePageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <FilmpilexLoader />
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
        if (movieId) {
            fetchCommentsForMovie(movieId);
        }
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

    const formatTimestamp = (timestamp: string) => {
        try {
            return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
        } catch (error) {
            return 'just now'; // Fallback for invalid date format
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
                                        {formatTimestamp(comment.timestamp)}
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

function getYouTubeEmbedUrl(url: string | undefined): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
)

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M16.75 13.96c.25.13.43.2.5.28.08.08.14.18.18.28.04.1.06.2.04.3s-.04.2-.08.28c-.04.1-.1.18-.18.25a.87.87 0 0 1-.43.18H16.3c-.1 0-.2 0-.3-.03s-.2-.04-.3-.08a5.53 5.53 0 0 1-1.3-1c-.33-.3-.6-.58-.8-.85s-.38-.5-.5-.7c-.14-.2-.2-.4-.2-.58 0-.1.03-.2.08-.3a.5.5 0 0 1 .13-.1.44.44 0 0 1 .15-.05.42.42 0 0 1 .18.03c.05.03.1.05.13.08s.05.05.08.08c.03.03.04.04.05.05s.03.03.03.03a.2.2 0 0 1 .03.05c.03.08.05.15.08.23s.05.15.05.23c0 .1-.03.2-.08.3s-.1.18-.18.25a.4.4 0 0 1-.2.08c-.08.03-.18.03-.28.03a.75.75 0 0 1-.2-.03c-.08-.03-.15-.05-.23-.08s-.15-.08-.23-.13a2.7 2.7 0 0 1-.4-.3 4.9 4.9 0 0 1-.8-.8 5.6 5.6 0 0 1-.8-1.3c-.03-.08-.05-.15-.05-.23s0-.15.03-.23a.8.8 0 0 1 .1-.25.56.56 0 0 1 .18-.18.7.7 0 0 1 .2-.1.9.9 0 0 1 .3-.03h.2a1 1 0 0 1 .3.05c.1.03.2.1.3.15s.15.1.2.15l.08.05.05.03c.03.03.04.04.05.05s.03.03.03.03a.2.2 0 0 0 .03.05c.03.08.05.15.08.23s.05.15.05.23c0 .1-.03.2-.08.3s-.1.18-.18.25a.4.4 0 0 1-.2.08c-.08.03-.18.03-.28.03s-.2-.03-.28-.05a.84.84 0 0 1-.2-.1l-.1-.08-1-1.3-1.6-2.2c-.2-.2-.3-.4-.4-.58s-.1-.3-.1-.4V10c0-.1.03-.2.08-.3a.5.5 0 0 1 .13-.1c.05-.03.1-.05.15-.05h.1c.05 0 .1 0 .15.03s.1.05.13.08l.08.08.05.05a.6.6 0 0 1 .08.15c.03.08.05.15.05.23v.1a.5.5 0 0 1-.03.15.4.4 0 0 1-.05.1.4.4 0 0 1-.1.1c-.03.03-.05.04-.08.05s-.05.03-.08.03a.2.2 0 0 1-.08.03.4.4 0 0 1-.1 0h-.1a.3.3 0 0 1-.15-.03.4.4 0 0 1-.1-.08.4.4 0 0 1-.05-.1.5.5 0 0 1-.03-.15c0-.05 0-.1.03-.15s.03-.1.05-.13a.3.3 0 0 1 .08-.1.3.3 0 0 1 .1-.05.3.3 0 0 1 .13-.03h.2c.1 0 .2 0 .3.03s.2.04.3.08a2.3 2.3 0 0 1 .8.8c.2.2.4.5.5.7a4.6 4.6 0 0 1 .5 1.2c.03.1.05.2.08.3s.03.2.03.3a.45.45 0 0 1 0 .3c0 .1-.03.2-.08.3s-.1.18-.18.25a.7.7 0 0 1-.25.18.9.9 0 0 1-.3.05h-.2c-.1 0-.2 0-.3-.03s-.2-.04-.3-.08l-1.3-1-2.2-1.6a1 1 0 0 1-.5-.8c0-.2.04-.3.13-.5.08-.1.2-.2.3-.3a2 2 0 0 1 .5-.3 2.8 2.8 0 0 1 1.2-.3h1.2c.5 0 .9.1 1.3.4a2.2 2.2 0 0 1 .8.8c.2.3.4.6.5.9.1.3.2.7.2 1v.3c-.1.4-.2.8-.4 1a2.8 2.8 0 0 1-.8 1.3 3.5 3.5 0 0 1-1.3.8 4.2 4.2 0 0 1-1.7.3h-.2c-.2 0-.3 0-.5-.03s-.3-.04-.5-.08a5.5 5.5 0 0 1-1.3-1c-.3-.3-.6-.6-.8-.9a6.3 6.3 0 0 1-.8-1.3 6.6 6.6 0 0 1-.4-1.6V10c0-.5.1-.9.4-1.3.3-.4.6-.8 1-1.1a3.8 3.8 0 0 1 1.6-1 4.7 4.7 0 0 1 2-.4h.2c.8 0 1.5.1 2.2.4.7.3 1.3.7 1.8 1.2.5.5.9 1.1 1.2 1.8.3.7.4 1.4.4 2.2v.2c0 .8-.1 1.5-.4 2.2a4.7 4.7 0 0 1-1.2 1.8 4.7 4.7 0 0 1-1.8 1.2c-.7.3-1.4.4-2.2.4h-1.2c-.8 0-1.5-.1-2.2-.4a4.7 4.7 0 0 1-1.8-1.2 4.7 4.7 0 0 1-1.2-1.8A5 5 0 0 1 8 12.2v-.2c0-.8.1-1.5.4-2.2.3-.7.7-1.3 1.2-1.8s1.1-.9 1.8-1.2c.7-.3 1.4-.4 2.2-.4h.2c.2 0 .5.03.7.08.2.05.5.13.7.25.2.1.4.2.7.4a4.3 4.3 0 0 1 1.1.9c.3.3.6.7.8 1.1.2.4.3.8.3 1.3v.3c0 .5-.1.9-.3 1.3a3.1 3.1 0 0 1-1.9 1.9c-.3.1-.6.2-.9.2h-.3c-.3 0-.6-.04-.9-.13a2.4 2.4 0 0 1-.8-.4 2.7 2.7 0 0 1-.7-.7 3.6 3.6 0 0 1-.4-1V10c0-.1 0-.2.03-.3s.03-.2.05-.3a.9.9 0 0 1 .1-.25c.05-.08.1-.15.18-.2a.6.6 0 0 1 .4-.15.8.8 0 0 1 .3.05c.1.03.2.1.3.15s.15.1.2.15l.08.05.05.03c.03.03.04.04.05.05s.03.03.03.03a.2.2 0 0 0 .03.05c.03.08.05.15.08.23s.05.15.05.23c0 .1-.03.2-.08.3s-.1.18-.18.25a.4.4 0 0 1-.2.08c-.08.03-.18.03-.28.03s-.2-.03-.28-.05a.84.84 0 0 1-.2-.1l-.1-.08z" />
    </svg>
)

const TelegramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M22 2 2 9.2l7.1 2.9 2.9 7.1L22 2zM9.3 22l.5-4.9-2.3-2.3L9.3 22z" />
        <path d="m11.1 13.3 2.3 2.3 4.9-.5-7.2-1.8z" />
    </svg>
)

function SocialShare({ title, url }: { title: string, url: string }) {
    const text = `Check out "${title}" on FILMPLEX!`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    const shareLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        instagram: `https://www.instagram.com/?url=${encodedUrl}`, // Instagram sharing is more limited
    };

    return (
        <section className="w-full mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-foreground flex items-center justify-center gap-2">
                <Share2 className="h-6 w-6" />
                Share with Friends
            </h2>
            <div className="flex justify-center flex-wrap gap-4">
                <Button asChild variant="outline" className="gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white">
                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon /> WhatsApp
                    </a>
                </Button>
                <Button asChild variant="outline" className="gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white">
                    <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer">
                        <TelegramIcon /> Telegram
                    </a>
                </Button>
                <Button asChild variant="outline" className="gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white">
                    <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                        <FacebookIcon /> Facebook
                    </a>
                </Button>
                <Button asChild variant="outline" className="gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
                    <a href={shareLinks.instagram} target="_blank" rel="noopener noreferrer">
                        <InstagramIcon /> Instagram
                    </a>
                </Button>
            </div>
        </section>
    );
}

export default function MovieDetailPage() {
  const { isInitialized, allMovies, featuredMovies } = useMovieStore();
  const [movie, setMovie] = useState<Movie | undefined>();
  const [hasReacted, setHasReacted] = useState(false);
  const [pageUrl, setPageUrl] = useState('');
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setPageUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      fetchInitialData(false);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && slug) {
      const foundMovie = allMovies.find(m => createSlug(m.title, m.year) === slug);
      setMovie(foundMovie);
    }
  }, [isInitialized, allMovies, slug]);

  if (!isInitialized || !movie) {
    return <MoviePageLoader />;
  }

  const handleDownloadClick = () => {
    if(movie?.id) {
        recordDownload(movie.id);
    }
  }

  const handleReactionClick = (reaction: keyof Reactions) => {
    if (hasReacted || !movie.id) return;
    submitReaction(movie.id, reaction);
    setHasReacted(true);
  }

  const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | number | null }) => {
    if (!value && typeof value !== 'number') return null;
    return (
      <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-primary flex-shrink-0" />
        <div className="flex-grow">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{value}</p>
        </div>
      </div>
    );
  };

  const trailerEmbedUrl = getYouTubeEmbedUrl(movie.trailerUrl);
  
  const formattedReleaseDate = movie.releaseDate ? format(parseISO(movie.releaseDate), 'MMMM d, yyyy') : null;

  const whyChooseItems = [
      {
          icon: CheckCircle,
          title: "Instant Access",
          description: "Direct, lightning-fast links. No ads, no wait, sirf content."
      },
      {
          icon: CheckCircle,
          title: "100% Secure",
          description: "Encrypted flows aur privacy-first system. Tumhara data hamesha safe."
      },
      {
          icon: CheckCircle,
          title: "One-Shot Simplicity",
          description: "3 clicks aur tumhari movie ya webseries ready to play."
      },
      {
          icon: CheckCircle,
          title: "Premium Quality",
          description: "Crystal-clear HD/4K experience, bina kisi compromise ke."
      },
      {
          icon: CheckCircle,
          title: "Always Updated",
          description: "Latest blockbusters aur trending webseries hamesha sabse pehle."
      },
      {
          icon: CheckCircle,
          title: "Error-Proof Execution",
          description: "Har link tested, har flow automated. Zero friction."
      },
       {
          icon: CheckCircle,
          title: "Sleek Design",
          description: "Cyber-inspired, modern UI jo tumhe sirf entertainment par focus karne deta hai."
      }
  ]

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
        <div className="container max-w-screen-2xl">
           <MovieCardSmall movies={featuredMovies} />
        </div>
      </header>
      <main className="container mx-auto py-8 md:py-12">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {movie.cardInfoText && (
            <p className="text-2xl font-bold text-center mb-2 text-foreground whitespace-pre-line">{movie.cardInfoText}</p>
          )}

          <div className="relative w-full max-w-sm aspect-[2/3] overflow-hidden rounded-lg mb-8">
            <Image
              src={movie.posterUrl}
              alt={`Poster for ${movie.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 90vw, 384px"
              data-ai-hint="movie poster"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">{movie.title} ({movie.year})</h1>
          
          <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <InfoItem icon={Star} label="TMDb Rating" value={movie.imdbRating ? `${movie.imdbRating}/10` : 'N/A'} />
            <InfoItem icon={LayoutGrid} label="Genre" value={movie.genre} />
            <InfoItem icon={Users} label="Stars" value={movie.stars} />
            <InfoItem icon={Video} label="Creator" value={movie.creator} />
            <InfoItem icon={CalendarDays} label="Release Date" value={formattedReleaseDate} />
            <InfoItem icon={Globe} label="Country" value={movie.country} />
            <InfoItem icon={Languages} label="Language" value={movie.language} />
            <InfoItem icon={BadgeCheck} label="Quality" value={movie.quality} />
            {movie.contentType === 'movie' && <InfoItem icon={Clock} label="Runtime" value={movie.runtime ? `${movie.runtime} min` : null} />}
            {movie.contentType === 'series' && <InfoItem icon={ListVideo} label="Total Episodes" value={movie.numberOfEpisodes} />}
          </div>
          
          <Separator className="my-4 w-full" />
          
          {trailerEmbedUrl && (
            <section className="w-full mb-8">
                <h2 className="text-2xl font-bold mb-4 text-center">: Watch Trailer :</h2>
                <div className="relative w-full max-w-2xl mx-auto aspect-video overflow-hidden rounded-lg">
                    <iframe
                        src={trailerEmbedUrl}
                        title={`${movie.title} Trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
            </section>
          )}

          {movie.screenshots && movie.screenshots.length > 0 && (
            <section className="w-full mb-8">
              <h2 className="text-2xl font-bold mb-4 text-center">: Screen-Shots :</h2>
              <div className="flex flex-col items-center">
                {movie.screenshots.map((src, index) => (
                  <div key={index} className="relative w-full max-w-2xl overflow-hidden rounded-lg">
                    <Image
                      src={src}
                      alt={`Screenshot ${index + 1} for ${movie.title}`}
                      width={1280}
                      height={720}
                      className="object-contain w-full h-auto"
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
                  <Button key={index} asChild variant="default" size="lg" className="btn-shine group/button justify-between w-full max-w-xs">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={handleDownloadClick}>
                      <div className="flex items-center gap-4">
                        <DownloadIcon />
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
                                     <Button key={linkIndex} asChild variant="default" size="lg" className="btn-shine group/button justify-between w-full max-w-xs">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={handleDownloadClick}>
                                            <div className="flex items-center gap-4">
                                                <DownloadIcon />
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
                  <Button key={index} asChild variant="default" size="lg" className="btn-shine group/button justify-between w-full max-w-xs">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={handleDownloadClick}>
                      <div className="flex items-center gap-4">
                        <DownloadIcon />
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

          {movie.synopsis && (
            <section className="mb-8 w-full">
              <h2 className="text-2xl font-bold mb-4 text-center text-foreground">Synopsis</h2>
              <div 
                className="prose prose-invert text-center text-muted-foreground leading-relaxed max-w-2xl mx-auto"
                dangerouslySetInnerHTML={{ __html: movie.synopsis.replace(/\n/g, '<br />') }}
              />
            </section>
          )}

          {pageUrl && <SocialShare title={movie.title} url={pageUrl} />}

          <Separator className="my-8 w-full" />
          
          <section className="w-full max-w-3xl mx-auto text-foreground p-6 bg-card rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <Flame className="h-6 w-6 text-primary" />
                Why Choose Filmplex.space?
            </h2>
            <ul className="space-y-3">
                {whyChooseItems.map((item, index) => (
                     <li key={index} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                        <item.icon className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <div>
                            <span className="font-semibold">{item.title}:</span>
                            <span className="text-muted-foreground ml-2">{item.description}</span>
                        </div>
                    </li>
                ))}
            </ul>
            <Separator className="my-6" />
            <div className="text-center space-y-4">
                <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    Ready to Stream & Download?
                </h3>
                <div className="p-3 bg-secondary/50 rounded-lg inline-block">
                    <p className="text-muted-foreground">
                       👉 Tumhare favorite movies aur webseries bas 3 clicks door hain.
                    </p>
                </div>
                 <div className="p-3 bg-secondary/50 rounded-lg inline-block ml-2">
                    <p className="text-muted-foreground">
                        👉 No distractions. No delays. Sirf pure entertainment, on demand.
                    </p>
                </div>
            </div>
          </section>

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

          <Separator className="my-8 w-full" />

           <section className="w-full max-w-3xl mx-auto text-muted-foreground text-sm text-center space-y-4">
              <p>
                  Filmplex is one of India's emerging platforms for watching and downloading a wide range of movies and web series, including Bollywood, Hollywood, South Indian, Hindi-dubbed, and more. From the latest blockbusters to timeless classics, Filmplex brings you content directly from original sources — ensuring quality and authenticity across every genre.
              </p>
              <p>
                  Filmplex offers high-quality movies across multiple resolutions like HD, 1080p, 4K, and more. One of its standout features is early movie notifications and scheduled release date alerts, so you never miss a new drop. Whether you're a fan of drama, action, romance, or thrillers — Filmplex has something for everyone.
              </p>
              <p>
                  The platform is 100% free to use, and while currently focused on downloads, streaming options may be available in the near future.
              </p>
          </section>

        </div>
      </main>
    </div>
  );
}

    

    
