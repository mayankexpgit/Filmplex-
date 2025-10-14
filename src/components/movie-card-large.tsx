
'use client';

import { useMovieStore } from '@/store/movieStore';
import MovieCard from './movie-card';
import { Button } from './ui/button';
import { Flame, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useMemo, useState, useTransition, useCallback } from 'react';
import type { Movie } from '@/lib/data';
import { useRouter, useSearchParams } from 'next/navigation';

const MOVIES_PER_PAGE = 12;

const smartFilterTags: Record<string, string[]> = {
    'Bollywood': ['bollywood', 'hindi', 'indian cinema'],
    'Hollywood': ['hollywood', 'english'],
    'Anime': ['anime', 'animation', 'japanese'],
    'Dubbed': ['dubbed', 'hindi-dubbed'],
    '18+ Adult': ['18+', 'adult', 'erotic'],
    'South Dubbed': ['south-dubbed', 'telugu dubbed', 'tamil dubbed', 'malayalam dubbed', 'kannada dubbed'],
}

const getQualityBadge = (movie: Movie): '4K' | 'HD' | null => {
    if (movie.qualityBadge && movie.qualityBadge !== 'none') {
        return movie.qualityBadge;
    }
    if (movie.qualityBadge === 'none') {
        return null;
    }

    let qualities: string[] = [];
     if (movie.contentType === 'movie' && movie.downloadLinks) {
        qualities = movie.downloadLinks.map(link => link.quality?.toLowerCase() || '');
    } else if (movie.contentType === 'series' && movie.episodes) {
        qualities = movie.episodes.flatMap(ep => ep.downloadLinks?.map(link => link.quality?.toLowerCase() || '') || []);
    } else if (movie.contentType === 'series' && movie.seasonDownloadLinks) {
        qualities = movie.seasonDownloadLinks.map(link => link.quality?.toLowerCase() || '');
    }
    
    if (qualities.some(q => q.includes('4k') || q.includes('2160p'))) {
      return '4K';
    }
    if (qualities.some(q => q.includes('1080p') || q.includes('720p'))) {
      return 'HD';
    }
    return null;
  };

interface MovieCardLargeProps {
  movies: Movie[];
}

export default function MovieCardLarge({ movies }: MovieCardLargeProps) {
  const { searchQuery, selectedGenre, selectedQuality, currentPage } = useMovieStore((state) => ({
    searchQuery: state.searchQuery,
    selectedGenre: state.selectedGenre,
    selectedQuality: state.selectedQuality,
    currentPage: state.currentPage,
  }));
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
  }, [movies]);


  const filteredMovies = useMemo(() => {
    let currentMovies = sortedMovies;
    
    if (selectedGenre && selectedGenre !== 'All Genres') {
        if (selectedGenre === 'Web Series') {
            currentMovies = currentMovies.filter(movie => movie.contentType === 'series');
        } else {
            const lowerCaseGenre = selectedGenre.toLowerCase();
            const tagsToMatch = smartFilterTags[selectedGenre] || [lowerCaseGenre];
            currentMovies = currentMovies.filter((movie) =>
                tagsToMatch.some(tag => 
                    (movie.genre?.toLowerCase().includes(tag)) ||
                    (movie.tags?.some(t => t.toLowerCase().includes(tag))) ||
                    (movie.language?.toLowerCase().includes(tag))
                )
            );
        }
    }
    
    if (searchQuery) {
      currentMovies = currentMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedQuality !== 'all') {
        currentMovies = currentMovies.filter((movie) => {
            const quality = getQualityBadge(movie);
            if (selectedQuality === '4k') return quality === '4K';
            if (selectedQuality === 'hd') return quality === 'HD';
            return false;
        });
    }

    return currentMovies;
  }, [sortedMovies, searchQuery, selectedGenre, selectedQuality]);
  
  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);

  const moviesToShow = useMemo(() => {
    const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
    const endIndex = startIndex + MOVIES_PER_PAGE;
    return filteredMovies.slice(startIndex, endIndex);
  }, [filteredMovies, currentPage]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (newPage === 1) {
            params.delete('page');
        } else {
            params.set('page', newPage.toString());
        }
        router.push(`/?${params.toString()}`);
    });
  }, [router, searchParams, totalPages]);


  return (
    <div>
      <div className="bg-secondary rounded-lg border border-border p-4 mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Flame className="h-7 w-7 text-primary" />
          <span>Latest Releases</span>
        </h2>
      </div>
       {moviesToShow.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-4">
          {moviesToShow.map((movie, index) => (
            <MovieCard key={`${movie.id}-${index}`} movie={movie} variant="large" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No movies found.</p>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <Button onClick={() => handlePageChange(currentPage - 1)} variant="secondary" disabled={isPending || currentPage <= 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage}
          </span>
          <Button onClick={() => handlePageChange(currentPage + 1)} variant="secondary" disabled={isPending || currentPage >= totalPages}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
