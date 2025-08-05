'use client';

import Image from 'next/image';
import { Download } from 'lucide-react';
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
        movie.isFeatured ? 'border-2 border-primary shadow-primary/20' : 'border-border',
        'bg-card'
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300 group-hover:bg-black/40" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <div className="transition-all duration-300 opacity-100 group-hover:opacity-0">
            <h3 className="font-bold text-lg text-white drop-shadow-md truncate">{movie.title}</h3>
            <p className="text-sm text-gray-300 drop-shadow-md">{movie.year}</p>
          </div>
          <div className="absolute bottom-4 left-4 right-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
             <h3 className="font-bold text-lg text-white drop-shadow-md truncate">{movie.title}</h3>
            <p className="text-sm text-gray-300 drop-shadow-md mb-2">{movie.genre}</p>
            <Button
              size="sm"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
