'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Movie } from '@/lib/data';
import { Star } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'featured';
}

export default function MovieCard({ movie, variant = 'default' }: MovieCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="group relative block overflow-hidden rounded-lg">
        <Image
          src={movie.posterUrl}
          alt={`Poster for ${movie.title}`}
          width={400}
          height={600}
          className="w-full h-auto object-cover aspect-[2/3] rounded-lg transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="movie poster"
        />
        <div className="absolute top-2 right-2 bg-background/80 text-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 text-primary fill-primary" />
          <span>8.5</span>
        </div>
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-sm text-foreground leading-tight truncate">
          {movie.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {movie.genre}
        </p>
      </div>
    </div>
  );
}
