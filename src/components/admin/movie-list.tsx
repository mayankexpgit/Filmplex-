'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, deleteMovie, updateMovie } from '@/store/movieStore';
import type { Movie } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Loader2, Star } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';

const topLevelRoles = ['Regulator', 'Co-Founder'];

function MovieRow({ movie, onEdit, onDeleteTrigger, onToggleFeatured, isPending, canDelete, isTopLevelAdmin, featuredMovies }: { movie: Movie, onEdit: (movie: Movie) => void, onDeleteTrigger: (movie: Movie) => void, onToggleFeatured: (movie: Movie) => void, isPending: boolean, canDelete: boolean, isTopLevelAdmin: boolean, featuredMovies: Movie[] }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{movie.title}</TableCell>
      <TableCell>{movie.year}</TableCell>
      <TableCell className="text-right space-x-2">
        {isTopLevelAdmin && (
          <Button variant="ghost" size="icon" onClick={() => onToggleFeatured(movie)} disabled={isPending}>
            {movie.isFeatured ? <Star className="h-4 w-4 text-primary fill-current" /> : <Star className="h-4 w-4 text-muted-foreground" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => onEdit(movie)}>
            <Edit className="h-4 w-4" />
        </Button>
        {canDelete && (
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => onDeleteTrigger(movie)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
        )}
      </TableCell>
    </TableRow>
  )
}

export default function MovieList() {
  const { toast } = useToast();
  const { allMovies, featuredMovies } = useMovieStore(state => ({
    allMovies: state.allMovies,
    featuredMovies: state.featuredMovies
  }));
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { adminProfile } = useAuth();

  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isTopLevelAdmin = adminProfile && topLevelRoles.includes(adminProfile.info);

  const handleDelete = () => {
    if (!movieToDelete || !isTopLevelAdmin) return;
    
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
    // Simplified rule: Any admin can edit.
    router.push(`/admin/upload-movie?id=${movie.id}`);
  };

  const handleToggleFeatured = (movie: Movie) => {
    if (!movie.isFeatured && featuredMovies.length >= 20) {
      toast({
        variant: 'destructive',
        title: 'Maximum Limit Reached',
        description: 'You cannot have more than 20 featured movies.',
      });
      return;
    }
     if (movie.isFeatured && featuredMovies.length <= 10) {
      toast({
        variant: 'destructive',
        title: 'Minimum Limit Reached',
        description: 'You must have at least 10 featured movies.',
      });
      return;
    }

    startTransition(async () => {
      try {
        await updateMovie(movie.id, { isFeatured: !movie.isFeatured });
        toast({
          title: 'Success!',
          description: `"${movie.title}" has been ${movie.isFeatured ? 'removed from' : 'added to'} featured.`,
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

  const sortedMovies = useMemo(() => {
    return [...allMovies].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
  }, [allMovies]);

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return sortedMovies;
    return sortedMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedMovies, searchQuery]);


  return (
    <AlertDialog>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Movie List ({filteredMovies.length})</span>
            <Badge variant="secondary">{allMovies.length} total movies</Badge>
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
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovies.length > 0 ? (
                  filteredMovies.map((movie) => (
                    <MovieRow 
                      key={movie.id}
                      movie={movie}
                      onEdit={handleEdit}
                      onDeleteTrigger={setMovieToDelete}
                      onToggleFeatured={handleToggleFeatured}
                      isPending={isPending}
                      canDelete={isTopLevelAdmin || false}
                      isTopLevelAdmin={isTopLevelAdmin || false}
                      featuredMovies={featuredMovies}
                    />
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            No movies found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
