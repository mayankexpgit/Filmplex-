'use client';

import type { FC } from 'react';
import { useMovieStore } from '@/store/movieStore';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
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
            <CarouselItem key={movie.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
              <MovieCard movie={movie} variant="featured"/>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default FeaturedCarousel;
