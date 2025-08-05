
'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, deleteMovie } from '@/store/movieStore';
import type { Movie } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Edit, Loader2 } from 'lucide-react';
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

export default function MovieList() {
  const { toast } = useToast();
  const movies = useMovieStore((state) => state.latestReleases);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = () => {
    if (!movieToDelete) return;
    
    startTransition(async () => {
      try {
        await deleteMovie(movieToDelete.id);
        toast({
          title: 'Success!',
          description: `Movie "${movieToDelete.title}" has been deleted.`,
        });
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

  const handleEdit = (movie: Movie) => {
    router.push(`/admin/upload-movie?id=${movie.id}`);
  };

  const filteredMovies = useMemo(() => {
    if (!searchQuery) {
      return movies;
    }
    return movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [movies, searchQuery]);

  return (
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
  );
}
