
'use client';

import Image from 'next/image';
import type { Movie } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  variant?: 'small' | 'large' | 'featured';
}

export default function MovieCard({ movie, variant = 'large' }: MovieCardProps) {
  const getQualityBadge = (): '4K' | 'HD' | null => {
    if (movie.qualityBadge && movie.qualityBadge !== 'none') {
        return movie.qualityBadge;
    }
    if (movie.qualityBadge === 'none') {
        return null;
    }

    let qualities: string[] = [];
    if (movie.contentType === 'movie' && movie.downloadLinks) {
        qualities = movie.downloadLinks.map(link => link.quality.toLowerCase());
    } else if (movie.contentType === 'series' && movie.episodes) {
        qualities = movie.episodes.flatMap(ep => ep.downloadLinks.map(link => link.quality.toLowerCase()));
    }
    
    if (qualities.includes('4k') || qualities.includes('2160p')) {
      return '4K';
    }
    if (qualities.includes('1080p') || qualities.includes('720p')) {
      return 'HD';
    }
    return null;
  };
  
  const qualityToDisplay = getQualityBadge();

  const cardContent = (
    <Card className="overflow-hidden bg-secondary border-0 group rounded-lg flex flex-col h-full cursor-pointer">
       <CardContent className="p-0 flex flex-col h-full">
        <div className="relative block overflow-hidden aspect-[2/3]">
          <Image
            src={movie.posterUrl}
            alt={`Poster for ${movie.title}`}
            fill
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="movie poster"
          />
          {qualityToDisplay && (
            <Badge
              className="absolute top-2 right-2 bg-gold-metallic text-primary-foreground"
            >
              {qualityToDisplay}
            </Badge>
          )}
        </div>
        <div className="p-2 flex-grow flex flex-col justify-start h-36 overflow-hidden">
          {movie.cardInfoText ? (
             <p className="font-bold text-foreground text-sm leading-tight [display:-webkit-box] [-webkit-line-clamp:7] [-webkit-box-orient:vertical] overflow-hidden">
              {movie.cardInfoText}
            </p>
          ) : (
            <>
              <h3 className="font-bold text-foreground text-sm leading-tight truncate">
                {movie.title}
              </h3>
              <div className="text-muted-foreground text-xs mt-1 flex items-center gap-2 truncate">
                <span>{movie.year}</span>
                {movie.language && <span>&bull;</span>}
                <span>{movie.language}</span>
                {movie.imdbRating ? (
                  <>
                    <span>&bull;</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-primary" />
                      <span>{movie.imdbRating}</span>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const smallVariantContent = (
     <div className="group cursor-pointer">
        <div className="relative block overflow-hidden aspect-[2/3]">
          <Image
            src={movie.posterUrl}
            alt={`Poster for ${movie.title}`}
            fill
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="movie poster"
          />
        </div>
      </div>
  );

  if (variant === 'small' || variant === 'featured') {
     return (
       <Link href={`/movie/${movie.id}`} passHref>
         {smallVariantContent}
       </Link>
    );
  }

  // Large variant
  return (
    <Link href={`/movie/${movie.id}`} passHref>
      {cardContent}
    </Link>
  );
}
