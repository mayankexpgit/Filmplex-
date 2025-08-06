
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
import { Loader2, PlusCircle, XCircle, Bold, Italic, Underline, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import MovieDetailPreview from './movie-detail-preview';
import { ScrollArea } from '../ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '../ui/separator';
import { generateMovieDescription } from '@/ai/flows/generate-movie-description-flow';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
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
    synopsis: '',
    screenshots: ['', '', ''],
    stars: '',
    creator: '',
    episodes: undefined,
    quality: '',
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
            screenshots: movieToEdit.screenshots && movieToEdit.screenshots.length > 0 ? movieToEdit.screenshots : ['', '', ''],
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
      synopsis: '',
      screenshots: ['', '', ''],
      stars: '',
      creator: '',
      episodes: undefined,
      quality: '',
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
  
  const handleScreenshotChange = (index: number, value: string) => {
    const newScreenshots = [...(formData.screenshots || [])];
    newScreenshots[index] = value;
    handleInputChange('screenshots', newScreenshots);
  }

  const addLink = () => {
    const newLinks = [...(formData.downloadLinks || []), { quality: 'HD', url: '' }];
    handleInputChange('downloadLinks', newLinks);
  };
  
  const addScreenshot = () => {
    const newScreenshots = [...(formData.screenshots || []), ''];
    handleInputChange('screenshots', newScreenshots);
  }

  const removeLink = (index: number) => {
    const newLinks = (formData.downloadLinks || []).filter((_, i) => i !== index);
    handleInputChange('downloadLinks', newLinks);
  };
  
  const removeScreenshot = (index: number) => {
    const newScreenshots = (formData.screenshots || []).filter((_,i) => i !== index);
    handleInputChange('screenshots', newScreenshots);
  }

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.synopsis) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide a title and a basic synopsis before generating.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const generatedHtml = await generateMovieDescription({
        title: formData.title,
        year: formData.year || new Date().getFullYear(),
        synopsis: formData.synopsis,
      });
      handleInputChange('synopsis', generatedHtml);
      toast({
        title: 'Success!',
        description: 'AI-generated description has been populated.',
      });
    } catch (error) {
      console.error('AI generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate the description. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
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
      const movieData: Partial<Movie> = {
        ...formData,
        tags: formData.tagsString ? formData.tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        downloadLinks: (formData.downloadLinks || []).filter(link => link.url.trim() !== ''),
        screenshots: (formData.screenshots || []).filter(ss => ss.trim() !== ''),
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
                <Input id="movie-title" value={formData.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} disabled={isPending || isGenerating} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="movie-genre">Genre</Label>
                      <Input id="movie-genre" value={formData.genre || ''} onChange={(e) => handleInputChange('genre', e.target.value)} placeholder="e.g. Action, Sci-Fi" disabled={isPending || isGenerating} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="movie-year">Year</Label>
                      <Input id="movie-year" type="number" value={formData.year || ''} onChange={(e) => handleInputChange('year', Number(e.target.value))} disabled={isPending || isGenerating} />
                  </div>
              </div>
               {/* New Fields */}
               <div className="space-y-2">
                  <Label htmlFor="movie-stars">Stars (comma-separated)</Label>
                  <Input id="movie-stars" value={formData.stars || ''} onChange={(e) => handleInputChange('stars', e.target.value)} placeholder="e.g. Actor One, Actor Two" disabled={isPending || isGenerating} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="movie-creator">Creator</Label>
                  <Input id="movie-creator" value={formData.creator || ''} onChange={(e) => handleInputChange('creator', e.target.value)} placeholder="e.g. Director Name" disabled={isPending || isGenerating} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="movie-episodes">No. of Episodes</Label>
                      <Input id="movie-episodes" type="number" value={formData.episodes || ''} onChange={(e) => handleInputChange('episodes', e.target.value ? Number(e.target.value) : undefined)} placeholder="For TV shows" disabled={isPending || isGenerating} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="movie-quality">Quality Description</Label>
                      <Input id="movie-quality" value={formData.quality || ''} onChange={(e) => handleInputChange('quality', e.target.value)} placeholder="e.g. BluRay 4K | 1080p" disabled={isPending || isGenerating} />
                  </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="movie-tags">Tags (comma-separated)</Label>
                  <Input id="movie-tags" value={formData.tagsString || ''} onChange={(e) => handleInputChange('tagsString', e.target.value)} placeholder="Action, New Release" disabled={isPending || isGenerating} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="movie-language">Language</Label>
                      <Input id="movie-language" value={formData.language || ''} onChange={(e) => handleInputChange('language', e.target.value)} placeholder="e.g. English, Hindi" disabled={isPending || isGenerating} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="movie-imdb">IMDb Rating</Label>
                      <Input id="movie-imdb" type="number" step="0.1" value={formData.imdbRating || ''} onChange={(e) => handleInputChange('imdbRating', parseFloat(e.target.value))} disabled={isPending || isGenerating} />
                  </div>
              </div>
              {/* Media Links */}
              <div className="space-y-2">
                <Label htmlFor="movie-poster">Poster URL</Label>
                <Input id="movie-poster" value={formData.posterUrl || ''} onChange={(e) => handleInputChange('posterUrl', e.target.value)} placeholder="https://image.tmdb.org/..." disabled={isPending || isGenerating} />
              </div>

              <Separator />

              {/* Screenshots */}
              <div className="space-y-4 pt-2">
                <Label>Screenshots</Label>
                {(formData.screenshots || []).map((ss, index) => (
                  <div key={index} className="flex items-center gap-2">
                     <Input
                        className="flex-1"
                        placeholder={`https://.../screenshot${index+1}.png`}
                        value={ss}
                        onChange={(e) => handleScreenshotChange(index, e.target.value)}
                        disabled={isPending || isGenerating}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeScreenshot(index)} disabled={isPending || isGenerating}>
                        <XCircle className="h-5 w-5 text-destructive" />
                      </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addScreenshot} disabled={isPending || isGenerating}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Screenshot
                </Button>
              </div>

              <Separator />

              {/* Download Links */}
              <div className="space-y-4 pt-2">
                  <Label>Download Links</Label>
                  {(formData.downloadLinks || []).map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={link.quality}
                        onValueChange={(value) => handleLinkChange(index, 'quality', value)}
                        disabled={isPending || isGenerating}
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
                        disabled={isPending || isGenerating}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeLink(index)} disabled={isPending || isGenerating}>
                        <XCircle className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addLink} disabled={isPending || isGenerating}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add more link
                  </Button>
              </div>
              {/* Synopsis */}
               <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="movie-synopsis">Synopsis / Storyline</Label>
                    <Button onClick={handleGenerateDescription} variant="outline" size="sm" disabled={isPending || isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-primary" />}
                        Generate with AI
                    </Button>
                </div>
                <div className="p-2 border rounded-md">
                   <Textarea 
                      id="movie-synopsis" 
                      value={formData.synopsis || ''} 
                      onChange={(e) => handleInputChange('synopsis', e.target.value)} 
                      disabled={isPending || isGenerating} 
                      rows={10}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                      placeholder="Provide a brief plot summary here, then click 'Generate with AI' to create a full description."
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="justify-between border-t pt-4">
             <div>
                {formData.id && <Button variant="secondary" onClick={resetForm} disabled={isPending || isGenerating}>Cancel Edit</Button>}
             </div>
             <Button onClick={handleSubmit} disabled={isPending || isGenerating}>
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
