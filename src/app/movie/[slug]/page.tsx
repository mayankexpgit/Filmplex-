
'use client';

import { useEffect, useState } from 'react';
import type { Movie, Comment as CommentType, Reactions } from '@/lib/data';
import { useMovieStore, fetchInitialData, fetchCommentsForMovie, submitComment, submitReaction } from '@/store/movieStore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Zap, ThumbsUp, Heart, Smile, SmilePlus, Frown, Angry, Send, Star, LayoutGrid, Users, Video, CalendarDays, Globe, Languages, BadgeCheck, Clock, ListVideo, CheckCircle, Rocket, Flame, Share2, Info } from 'lucide-react';
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
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.39 1.22 4.84l-1.14 4.18 4.28-1.12a9.9 9.9 0 0 0 4.55 1.15h.01c5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.9-9.91-9.9M17.29 15.3c-.22-.11-.76-.38-1.04-.44s-.48-.11-.68.11c-.2.22-.39.44-.48.55-.09.11-.18.12-.33.04-.15-.07-.63-.23-1.2- A-.74-1.2-1.83-2.05-1.92-2.16-.09-.11-.01-.17 0-.28.08-.08.18-.22.27-.33.09-.11.12-.18.18-.3.06-.12.03-.22 0-.33s-.68-1.63-.93-2.24c-.25-.61-.5-.52-.68-.53-.17-.01-.36-.01-.55-.01s-.48.07-.73.33c-.25.27-.95.92-.95 2.24s.97 2.6, 1.11 2.78c.14.18.95 1.51 2.31 2.05.33.13.59.21.79.27.43.12.82.1.1.14.06.31.25.76.92.88.16.11.28.09.39-.02s.48-.55.55-.73c.07-.18.07-.33, 0-.44" />
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
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Use vpn if not downloading</span>
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
                            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                                <Info className="h-4 w-4" />
                                <span>Use vpn if not downloading</span>
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
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Use vpn if not downloading</span>
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

    

    

