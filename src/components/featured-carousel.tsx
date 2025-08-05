'use client';

import type { FC } from 'react';
import { Flame } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import MovieCard from './movie-card';

const FeaturedCarousel: FC = () => {
  const featuredMovies = useMovieStore((state) => state.featuredMovies);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Flame className="w-7 h-7 text-accent" />
          Featured Today
        </h2>
      </div>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {featuredMovies.map((movie) => (
            <CarouselItem key={movie.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <MovieCard movie={movie} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-14 text-primary border-primary hover:bg-primary/90 hover:text-primary-foreground" />
        <CarouselNext className="mr-14 text-primary border-primary hover:bg-primary/90 hover:text-primary-foreground" />
      </Carousel>
    </div>
  );
};

export default FeaturedCarousel;
