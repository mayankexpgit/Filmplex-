'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore } from '@/store/movieStore';
import type { Movie } from '@/lib/data';

export default function MovieManager() {
  const { toast } = useToast();
  const addMovie = (movie: Movie) => useMovieStore.getState().latestReleases.push(movie);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [posterUrl, setPosterUrl] = useState('');
  const [quality, setQuality] = useState('HD');
  const [tags, setTags] = useState('');

  const handleAddMovie = () => {
    if (!title || !posterUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all fields.',
      });
      return;
    }

    const newMovie: Movie = {
      id: new Date().toISOString(),
      title,
      year,
      posterUrl,
      quality,
      tags: tags.split(',').map(tag => tag.trim()),
      isFeatured: false,
      genre: 'Misc',
    };

    addMovie(newMovie);
    
    toast({
      title: 'Success!',
      description: `Movie "${title}" has been added.`,
    });

    // Reset form
    setTitle('');
    setYear(new Date().getFullYear());
    setPosterUrl('');
    setQuality('HD');
    setTags('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Movie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="movie-title">Title</Label>
          <Input id="movie-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="movie-year">Year</Label>
          <Input id="movie-year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="movie-poster">Poster URL</Label>
          <Input id="movie-poster" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="https://placehold.co/400x600.png" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="movie-quality">Quality (e.g., 4K, HD)</Label>
          <Input id="movie-quality" value={quality} onChange={(e) => setQuality(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="movie-tags">Tags (comma-separated)</Label>
          <Input id="movie-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Action, New Release" />
        </div>
        <Button onClick={handleAddMovie}>Add Movie</Button>
      </CardContent>
    </Card>
  );
}
