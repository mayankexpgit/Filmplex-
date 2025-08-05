'use client';

import Image from 'next/image';
import type { Movie } from '@/lib/data';
import { Button } from './ui/button';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'featured';
}

export default function MovieCard({ movie, variant = 'default' }: MovieCardProps) {
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
    </div>
  );
}
