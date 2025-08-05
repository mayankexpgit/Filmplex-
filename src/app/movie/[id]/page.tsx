
import { fetchMovies } from '@/services/movieService';
import type { Movie } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, PlayCircle, Share2, MessageSquare, ThumbsUp, Star } from 'lucide-react';
import Link from 'next/link';
import MovieCardSmall from '@/components/movie-card-small';

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

  const trailerUrl = movie.trailerUrl ? `${movie.trailerUrl}?autoplay=1&mute=1&loop=1&playlist=${movie.trailerUrl.split('/').pop()}` : null;


  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
        <div className="container max-w-screen-2xl">
           <MovieCardSmall />
        </div>
      </header>
      <main className="container mx-auto py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Movie Poster */}
          <div className="flex justify-center mb-8">
            <Image
              src={movie.posterUrl}
              alt={`Poster for ${movie.title}`}
              width={300}
              height={450}
              className="rounded-lg shadow-lg"
              data-ai-hint="movie poster"
            />
          </div>

          {/* Movie Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">{movie.title} ({movie.year})</h1>
          
          {/* Share Buttons */}
           <div className="flex justify-center items-center gap-2 mb-8">
              <Button variant="secondary" size="sm"><Share2 className="mr-2" /> Share</Button>
              <Button variant="secondary" size="sm"><MessageSquare className="mr-2" /> Comment</Button>
              <Button variant="secondary" size="sm"><ThumbsUp className="mr-2" /> Like</Button>
              <Button variant="secondary" size="sm"><Star className="mr-2" /> Rate</Button>
          </div>

          {/* Ad Placeholder */}
          <div className="text-center my-8">
             <div className="w-full h-24 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground">
                Advertisement
             </div>
          </div>
          
          {/* Screenshots */}
          {movie.screenshots && movie.screenshots.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Screenshots</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {movie.screenshots.map((src, index) => (
                  <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={src}
                      alt={`Screenshot ${index + 1} for ${movie.title}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      data-ai-hint="movie screenshot"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Download Links */}
          {movie.downloadLinks && movie.downloadLinks.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Download Links</h2>
              <div className="space-y-3">
                {movie.downloadLinks.map((link, index) => (
                  <Button key={index} asChild variant="default" size="lg" className="w-full justify-between bg-gold-metallic text-primary-foreground hover:brightness-110">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <div className="flex items-center gap-4">
                        <Download />
                        <span>{link.quality}</span>
                      </div>
                      <span>Download Now</span>
                    </a>
                  </Button>
                ))}
              </div>
            </section>
          )}
          
          {/* Trailer */}
           <section className="mb-12">
             <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Watch Trailer</h2>
             <div className="aspect-video relative bg-secondary rounded-lg overflow-hidden">
                {trailerUrl ? (
                    <iframe
                        src={trailerUrl}
                        title={`Trailer for ${movie.title}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <PlayCircle className="h-16 w-16" />
                        <p className="ml-4">Trailer not available</p>
                    </div>
                )}
             </div>
           </section>
           
          {/* Synopsis */}
          {movie.synopsis && (
            <section>
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Storyline</h2>
              <p className="leading-relaxed">
                {movie.synopsis}
              </p>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
