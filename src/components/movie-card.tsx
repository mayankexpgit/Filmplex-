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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
          <h3 className="font-bold text-sm truncate">{movie.title}</h3>
          <p className="text-xs text-gray-300">{movie.year}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-2">
      <div className="group relative block overflow-hidden rounded-md">
        <Image
          src={movie.posterUrl}
          alt={`Poster for ${movie.title}`}
          width={400}
          height={600}
          className="w-full h-auto object-cover aspect-[2/3] rounded-md transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <p className="text-white text-center p-2">{movie.title} ({movie.year})</p>
        </div>
      </div>
      <h3 className="font-semibold text-sm text-foreground text-left leading-tight truncate">
        {movie.title}
      </h3>
      <p className="text-xs text-muted-foreground text-left">
        {movie.genre}
      </p>
    </div>
  );
}
