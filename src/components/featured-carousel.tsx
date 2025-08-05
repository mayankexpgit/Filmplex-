'use client';

import type { FC } from 'react';
import { Flame } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import MovieCard from './movie-card';
import Autoplay from "embla-carousel-autoplay"
import React from 'react';

const FeaturedCarousel: FC = () => {
  const featuredMovies = useMovieStore((state) => state.featuredMovies);
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  )

  return (
    <div className="space-y-4">
       <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
        <Flame className="w-6 h-6" />
        Featured Today
      </h2>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {featuredMovies.map((movie) => (
            <CarouselItem key={movie.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <MovieCard movie={movie} variant="featured"/>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default FeaturedCarousel;
