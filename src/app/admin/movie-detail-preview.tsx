
'use client';

import type { Movie } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Zap } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';


interface PreviewProps {
    movie: Movie
}

export default function MovieDetailPreview({ movie }: PreviewProps) {
  const posterSrc = movie.posterUrl || "https://placehold.co/300x450.png";

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
    <div className="bg-background min-h-full text-foreground">
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
        <div className="container max-w-screen-2xl">
           <Skeleton className="h-10 w-48" />
        </div>
      </header>
      <main className="container mx-auto py-8 md:py-12">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="relative w-full max-w-sm aspect-[2/3] overflow-hidden rounded-lg mb-8">
            <Image
              src={posterSrc}
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
            <InfoRow label="No. of Episodes" value={movie.episodes} />
            <InfoRow label="Language" value={movie.language} />
            <InfoRow label="Quality" value={movie.quality} />
          </div>

          <Separator className="my-4 w-full" />
          
           {movie.synopsis && (
            <section className="mb-8 w-full">
              <div 
                className="prose prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: movie.synopsis.replace(/\n/g, '<br />') }}
              />
            </section>
          )}

          {movie.screenshots && movie.screenshots.length > 0 && movie.screenshots[0] && (
            <section className="w-full mb-8">
              <h2 className="text-2xl font-bold mb-4 text-center text-red-500">: Screen-Shots :</h2>
              <div className="flex flex-col items-center gap-4">
                {movie.screenshots.map((src, index) => (
                  src && <div key={index} className="relative w-full max-w-2xl aspect-video overflow-hidden rounded-lg">
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

          {movie.downloadLinks && movie.downloadLinks.length > 0 && movie.downloadLinks[0]?.url && (
            <section className="w-full mb-12">
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Download Links</h2>
              <div className="space-y-3">
                {movie.downloadLinks.map((link, index) => (
                  <Button key={index} asChild variant="default" size="lg" className="w-full justify-between hover:brightness-110">
                    <a href={link.url || '#'} target="_blank" rel="noopener noreferrer">
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
        </div>
      </main>
    </div>
  );
}
