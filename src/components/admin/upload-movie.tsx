
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addMovie, updateMovie } from '@/store/movieStore';
import type { Movie } from '@/lib/data';
import { Loader2, PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DownloadLink = {
  quality: string;
  url: string;
};

const qualityOptions = ['4K/HD', 'HD', '720p', '480p'];

export default function UploadMovie() {
  const { toast } = useToast();
  const movies = useMovieStore((state) => state.latestReleases);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [posterUrl, setPosterUrl] = useState('');
  const [tags, setTags] = useState('');
  const [genre, setGenre] = useState('');
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([{ quality: 'HD', url: '' }]);

  useEffect(() => {
    const movieId = searchParams.get('id');
    if (movieId && movies.length > 0) {
      const movieToEdit = movies.find(m => m.id === movieId);
      if (movieToEdit) {
        setId(movieToEdit.id);
        setTitle(movieToEdit.title);
        setYear(movieToEdit.year);
        setPosterUrl(movieToEdit.posterUrl);
        setTags(movieToEdit.tags ? movieToEdit.tags.join(', ') : '');
        setGenre(movieToEdit.genre);
        setDownloadLinks(movieToEdit.downloadLinks && movieToEdit.downloadLinks.length > 0 ? movieToEdit.downloadLinks : [{ quality: 'HD', url: '' }]);
      }
    } else {
      resetForm();
    }
  }, [searchParams, movies]);

  const resetForm = () => {
    setId(null);
    setTitle('');
    setYear(new Date().getFullYear());
    setPosterUrl('');
    setTags('');
    setGenre('');
    setDownloadLinks([{ quality: 'HD', url: '' }]);
    router.replace('/admin/upload-movie');
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

  return (
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
  );
}
