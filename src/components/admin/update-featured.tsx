
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore } from '@/store/movieStore';

export default function UpdateFeatured() {
  const { toast } = useToast();
  const featuredMovies = useMovieStore((state) => state.featuredMovies);
  const updateMovie = useMovieStore((state) => state.updateMovie);
  
  const [posters, setPosters] = useState<Record<string, string>>({});

  useEffect(() => {
    if (featuredMovies.length > 0) {
      const initialPosters = featuredMovies.reduce((acc, movie) => {
        acc[movie.id] = movie.posterUrl;
        return acc;
      }, {} as Record<string, string>);
      setPosters(initialPosters);
    }
  }, [featuredMovies]);

  const handlePosterChange = (id: string, value: string) => {
    setPosters(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = () => {
    Object.entries(posters).forEach(([id, posterUrl]) => {
      // Find the original movie to see if the poster URL has actually changed.
      const originalMovie = featuredMovies.find(m => m.id === id);
      if (originalMovie && originalMovie.posterUrl !== posterUrl) {
        // Use the global updateMovie function to ensure data consistency everywhere.
        updateMovie(id, { posterUrl });
      }
    });

    toast({
      title: 'Success!',
      description: 'Featured movie posters have been updated.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Featured Movie Posters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredMovies.map((movie) => (
            <div key={movie.id} className="space-y-2">
              <Label htmlFor={`poster-${movie.id}`}>{movie.title}</Label>
              <Input
                id={`poster-${movie.id}`}
                value={posters[movie.id] || ''}
                onChange={(e) => handlePosterChange(movie.id, e.target.value)}
                placeholder="https://placehold.co/400x600.png"
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
