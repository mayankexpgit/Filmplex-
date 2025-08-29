
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useMovieStore, fetchMovieData } from '@/store/movieStore';
import MovieCardLarge from '@/components/movie-card-large';
import { Skeleton } from './ui/skeleton';
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


function CarouselSkeleton() {
  return (
    <div className="space-y-8">
      <div className="relative w-full">
        <div className="flex space-x-2 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-full basis-1/5">
              <Skeleton className="aspect-[2/3] w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full" />
        ))}
      </div>
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
  } = useMovieStore((state) => ({
    isInitialized: state.isInitialized,
    searchQuery: state.searchQuery,
    setSearchQuery: state.setSearchQuery,
    setSelectedGenre: state.setSelectedGenre,
  }));

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    if (!isInitialized) {
      fetchMovieData();
    }
  }, [isInitialized]);
  
  useEffect(() => {
    // If global search query is cleared (e.g. by selecting a filter), update local input
    if(!searchQuery) {
        setLocalSearch('');
    }
  }, [searchQuery]);

  const handleSearchClick = () => {
    startTransition(() => {
      setSearchQuery(localSearch);
    });
  };

  if (!isInitialized) {
     return (
      <div className="container mx-auto py-8 md:py-12 space-y-12">
        <CarouselSkeleton />
        <GridSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 md:py-12 space-y-8">
      
      <div className="py-4">
        <MovieCardSmall />
      </div>

      <div className="bg-secondary p-3 rounded-lg border border-border text-center text-lg font-bold text-foreground">
        💥 100% Free Downloads – No Subscriptions, No Charges! 📽️🎉
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-0 bg-secondary rounded-lg border border-border overflow-hidden">
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin"/> : <Search className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <Input
                    placeholder="Search for movies or series..."
                    className="pl-10 w-full bg-secondary border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>
                
                <Button onClick={handleSearchClick} className="rounded-l-none" disabled={isPending}>
                    Search
                </Button>

                <div className="border-l border-border h-10 flex items-center bg-secondary px-2 gap-2">
                    <Badge variant="default" className="h-8 flex items-center gap-2 rounded-md bg-primary text-primary-foreground pointer-events-none px-3">
                    <Film className="h-5 w-5"/>
                    <span className="font-bold">4K/HD</span>
                    </Badge>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border-0 rounded-md bg-secondary hover:bg-accent">
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
            </div>
        </div>
        
        <StreamingLogos />

        <MovieCardLarge />
      </section>
    </div>
  );
}
