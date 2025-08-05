'use client';

import { useMovieStore } from '@/store/movieStore';
import MovieCard from './movie-card';

export default function MovieCardLarge() {
  const latestReleases = useMovieStore((state) => state.latestReleases);

  return (
    <div>
      <div className="bg-secondary rounded-lg border border-border p-4 mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Latest Releases
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-4">
        {latestReleases.map((movie) => (
          <MovieCard key={movie.id} movie={movie} variant="large" />
        ))}
      </div>
    </div>
  );
}
