
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addMovie, updateMovie, deleteMovie } from '@/store/movieStore';
import type { Movie } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Edit, Loader2, PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from '../ui/badge';

type DownloadLink = {
  quality: string;
  url: string;
};

const qualityOptions = ['4K/HD', 'HD', '720p', '480p'];

export default function UploadMovie() {
  const { toast } = useToast();
  const movies = useMovieStore((state) => state.latestReleases);
  const [isPending, startTransition] = useTransition();

  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [posterUrl, setPosterUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [tags, setTags] = useState('');
  const [genre, setGenre] = useState('');
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([{ quality: 'HD', url: '' }]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (editingMovie) {
      setId(editingMovie.id);
      setTitle(editingMovie.title);
      setYear(editingMovie.year);
      setPosterUrl(editingMovie.posterUrl);
      setTrailerUrl(editingMovie.trailerUrl || '');
      setTags(editingMovie.tags ? editingMovie.tags.join(', ') : '');
      setGenre(editingMovie.genre);
      setDownloadLinks(editingMovie.downloadLinks && editingMovie.downloadLinks.length > 0 ? editingMovie.downloadLinks : [{ quality: 'HD', url: '' }]);
    } else {
      resetForm();
    }
  }, [editingMovie]);

  const resetForm = () => {
    setId(null);
    setTitle('');
    setYear(new Date().getFullYear());
    setPosterUrl('');
    setTrailerUrl('');
    setTags('');
    setGenre('');
    setDownloadLinks([{ quality: 'HD', url: '' }]);
    setEditingMovie(null);
  };

  const handleLinkChange = (index: number, field: keyof DownloadLink, value: string) => {
    const newLinks = [...downloadLinks];
    newLinks[index][field] = value;
    setDownloadLinks(newLinks);
  };

  const addLink = () => {
    setDownloadLinks([...downloadLinks, { quality: 'HD', url: '' }]);
  };

  const removeLink = (index: number) => {
    const newLinks = downloadLinks.filter((_, i) => i !== index);
    setDownloadLinks(newLinks);
  };

  const handleSubmit = () => {
    if (!title || !genre) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all required fields (Title, Genre).',
      });
      return;
    }

    startTransition(async () => {
      const movieData: Partial<Movie> = {
        title,
        year,
        posterUrl,
        trailerUrl,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        genre,
        downloadLinks: downloadLinks.filter(link => link.url.trim() !== ''),
      };

      try {
        if (id) {
          await updateMovie(id, movieData);
          toast({
            title: 'Success!',
            description: `Movie "${title}" has been updated.`,
          });
        } else {
          await addMovie(movieData as Omit<Movie, 'id'>);
          toast({
            title: 'Success!',
            description: `Movie "${title}" has been added.`,
          });
        }
        resetForm();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not save the movie. Please try again.',
        });
      }
    });
  };
  
  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
  };

  const handleDelete = () => {
    if (!movieToDelete) return;
    
    startTransition(async () => {
      try {
        await deleteMovie(movieToDelete.id);
        toast({
          title: 'Success!',
          description: `Movie "${movieToDelete.title}" has been deleted.`,
        });
        if (editingMovie && editingMovie.id === movieToDelete.id) {
          resetForm();
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not delete the movie. Please try again.',
        });
      } finally {
        setMovieToDelete(null);
      }
    });
  }

  const filteredMovies = useMemo(() => {
    if (!searchQuery) {
      return movies;
    }
    return movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [movies, searchQuery]);

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
            <Label htmlFor="movie-genre">Genre</Label>
            <Input id="movie-genre" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Action, Sci-Fi" disabled={isPending} />
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
            <Label htmlFor="movie-trailer">Trailer URL (YouTube Embed)</Label>
            <Input id="movie-trailer" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="movie-tags">Tags (comma-separated)</Label>
            <Input id="movie-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Action, New Release" disabled={isPending} />
          </div>

          <div className="space-y-4 pt-2">
            <Label>Download Links</Label>
            {downloadLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select
                  value={link.quality}
                  onValueChange={(value) => handleLinkChange(index, 'quality', value)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityOptions.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  className="flex-1"
                  placeholder="https://example.com/download"
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  disabled={isPending}
                />
                <Button variant="ghost" size="icon" onClick={() => removeLink(index)} disabled={isPending || downloadLinks.length === 1}>
                  <XCircle className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addLink} disabled={isPending}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add more link
            </Button>
          </div>
          
          <div className="flex gap-2 pt-4">
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
      
      <AlertDialog>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Movie List</span>
              <Badge variant="secondary">{movies.length} movies</Badge>
            </CardTitle>
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
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setMovieToDelete(movie)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the movie
              <span className="font-bold"> {movieToDelete?.title}</span> from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMovieToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
