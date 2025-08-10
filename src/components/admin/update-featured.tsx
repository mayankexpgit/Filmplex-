
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, updateMovie as storeUpdateMovie } from '@/store/movieStore';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import type { Movie } from '@/lib/data';

type EditableMovie = Pick<Movie, 'id' | 'title' | 'posterUrl'>;

export default function UpdateFeatured() {
  const { toast } = useToast();
  const { featuredMovies } = useMovieStore();
  const [isPending, startTransition] = useTransition();
  
  // Initialize local state directly from the store state
  const [editableMovies, setEditableMovies] = useState<EditableMovie[]>(
    featuredMovies.map(({ id, title, posterUrl }) => ({ id, title, posterUrl }))
  );

  // Sync with store state when it changes
  useEffect(() => {
    setEditableMovies(featuredMovies.map(({ id, title, posterUrl }) => ({ id, title, posterUrl })));
  }, [featuredMovies]);

  const handleInputChange = (id: string, field: 'title' | 'posterUrl', value: string) => {
    setEditableMovies(prev => 
      prev.map(movie => 
        movie.id === id ? { ...movie, [field]: value } : movie
      )
    );
  };

  const handleSaveChanges = () => {
    startTransition(async () => {
      let updatedCount = 0;
      const updatePromises: Promise<void>[] = [];
      
      editableMovies.forEach((editedMovie) => {
        const originalMovie = featuredMovies.find(m => m.id === editedMovie.id);
        if (originalMovie && (originalMovie.title !== editedMovie.title || originalMovie.posterUrl !== editedMovie.posterUrl)) {
          updatePromises.push(storeUpdateMovie(editedMovie.id, { title: editedMovie.title, posterUrl: editedMovie.posterUrl }));
          updatedCount++;
        }
      });

      if (updatedCount === 0) {
        toast({
          title: 'No Changes',
          description: 'No movie titles or poster URLs were changed.',
        });
        return;
      }

      try {
        await Promise.all(updatePromises);
        toast({
          title: 'Success!',
          description: `Updated ${updatedCount} featured movie(s).`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not update movies. Please try again.',
        });
      }
    });
  };

  const handleRemoveFromFeatured = (id: string) => {
     if (featuredMovies.length <= 10) {
      toast({
        variant: 'destructive',
        title: 'Minimum Limit Reached',
        description: 'You must have at least 10 featured movies.',
      });
      return;
    }
    startTransition(async () => {
      try {
        await storeUpdateMovie(id, { isFeatured: false });
        toast({
          title: 'Success!',
          description: 'Movie has been removed from the featured list.',
        });
      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not update the movie. Please try again.',
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Featured Movies</CardTitle>
        <CardDescription>
          Edit titles and poster URLs for movies in the homepage carousel.
          To add or remove movies from this list, go to the "Movie List" page and toggle the star icon.
          You must maintain between 10 and 20 featured movies. 
          Currently: {featuredMovies.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {editableMovies.map((movie) => (
          <div key={movie.id} className="p-4 border rounded-lg space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`title-${movie.id}`}>Movie Title</Label>
              <Input
                id={`title-${movie.id}`}
                value={movie.title || ''}
                onChange={(e) => handleInputChange(movie.id, 'title', e.target.value)}
                disabled={isPending}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor={`poster-${movie.id}`}>Poster URL</Label>
              <Input
                id={`poster-${movie.id}`}
                value={movie.posterUrl || ''}
                onChange={(e) => handleInputChange(movie.id, 'posterUrl', e.target.value)}
                placeholder="https://placehold.co/400x600.png"
                disabled={isPending}
              />
            </div>
             <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleRemoveFromFeatured(movie.id)}
                disabled={isPending || featuredMovies.length <= 10}
              >
              <Trash2 className="mr-2 h-4 w-4"/>
              Remove from Featured
            </Button>
          </div>
        ))}
         {featuredMovies.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>No featured movies to display.</p>
            <p className="text-sm">Go to the "Movie List" to feature a movie.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleSaveChanges} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Saving...' : 'Save All Changes'}
        </Button>
        {featuredMovies.length < 20 && (
            <Button asChild variant="outline">
                <Link href="/admin/movie-list">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add from Movie List
                </Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
