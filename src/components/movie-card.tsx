'use client';

import Image from 'next/image';
import type { Movie } from '@/lib/data';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  variant?: 'small' | 'large';
}

export default function MovieCard({ movie, variant = 'large' }: MovieCardProps) {
  const isSmall = variant === 'small';

  return (
    <div className="flex flex-col group">
      <div className="relative block overflow-hidden rounded-md">
        <Image
          src={movie.posterUrl}
          alt={`Poster for ${movie.title}`}
          width={400}
          height={600}
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
    </div>
  );
}
