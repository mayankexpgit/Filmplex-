'use client';

import { useMovieStore } from '@/store/movieStore';
import MovieCard from './movie-card';
import { Flame } from 'lucide-react';

export default function LatestReleasesGrid() {
  const latestReleases = useMovieStore((state) => state.latestReleases);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
        <Flame className="w-6 h-6" />
        Latest Releases
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {latestReleases.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
