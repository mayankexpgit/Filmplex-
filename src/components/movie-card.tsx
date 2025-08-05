'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Movie } from '@/lib/data';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'featured';
}

export default function MovieCard({ movie, variant = 'default' }: MovieCardProps) {
  if (variant === 'featured') {
    return (
      <div className="group relative block overflow-hidden rounded-md">
        <Image
          src={movie.posterUrl}
          alt={`Poster for ${movie.title}`}
          width={400}
          height={600}
          className="w-full h-auto object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-2">
      <Image
        src={movie.posterUrl}
        alt={`Poster for ${movie.title}`}
        width={400}
        height={600}
        className="w-full h-auto object-cover aspect-[2/3] rounded-md"
        data-ai-hint="movie poster"
      />
      <h3 className="font-semibold text-sm text-foreground text-left leading-tight">
        {movie.title} ({movie.year})
      </h3>
      <p className="text-xs text-muted-foreground text-left">
        {movie.genre}
      </p>
    </div>
  );
}
