'use client';

import Image from 'next/image';
import type { Movie } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface MovieCardProps {
  movie: Movie;
  variant?: 'small' | 'large' | 'featured';
}

export default function MovieCard({ movie, variant = 'large' }: MovieCardProps) {
  if (variant === 'featured') {
    return (
      <div className="group">
        <div className="relative block overflow-hidden rounded-md">
          <Image
            src={movie.posterUrl}
            alt={`Poster for ${movie.title}`}
            width={380}
            height={570}
            className="w-full h-auto object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="movie poster"
          />
        </div>
      </div>
    );
  }

  if (variant === 'small') {
    return (
      <div className="group">
        <div className="relative block overflow-hidden rounded-md">
          <Image
            src={movie.posterUrl}
            alt={`Poster for ${movie.title}`}
            width={380}
            height={570}
            className="w-full h-auto object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="movie poster"
          />
        </div>
        <div className="mt-2">
          <h3 className="font-bold truncate text-foreground text-sm">
            {movie.title}
          </h3>
          <div className="text-muted-foreground text-xs">
            <span>{movie.year}</span> &bull; <span>{movie.genre}</span>
          </div>
        </div>
      </div>
    );
  }

  // Large variant with dark section for details
  return (
    <Card className="overflow-hidden bg-card border-0 group rounded-lg flex flex-col">
       <CardContent className="p-0 flex flex-col h-full">
        <div className="relative block overflow-hidden">
          <Image
            src={movie.posterUrl}
            alt={`Poster for ${movie.title}`}
            width={380}
            height={570}
            className="w-full h-auto object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="movie poster"
          />
        </div>
        <div className="p-3 bg-black flex-grow flex flex-col justify-center">
          <h3 className="font-bold text-foreground text-base leading-tight">
            {movie.title}
          </h3>
          <div className="text-muted-foreground text-sm mt-1">
            <span>{movie.year}</span> &bull; <span>{movie.genre}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
