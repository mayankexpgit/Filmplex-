
'use client';

import Image from 'next/image';
import type { Movie } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  variant?: 'small' | 'large' | 'featured';
}

export default function MovieCard({ movie, variant = 'large' }: MovieCardProps) {
  const qualityToDisplay = movie.downloadLinks?.[0]?.quality;

  const cardContent = (
    <Card className="overflow-hidden bg-secondary border-0 group rounded-lg flex flex-col h-full cursor-pointer">
       <CardContent className="p-0 flex flex-col h-full">
        <div className="relative block overflow-hidden aspect-[2/3]">
          <Image
            src={movie.posterUrl}
            alt={`Poster for ${movie.title}`}
            fill
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="movie poster"
          />
          {qualityToDisplay && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 bg-destructive/80 text-destructive-foreground backdrop-blur-sm border-primary"
            >
              {qualityToDisplay}
            </Badge>
          )}
        </div>
        <div className="p-2 flex-grow flex flex-col">
          <h3 className="font-bold text-foreground text-sm leading-tight truncate">
            {movie.title}
          </h3>
          <p className="text-muted-foreground text-xs mt-1">
            {movie.year}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
              {movie.language && (
                 <Badge variant="outline" className="text-xs">{movie.language}</Badge>
              )}
               {movie.imdbRating && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  {movie.imdbRating}
                </Badge>
              )}
          </div>
          <div className="flex flex-wrap gap-1 mt-2 flex-grow items-end">
            {movie.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs rounded-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const smallVariantContent = (
     <div className="group cursor-pointer">
        <div className="relative block overflow-hidden aspect-[2/3]">
          <Image
            src={movie.posterUrl}
            alt={`Poster for ${movie.title}`}
            fill
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="movie poster"
          />
          {qualityToDisplay && (
             <Badge
              variant="destructive"
              className="absolute top-2 right-2 bg-destructive/80 text-destructive-foreground backdrop-blur-sm border-primary"
            >
              {qualityToDisplay}
            </Badge>
          )}
        </div>
      </div>
  );

  if (variant === 'featured' || variant === 'small') {
     return (
       <Link href={`/movie/${movie.id}`} passHref>
         {smallVariantContent}
       </Link>
    );
  }

  // Large variant
  return (
    <Link href={`/movie/${movie.id}`} passHref>
      {cardContent}
    </Link>
  );
}
