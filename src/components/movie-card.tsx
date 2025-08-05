'use client';

import Image from 'next/image';
import { Download, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Movie } from '@/lib/data';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useToast } from '@/hooks/use-toast';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { toast } = useToast();

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: 'Download Started',
      description: `Downloading "${movie.title}"...`,
    });
    console.log(`Downloading ${movie.title}`);
  };

  return (
    <Card
      className={cn(
        'group relative block overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl',
        'bg-card border-border'
      )}
    >
      <CardContent className="p-0">
        <Image
          src={movie.posterUrl}
          alt={`Poster for ${movie.title}`}
          width={400}
          height={600}
          className="w-full h-auto object-cover aspect-[2/3]"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-300" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <PlayCircle className="w-16 h-16 text-white/80" />
        </div>
        <div className="absolute bottom-0 left-0 p-3 w-full">
          <h3 className="font-bold text-base text-white drop-shadow-md truncate">{movie.title}</h3>
          <p className="text-xs text-gray-300 drop-shadow-md">{movie.year} &middot; {movie.genre}</p>
        </div>
      </CardContent>
    </Card>
  );
}
