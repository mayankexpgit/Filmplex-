'use client';

import React, { useEffect } from 'react';
import { useMovieStore } from '@/store/movieStore';
import FeaturedCarousel from '@/components/featured-carousel';
import LatestReleasesGrid from '@/components/latest-releases-grid';
import { Skeleton } from './ui/skeleton';

function CarouselSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-64" />
      <div className="relative w-full">
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-full pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
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
          <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
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
    <div className="container mx-auto py-8 md:py-12 space-y-16">
      <section>
        {isLoadingFeatured ? <CarouselSkeleton /> : <FeaturedCarousel />}
      </section>
      <section>
        {isLoadingLatest ? <GridSkeleton /> : <LatestReleasesGrid />}
      </section>
    </div>
  );
}
