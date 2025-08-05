
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore } from '@/store/movieStore';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export default function UpdateFeatured() {
  const { toast } = useToast();
  const { featuredMovies, isLoading, isInitialized, updateMovie, fetchInitialData } = useMovieStore();
  const [isPending, startTransition] = useTransition();
  
  const [posters, setPosters] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initial fetch of all data if not already initialized
    if (!isInitialized) {
      fetchInitialData();
    }
  }, [isInitialized, fetchInitialData]);

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
    startTransition(async () => {
      let updatedCount = 0;
      const updatePromises: Promise<void>[] = [];
      
      Object.entries(posters).forEach(([id, posterUrl]) => {
        const originalMovie = featuredMovies.find(m => m.id === id);
        if (originalMovie && originalMovie.posterUrl !== posterUrl) {
          updatePromises.push(updateMovie(id, { posterUrl }));
          updatedCount++;
        }
      });

      if (updatedCount === 0) {
        toast({
          title: 'No Changes',
          description: 'No poster URLs were changed.',
        });
        return;
      }

      try {
        await Promise.all(updatePromises);
        toast({
          title: 'Success!',
          description: `Updated ${updatedCount} featured movie poster(s).`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not update posters. Please try again.',
        });
      }
    });
  };

  if (isLoading || !isInitialized) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Update Featured Movie Posters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
           <Skeleton className="h-10 w-28" />
        </CardContent>
      </Card>
    )
  }

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
                disabled={isPending}
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSaveChanges} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
