'use client';

import type { FC } from 'react';
import { useMovieStore } from '@/store/movieStore';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import MovieCard from './movie-card';
import Autoplay from "embla-carousel-autoplay"
import React from 'react';

const MovieCardSmall: FC = () => {
  const featuredMovies = useMovieStore((state) => state.featuredMovies);

  const plugin = React.useRef(
    Autoplay({ delay: 1000, stopOnInteraction: true })
  )

  return (
    <div className="space-y-4">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="-ml-2">
          {featuredMovies.map((movie) => (
            <CarouselItem key={movie.id} className="pl-2 basis-1/5">
              <MovieCard movie={movie} variant="small"/>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default MovieCardSmall;
