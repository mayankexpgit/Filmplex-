
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore } from '@/store/movieStore';
import type { Movie } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Edit, Loader2 } from 'lucide-react';

export default function UploadMovie() {
  const { toast } = useToast();
  const { movies, addMovie, updateMovie, deleteMovie } = useMovieStore((state) => ({
    movies: [...state.latestReleases, ...state.featuredMovies].filter(
      (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
    ),
    addMovie: state.addMovie,
    updateMovie: state.updateMovie,
    deleteMovie: state.deleteMovie,
  }));
  const [isPending, startTransition] = useTransition();

  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [posterUrl, setPosterUrl] = useState('');
  const [quality, setQuality] = useState('HD');
  const [tags, setTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setAllMovies(movies);
  }, [movies]);

  useEffect(() => {
    if (editingMovie) {
      setId(editingMovie.id);
      setTitle(editingMovie.title);
      setYear(editingMovie.year);
      setPosterUrl(editingMovie.posterUrl);
      setQuality(editingMovie.quality || 'HD');
      setTags(editingMovie.tags ? editingMovie.tags.join(', ') : '');
    } else {
      resetForm();
    }
  }, [editingMovie]);

  const resetForm = () => {
    setId(null);
    setTitle('');
    setYear(new Date().getFullYear());
    setPosterUrl('');
    setQuality('HD');
    setTags('');
    setEditingMovie(null);
  };

  const handleSubmit = () => {
    if (!title || !posterUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out title and poster URL fields.',
      });
      return;
    }

    startTransition(() => {
      const originalMovie = movies.find(m => m.id === id);

      const movieData: Movie = {
        id: id || new Date().toISOString(),
        title,
        year,
        posterUrl,
        quality,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        isFeatured: originalMovie?.isFeatured ?? false,
        genre: originalMovie?.genre ?? 'Misc',
      };

      if (id) {
        updateMovie(id, movieData);
        toast({
          title: 'Success!',
          description: `Movie "${title}" has been updated.`,
        });
      } else {
        addMovie(movieData);
        toast({
          title: 'Success!',
          description: `Movie "${title}" has been added.`,
        });
      }
      resetForm();
    });
  };
  
  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
  };

  const handleDelete = (movieId: string) => {
    deleteMovie(movieId);
    toast({
      title: 'Success!',
      description: 'Movie has been deleted.',
    });
    if (editingMovie && editingMovie.id === movieId) {
      resetForm();
    }
  }

  const filteredMovies = useMemo(() => {
    if (!searchQuery) {
      // Sort by year, descending
      return [...allMovies].sort((a, b) => b.year - a.year);
    }
    return [...allMovies]
      .filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.year - a.year);
  }, [allMovies, searchQuery]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Movie' : 'Upload Movie'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="movie-title">Title</Label>
            <Input id="movie-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="movie-year">Year</Label>
            <Input id="movie-year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="movie-poster">Poster URL</Label>
            <Input id="movie-poster" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="https://image.tmdb.org/..." disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="movie-quality">Quality (e.g., 4K, HD)</Label>
            <Input id="movie-quality" value={quality} onChange={(e) => setQuality(e.target.value)} disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="movie-tags">Tags (comma-separated)</Label>
            <Input id="movie-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Action, New Release" disabled={isPending} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : id ? 'Update Movie' : 'Add Movie'}
            </Button>
            {id && <Button variant="outline" onClick={resetForm} disabled={isPending}>Cancel Edit</Button>}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Movie List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="search-movie">Search Movie</Label>
            <Input 
              id="search-movie" 
              placeholder="Search by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovies.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell className="font-medium">{movie.title}</TableCell>
                    <TableCell>{movie.year}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(movie)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(movie.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
