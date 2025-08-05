
'use client';

import { useMovieStore } from '@/store/movieStore';
import MovieCard from './movie-card';
import { Button } from './ui/button';
import { Flame, Loader2 } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';
import type { Movie } from '@/lib/data';

const MOVIES_PER_PAGE = 12;

export default function MovieCardLarge() {
  const allMovies: Movie[] = useMovieStore((state) => [
    ...state.featuredMovies,
    ...state.latestReleases,
  ]);
  const searchQuery = useMovieStore((state) => state.searchQuery);
  const [visibleMoviesCount, setVisibleMoviesCount] = useState(MOVIES_PER_PAGE);
  const [isPending, startTransition] = useTransition();

  const uniqueMovies = useMemo(() => {
    const unique = allMovies.filter(
      (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
    );
    return unique.sort((a, b) => a.year - b.year);
  }, [allMovies]);

  const filteredMovies = useMemo(() => {
    if (!searchQuery) {
      return uniqueMovies;
    }
    return uniqueMovies.filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueMovies, searchQuery]);

  const moviesToShow = useMemo(() => {
    return filteredMovies.slice(0, visibleMoviesCount);
  }, [filteredMovies, visibleMoviesCount]);

  const handleMoreMovies = () => {
    startTransition(() => {
        setVisibleMoviesCount(prevCount => prevCount + MOVIES_PER_PAGE);
    });
  };

  return (
    <div>
      <div className="bg-secondary rounded-lg border border-border p-4 mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Flame className="h-7 w-7 text-foreground" />
          <span>All Movies</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-4">
        {moviesToShow.map((movie) => (
          <MovieCard key={movie.id} movie={movie} variant="large" />
        ))}
      </div>
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
