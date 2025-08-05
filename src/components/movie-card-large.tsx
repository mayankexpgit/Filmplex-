
'use client';

import { useMovieStore } from '@/store/movieStore';
import MovieCard from './movie-card';
import { Flame } from 'lucide-react';
import { useMemo, useState } from 'react';
import Pagination from './pagination';

const MOVIES_PER_PAGE = 12;

export default function MovieCardLarge() {
  const latestReleases = useMovieStore((state) => state.latestReleases);
  const searchQuery = useMovieStore((state) => state.searchQuery);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMovies = useMemo(() => {
    if (!searchQuery) {
      return latestReleases;
    }
    return latestReleases.filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [latestReleases, searchQuery]);

  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);

  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
    const endIndex = startIndex + MOVIES_PER_PAGE;
    return filteredMovies.slice(startIndex, endIndex);
  }, [currentPage, filteredMovies]);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
        {paginatedMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} variant="large" />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
