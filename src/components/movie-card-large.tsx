'use client';

import { useMovieStore } from '@/store/movieStore';
import MovieCard from './movie-card';
import { Button } from './ui/button';
import { Flame } from 'lucide-react';
import { useMemo, useState } from 'react';

const MOVIES_PER_PAGE = 12;

export default function MovieCardLarge() {
  const latestReleases = useMovieStore((state) => state.latestReleases);
  const searchQuery = useMovieStore((state) => state.searchQuery);
  const [visibleMoviesCount, setVisibleMoviesCount] = useState(MOVIES_PER_PAGE);

  const filteredMovies = useMemo(() => {
    if (!searchQuery) {
      return latestReleases;
    }
    return latestReleases.filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [latestReleases, searchQuery]);

  const moviesToShow = useMemo(() => {
    return filteredMovies.slice(0, visibleMoviesCount);
  }, [filteredMovies, visibleMoviesCount]);

  const handleMoreMovies = () => {
    setVisibleMoviesCount(prevCount => prevCount + MOVIES_PER_PAGE);
  };

  return (
    <div>
      <div className="bg-secondary rounded-lg border border-border p-4 mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Flame className="h-7 w-7 text-foreground" />
          <span>Latest Releases</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-4">
        {moviesToShow.map((movie) => (
          <MovieCard key={movie.id} movie={movie} variant="large" />
        ))}
      </div>
      {visibleMoviesCount < filteredMovies.length && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleMoreMovies}>
            More Movies
          </Button>
        </div>
      )}
    </div>
  );
}
