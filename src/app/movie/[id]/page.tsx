
import { fetchMovies } from '@/services/movieService';
import type { Movie } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, PlayCircle, Share2, MessageSquare, ThumbsUp, Star } from 'lucide-react';
import Link from 'next/link';
import MovieCardSmall from '@/components/movie-card-small';
import { Separator } from '@/components/ui/separator';

async function getMovie(id: string): Promise<Movie | undefined> {
  const movies = await fetchMovies();
  return movies.find((movie) => movie.id === id);
}

export default async function MovieDetailPage({ params }: { params: { id:string } }) {
  const movie = await getMovie(params.id);

  if (!movie) {
    return (
      <div>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
          <div className="container max-w-screen-2xl">
            <MovieCardSmall />
          </div>
        </header>
        <div className="container mx-auto py-12 text-center">
          <h1 className="text-4xl font-bold">Movie not found</h1>
          <p className="text-muted-foreground mt-4">The movie you are looking for does not exist.</p>
          <Button asChild className="mt-8">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const InfoRow = ({ label, value }: { label: string, value?: string | number | null }) => {
    if (!value) return null;
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
          
          {/* Movie Poster */}
           <div className="relative w-full max-w-sm aspect-[2/3] overflow-hidden rounded-lg mb-8">
            <Image
              src={movie.posterUrl}
              alt={`Poster for ${movie.title}`}
              fill
              className="object-cover"
              data-ai-hint="movie poster"
            />
          </div>

          {/* Movie Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">{movie.title} ({movie.year})</h1>
          
          {/* Info Section */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <InfoRow label="iMDB Rating" value={movie.imdbRating ? `${movie.imdbRating}/10` : null} />
            <InfoRow label="Genre" value={movie.genre} />
            <InfoRow label="Stars" value={movie.stars} />
            <InfoRow label="Creator" value={movie.creator} />
            <InfoRow label="No. of Episodes" value={movie.episodes} />
            <InfoRow label="Language" value={movie.language} />
            <InfoRow label="Quality" value={movie.quality} />
          </div>
          
          <Separator className="my-4 w-full" />

          {/* Synopsis */}
          {movie.synopsis && (
            <section className="mb-8 w-full">
              <div 
                className="prose prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: movie.synopsis.replace(/\n/g, '<br />') }}
              />
            </section>
          )}

          {/* Screenshots */}
          {movie.screenshots && movie.screenshots.length > 0 && (
            <section className="w-full mb-8">
              <h2 className="text-2xl font-bold mb-4 text-center text-red-500">: Screen-Shots :</h2>
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

          {/* Download Links */}
          {movie.downloadLinks && movie.downloadLinks.length > 0 && (
            <section className="w-full mb-12">
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Download Links</h2>
              <div className="space-y-3">
                {movie.downloadLinks.map((link, index) => (
                  <Button key={index} asChild variant="default" size="lg" className="w-full justify-between bg-gold-metallic text-primary-foreground hover:brightness-110">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <div className="flex items-center gap-4">
                        <Download />
                        <span>{link.quality} {link.size && `(${link.size})`}</span>
                      </div>
                      <span>Download Now</span>
                    </a>
                  </Button>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
