
'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { useMovieStore, fetchInitialData } from '@/store/movieStore';
import MovieCardLarge from '@/components/movie-card-large';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Menu, Search, Film, Loader2 } from 'lucide-react';
import StreamingLogos from './streaming-logos';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MovieCardSmall from './movie-card-small';
import { Badge } from './ui/badge';
import FilmpilexLoader from '@/components/ui/filmplex-loader';
import { useRouter, useSearchParams } from 'next/navigation';


function HomePageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
        <FilmpilexLoader />
    </div>
  );
}

const genres = [
  'All Genres',
  'Bollywood',
  'Hollywood',
  'Anime',
  'Dubbed',
  'Action',
  'Adventure',
  'Animation',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
];


export function HomePageClient() {
  const { 
    isInitialized,
    searchQuery,
    setSearchQuery,
    setSelectedGenre,
    featuredMovies,
    latestReleases,
  } = useMovieStore(state => ({
    isInitialized: state.isInitialized,
    searchQuery: state.searchQuery,
    setSearchQuery: state.setSearchQuery,
    setSelectedGenre: state.setSelectedGenre,
    featuredMovies: state.featuredMovies,
    latestReleases: state.latestReleases,
  }));
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localSearch, setLocalSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  // Effect to sync URL search param with Zustand store and local state
  useEffect(() => {
    const sQuery = searchParams.get('s');
    const newSearchQuery = sQuery || '';
    setLocalSearch(newSearchQuery);
    if (newSearchQuery !== searchQuery) {
        setSearchQuery(newSearchQuery);
    }
  }, [searchParams, setSearchQuery, searchQuery]);
  
  useEffect(() => {
    // Fetch data only if it hasn't been initialized yet.
    if (!isInitialized) {
      fetchInitialData(false); // false for public user
    }
  }, [isInitialized]);

  const handleSearch = useCallback(() => {
    startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (localSearch) {
            params.set('s', localSearch);
        } else {
            params.delete('s');
        }
        router.push(`/?${params.toString()}`);
    });
  }, [localSearch, router, searchParams]);

  // Render the loader if the store is not yet initialized.
  if (!isInitialized) {
     return <HomePageLoader />;
  }

  // Render the main content once data is available.
  return (
    <div className="container mx-auto py-8 md:py-12 space-y-8">
      
      <div className="py-4">
        <MovieCardSmall movies={featuredMovies} />
      </div>

      <div className="bg-secondary p-3 rounded-lg border border-border text-center text-xs md:text-base font-bold text-foreground">
        💥 100% Free Downloads – No Subscriptions, No Charges! 📽️🎉
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-2 bg-secondary rounded-lg border border-input p-1.5">
          <div className="relative flex-grow flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none">
                  {isPending ? <Loader2 className="h-5 w-5 animate-spin"/> : <Search className="h-5 w-5 text-muted-foreground" />}
              </div>
              <Input
                  placeholder="Search for movies or series..."
                  className="pl-10 w-full bg-transparent border-0 h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
          </div>
          <Button onClick={handleSearch} className="h-11 px-4">
              Search
          </Button>
          <Badge variant="default" className="h-11 flex items-center gap-1 rounded-md bg-primary text-primary-foreground pointer-events-none px-3">
              <Film className="h-4 w-4"/>
              <span className="font-bold text-base">4K/HD</span>
          </Badge>
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-11 w-11 p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border-0 rounded-md bg-secondary hover:bg-accent">
                      <Menu className="h-5 w-5" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  {genres.map((genre) => (
                  <DropdownMenuItem key={genre} onSelect={() => setSelectedGenre(genre)}>
                      {genre}
                  </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <StreamingLogos />

        <MovieCardLarge movies={latestReleases} />
      </section>
    </div>
  );
}
