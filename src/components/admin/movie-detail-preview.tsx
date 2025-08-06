
'use client';

import type { Movie } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Share2, MessageSquare, ThumbsUp, Star } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface PreviewProps {
    movie: Movie
}

export default function MovieDetailPreview({ movie }: PreviewProps) {
  // Use a placeholder if posterUrl is empty
  const posterSrc = movie.posterUrl || "https://placehold.co/300x450.png";
  
  return (
    <div className="bg-background min-h-full text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
        <div className="container max-w-screen-2xl">
           <Skeleton className="h-10 w-48" />
        </div>
      </header>
      <main className="container mx-auto py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Movie Poster */}
          <div className="flex justify-center mb-8">
            <div className="relative w-[300px] h-[450px]">
                 <Image
                    src={posterSrc}
                    alt={`Poster for ${movie.title}`}
                    fill
                    className="rounded-lg shadow-lg object-cover"
                    data-ai-hint="movie poster"
                />
            </div>
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
          
          {/* Download Links */}
          {movie.downloadLinks && movie.downloadLinks.length > 0 && movie.downloadLinks[0]?.url && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Download Links</h2>
              <div className="space-y-3">
                {movie.downloadLinks.map((link, index) => (
                  <Button key={index} asChild variant="default" size="lg" className="w-full justify-between bg-gold-metallic text-primary-foreground hover:brightness-110">
                    <a href={link.url || '#'} target="_blank" rel="noopener noreferrer">
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
           
          {/* Synopsis */}
          {movie.synopsis && (
            <section>
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Storyline</h2>
              <div 
                className="leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: movie.synopsis.replace(/\n/g, '<br />') }}
              />
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
