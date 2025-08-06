
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addMovie, updateMovie } from '@/store/movieStore';
import type { Movie } from '@/lib/data';
import { Loader2, PlusCircle, XCircle, Bold, Italic, Underline } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import MovieDetailPreview from './movie-detail-preview';
import { ScrollArea } from '../ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type DownloadLink = {
  quality: string;
  url: string;
};

type FormData = Partial<Movie> & {
    tagsString?: string;
};

const qualityOptions = ['4K/HD', 'HD', '720p', '480p'];

export default function UploadMovie() {
  const { toast } = useToast();
  const movies = useMovieStore((state) => state.latestReleases);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    id: undefined,
    title: 'Untitled Movie',
    year: new Date().getFullYear(),
    posterUrl: '',
    tagsString: '',
    genre: '',
    language: '',
    imdbRating: 0,
    streamingChannel: '',
    isFeatured: false,
    downloadLinks: [{ quality: 'HD', url: '' }],
    synopsis: 'Enter movie synopsis here...',
    screenshots: [],
  });
  
  useEffect(() => {
    const movieId = searchParams.get('id');
    if (movieId && movies.length > 0) {
      const movieToEdit = movies.find(m => m.id === movieId);
      if (movieToEdit) {
        setFormData({
            ...movieToEdit,
            tagsString: movieToEdit.tags ? movieToEdit.tags.join(', ') : '',
            downloadLinks: movieToEdit.downloadLinks && movieToEdit.downloadLinks.length > 0 ? movieToEdit.downloadLinks : [{ quality: 'HD', url: '' }],
        });
      }
    } else {
      resetForm();
    }
  }, [searchParams, movies]);

  const resetForm = () => {
    setFormData({
      id: undefined,
      title: 'Untitled Movie',
      year: new Date().getFullYear(),
      posterUrl: '',
      tagsString: '',
      genre: '',
      language: '',
      imdbRating: 0,
      streamingChannel: '',
      isFeatured: false,
      downloadLinks: [{ quality: 'HD', url: '' }],
      synopsis: 'Enter movie synopsis here...',
      screenshots: [],
    });
    router.replace('/admin/upload-movie');
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLinkChange = (index: number, field: keyof DownloadLink, value: string) => {
    const newLinks = [...(formData.downloadLinks || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handleInputChange('downloadLinks', newLinks);
  };

  const addLink = () => {
    const newLinks = [...(formData.downloadLinks || []), { quality: 'HD', url: '' }];
    handleInputChange('downloadLinks', newLinks);
  };

  const removeLink = (index: number) => {
    const newLinks = (formData.downloadLinks || []).filter((_, i) => i !== index);
    handleInputChange('downloadLinks', newLinks);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.genre) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Title and Genre are mandatory fields.',
      });
      return;
    }

    startTransition(async () => {
      setIsUploading(true);
      
      const movieData: Partial<Movie> = {
        ...formData,
        tags: formData.tagsString ? formData.tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        downloadLinks: (formData.downloadLinks || []).filter(link => link.url.trim() !== ''),
      };
      delete (movieData as any).tagsString;
      
      try {
        if (formData.id) {
          await updateMovie(formData.id, movieData);
          toast({
            title: 'Success!',
            description: `Movie "${formData.title}" has been updated.`,
          });
        } else {
          const { id, ...newMovieData } = movieData;
          await addMovie(newMovieData as Omit<Movie, 'id'>);
          toast({
            title: 'Success!',
            description: `Movie "${formData.title}" has been added.`,
          });
        }
        resetForm();

      } catch (error) {
        console.error("Database operation failed:", error);
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not save the movie. Please try again.',
        });
      } finally {
         setIsUploading(false);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Column */}
      <Card className="lg:max-h-[85vh] flex flex-col">
        <CardHeader>
          <CardTitle>{formData.id ? 'Edit Movie' : 'Upload Movie'}</CardTitle>
          <CardDescription>Fill in the details and see a live preview on the right.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-6">
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="movie-title">Title</Label>
                <Input id="movie-title" value={formData.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} disabled={isPending} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="movie-genre">Genre</Label>
                      <Input id="movie-genre" value={formData.genre || ''} onChange={(e) => handleInputChange('genre', e.target.value)} placeholder="e.g. Action, Sci-Fi" disabled={isPending} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="movie-year">Year</Label>
                      <Input id="movie-year" type="number" value={formData.year || ''} onChange={(e) => handleInputChange('year', Number(e.target.value))} disabled={isPending} />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="movie-tags">Tags (comma-separated)</Label>
                  <Input id="movie-tags" value={formData.tagsString || ''} onChange={(e) => handleInputChange('tagsString', e.target.value)} placeholder="Action, New Release" disabled={isPending} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="movie-language">Language</Label>
                      <Input id="movie-language" value={formData.language || ''} onChange={(e) => handleInputChange('language', e.target.value)} placeholder="e.g. English, Hindi" disabled={isPending} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="movie-imdb">IMDb Rating</Label>
                      <Input id="movie-imdb" type="number" step="0.1" value={formData.imdbRating || ''} onChange={(e) => handleInputChange('imdbRating', parseFloat(e.target.value))} disabled={isPending} />
                  </div>
              </div>
              {/* Media Links */}
              <div className="space-y-2">
                <Label htmlFor="movie-poster">Poster URL</Label>
                <Input id="movie-poster" value={formData.posterUrl || ''} onChange={(e) => handleInputChange('posterUrl', e.target.value)} placeholder="https://image.tmdb.org/..." disabled={isPending} />
              </div>
              {/* Download Links */}
              <div className="space-y-4 pt-2">
                  <Label>Download Links</Label>
                  {(formData.downloadLinks || []).map((link, index) => (
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
                      <Button variant="ghost" size="icon" onClick={() => removeLink(index)} disabled={isPending}>
                        <XCircle className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addLink} disabled={isPending}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add more link
                  </Button>
              </div>
              {/* Synopsis */}
              <div className="space-y-2">
                <Label htmlFor="movie-synopsis">Synopsis / Storyline</Label>
                <div className="p-2 border rounded-md">
                   <ToggleGroup type="multiple" className="flex-wrap justify-start">
                     <ToggleGroupItem value="bold" aria-label="Toggle bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
                     <ToggleGroupItem value="italic" aria-label="Toggle italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
                     <ToggleGroupItem value="underline" aria-label="Toggle underline"><Underline className="h-4 w-4" /></ToggleGroupItem>
                   </ToggleGroup>
                   <Textarea 
                      id="movie-synopsis" 
                      value={formData.synopsis || ''} 
                      onChange={(e) => handleInputChange('synopsis', e.target.value)} 
                      disabled={isPending} 
                      rows={8}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                      placeholder="Provide a detailed story of the movie..."
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="justify-between border-t pt-4">
             <div>
                {formData.id && <Button variant="secondary" onClick={resetForm} disabled={isPending}>Cancel Edit</Button>}
             </div>
             <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : formData.id ? 'Update Movie' : 'Confirm & Upload'}
            </Button>
        </CardFooter>
      </Card>

      {/* Preview Column */}
      <div className="lg:max-h-[85vh] overflow-hidden rounded-lg">
        <div className="h-full w-full bg-secondary overflow-y-auto rounded-lg border">
            <MovieDetailPreview movie={formData as Movie} />
        </div>
      </div>
    </div>
  );
}
