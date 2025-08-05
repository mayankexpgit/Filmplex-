'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Movie } from '@/lib/data';
import { Star } from 'lucide-react';
import { Button } from './ui/button';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'featured';
}

export default function MovieCard({ movie, variant = 'default' }: MovieCardProps) {
  return (
    <div className="flex flex-col gap-3 group">
      <div className="relative block overflow-hidden rounded-lg">
        <Image
          src={movie.posterUrl}
          alt={`Poster for ${movie.title}`}
          width={400}
          height={600}
          className="w-full h-auto object-cover aspect-[2/3] rounded-lg transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button variant="outline" size="sm">View Details</Button>
        </div>
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-sm text-foreground leading-tight truncate group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span>8.5</span>
          </div>
          <span>&middot;</span>
          <span>{movie.year}</span>
        </div>
      </div>
    </div>
  );
}
