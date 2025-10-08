
'use client';

import type { FC } from 'react';
import type { Movie } from '@/lib/data';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import MovieCard from './movie-card';
import Autoplay from "embla-carousel-autoplay"
import React from 'react';

interface MovieCardSmallProps {
  movies: Movie[];
}

const MovieCardSmall: FC<MovieCardSmallProps> = ({ movies }) => {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
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
        <CarouselContent className="-ml-1">
          {movies.map((movie) => (
            <CarouselItem key={movie.id} className="pl-1 basis-1/5">
              <MovieCard movie={movie} variant="small"/>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default MovieCardSmall;
