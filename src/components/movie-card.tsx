'use client';

import Image from 'next/image';
import type { Movie } from '@/lib/data';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface MovieCardProps {
  movie: Movie;
  variant?: 'small' | 'large';
}

export default function MovieCard({ movie, variant = 'large' }: MovieCardProps) {
  const isSmall = variant === 'small';

  return (
    <Card className="overflow-hidden bg-transparent border-0 group">
       <CardContent className="p-0">
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
          <h3
            className={cn(
              'font-bold truncate text-foreground',
              isSmall ? 'text-sm' : 'text-base'
            )}
          >
            {movie.title}
          </h3>
          <div
            className={cn(
              'text-muted-foreground',
              isSmall ? 'text-xs' : 'text-sm'
            )}
          >
            <span>{movie.year}</span> &bull; <span>{movie.genre}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
