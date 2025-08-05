'use client';

import { useMovieStore } from '@/store/movieStore';
import MovieCard from './movie-card';
import { Clock } from 'lucide-react';

export default function LatestReleasesGrid() {
  const latestReleases = useMovieStore((state) => state.latestReleases);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Clock className="w-7 h-7 text-accent" />
        Latest Releases
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {latestReleases.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
