
'use client';

import { useMovieStore } from '@/store/movieStore';
import MovieCard from './movie-card';
import { Button } from './ui/button';
import { Flame, Loader2 } from 'lucide-react';
import { useMemo, useState, useTransition, useEffect } from 'react';
import type { Movie } from '@/lib/data';

const MOVIES_PER_PAGE = 12;

const smartFilterTags: Record<string, string[]> = {
    'Bollywood': ['bollywood', 'hindi', 'indian cinema'],
    'Hollywood': ['hollywood', 'english'],
    'Anime': ['anime', 'animation', 'japanese'],
    'Dubbed': ['dubbed', 'hindi-dubbed'],
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
  featuredMovies: Movie[];
}

export default function MovieCardLarge({ movies }: MovieCardLargeProps) {
  const { searchQuery, selectedGenre, selectedQuality } = useMovieStore((state) => ({
    searchQuery: state.searchQuery,
    selectedGenre: state.selectedGenre,
    selectedQuality: state.selectedQuality,
  }));
  const [visibleMoviesCount, setVisibleMoviesCount] = useState(MOVIES_PER_PAGE);
  const [isPending, startTransition] = useTransition();

  const sortedMovies = useMemo(() => {
    // Sort all movies received from the store by creation date, descending.
    // This ensures the newest movies appear first.
    return [...movies].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
  }, [movies]);


  const filteredMovies = useMemo(() => {
    // Start with the full, sorted list of movies.
    let currentMovies = sortedMovies;
    const lowerCaseGenre = selectedGenre.toLowerCase();

    // Apply genre filter
    if (smartFilterTags[selectedGenre]) {
        const tagsToMatch = smartFilterTags[selectedGenre];
        currentMovies = currentMovies.filter((movie) =>
            tagsToMatch.some(tag => 
                (movie.genre?.toLowerCase().includes(tag)) ||
                (movie.tags?.some(t => t.toLowerCase().includes(tag))) ||
                (movie.language?.toLowerCase().includes(tag))
            )
        );
    }
    else if (selectedGenre && selectedGenre !== 'All Genres') {
      currentMovies = currentMovies.filter((movie) =>
        (movie.genre?.toLowerCase().includes(lowerCaseGenre)) ||
        (movie.tags?.some(tag => tag.toLowerCase() === lowerCaseGenre))
      );
    }
    
    // Apply search query filter
    if (searchQuery) {
      currentMovies = currentMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply quality filter
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

  const moviesToShow = useMemo(() => {
    return filteredMovies.slice(0, visibleMoviesCount);
  }, [filteredMovies, visibleMoviesCount]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleMoviesCount(MOVIES_PER_PAGE);
  }, [searchQuery, selectedGenre, selectedQuality]);


  const handleMoreMovies = () => {
    startTransition(() => {
        setVisibleMoviesCount(prevCount => prevCount + MOVIES_PER_PAGE);
    });
  };

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
          {moviesToShow.map((movie) => (
            <MovieCard key={movie.id} movie={movie} variant="large" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No movies found.</p>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {visibleMoviesCount < filteredMovies.length && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleMoreMovies} variant="secondary" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
