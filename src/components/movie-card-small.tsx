'use client';

import type { FC } from 'react';
import { useMovieStore } from '@/store/movieStore';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import MovieCard from './movie-card';
import Autoplay from "embla-carousel-autoplay"
import React from 'react';

const MovieCardSmall: FC = () => {
  const featuredMovies = useMovieStore((state) => state.featuredMovies);

  return (
    <div className="space-y-4">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 2000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-1">
          {featuredMovies.map((movie) => (
            <CarouselItem key={movie.id} className="pl-1 basis-1/8">
              <MovieCard movie={movie} variant="small"/>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default MovieCardSmall;
