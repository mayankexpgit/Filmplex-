'use client';

import Image from 'next/image';
import type { Movie } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface MovieCardProps {
  movie: Movie;
  variant?: 'small' | 'large';
}

export default function MovieCard({ movie, variant = 'large' }: MovieCardProps) {
  const isSmall = variant === 'small';

  if (isSmall) {
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

  // Large variant with grey background frame
  return (
    <Card className="overflow-hidden bg-card border-border group rounded-lg">
       <CardContent className="p-0">
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
        <div className="p-3">
          <h3 className="font-bold truncate text-foreground text-base">
            {movie.title}
          </h3>
          <div className="text-muted-foreground text-sm">
            <span>{movie.year}</span> &bull; <span>{movie.genre}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
