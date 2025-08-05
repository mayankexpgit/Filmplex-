'use client';

import React, { useEffect } from 'react';
import { useMovieStore } from '@/store/movieStore';
import MovieCardSmall from '@/components/movie-card-small';
import MovieCardLarge from '@/components/movie-card-large';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Menu, Search } from 'lucide-react';

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

export function HomePageClient() {
  const fetchHomepageData = useMovieStore((state) => state.fetchHomepageData);
  const isLoadingFeatured = useMovieStore((state) => state.isLoadingFeatured);
  const isLoadingLatest = useMovieStore((state) => state.isLoadingLatest);

  useEffect(() => {
    fetchHomepageData();
  }, [fetchHomepageData]);

  return (
    <div className="container mx-auto py-8 md:py-12 space-y-12">
      <section>
        {isLoadingFeatured ? <CarouselSkeleton /> : <MovieCardSmall />}
      </section>
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              className="pl-10 w-full"
            />
          </div>
          <Button variant="outline" size="icon" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
        {isLoadingLatest ? <GridSkeleton /> : <MovieCardLarge />}
      </section>
    </div>
  );
}
