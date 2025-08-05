
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
import { Loader2, PlusCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '../ui/textarea';

type DownloadLink = {
  quality: string;
  url: string;
};

type FormData = Partial<Movie> & {
    tagsString?: string;
};

const qualityOptions = ['4K/HD', 'HD', '720p', '480p'];
const STAGES = ['Basic Info', 'Media Links', 'Content'];

export default function UploadMovie() {
  const { toast } = useToast();
  const movies = useMovieStore((state) => state.latestReleases);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [currentStage, setCurrentStage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // State for all form fields
  const [formData, setFormData] = useState<FormData>({
    id: undefined,
    title: '',
    year: new Date().getFullYear(),
    posterUrl: '',
    tagsString: '',
    genre: '',
    language: '',
    streamingChannel: '',
    isFeatured: false,
    downloadLinks: [{ quality: 'HD', url: '' }],
    synopsis: '',
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
    setCurrentStage(0);
    setFormData({
        id: undefined,
        title: '',
        year: new Date().getFullYear(),
        posterUrl: '',
        tagsString: '',
        genre: '',
        language: '',
        streamingChannel: '',
        isFeatured: false,
        downloadLinks: [{ quality: 'HD', url: '' }],
        synopsis: '',
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
  
  const handleNext = () => {
    if (currentStage < STAGES.length - 1) {
      setCurrentStage(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.genre) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all required fields in every stage (Title, Genre are mandatory).',
      });
      return;
    }

    startTransition(async () => {
      setIsUploading(true);
      setUploadProgress(10);
      
      const movieData: Partial<Movie> = {
        ...formData,
        tags: formData.tagsString ? formData.tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        downloadLinks: (formData.downloadLinks || []).filter(link => link.url.trim() !== ''),
      };
      // Remove temporary fields that are not part of the Movie interface
      delete (movieData as any).tagsString;
      
      // Simulate upload progress
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(50);
      
      try {
        if (formData.id) {
          await updateMovie(formData.id, movieData);
          toast({
            title: 'Success!',
            description: `Movie "${formData.title}" has been updated.`,
          });
        } else {
          // Explicitly remove id for new movies to prevent Firestore errors
          const { id, ...newMovieData } = movieData;
          await addMovie(newMovieData as Omit<Movie, 'id'>);
          toast({
            title: 'Success!',
            description: `Movie "${formData.title}" has been added.`,
          });
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(100);
        
        await new Promise(resolve => setTimeout(resolve, 500));
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
         setUploadProgress(0);
      }
    });
  };

  const isStageComplete = () => {
      if (isUploading) return false;
      switch(currentStage) {
          case 0: return !!(formData.title && formData.genre);
          case 1: return !!(formData.posterUrl && (formData.downloadLinks || []).some(l => l.url));
          case 2: return !!formData.synopsis;
          default: return false;
      }
  }

  const renderStage = () => {
    switch (currentStage) {
      case 0: // Basic Info
        return (
          <div className="space-y-4">
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
                    <Label htmlFor="movie-channel">Streaming Channel</Label>
                    <Input id="movie-channel" value={formData.streamingChannel || ''} onChange={(e) => handleInputChange('streamingChannel', e.target.value)} placeholder="e.g. Netflix, Prime Video" disabled={isPending} />
                </div>
            </div>
          </div>
        );
      case 1: // Media Links
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="movie-poster">Poster URL</Label>
              <Input id="movie-poster" value={formData.posterUrl || ''} onChange={(e) => handleInputChange('posterUrl', e.target.value)} placeholder="https://image.tmdb.org/..." disabled={isPending} />
            </div>
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
                    <Button variant="ghost" size="icon" onClick={() => removeLink(index)} disabled={isPending || (formData.downloadLinks || []).length === 1}>
                      <XCircle className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addLink} disabled={isPending}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add more link
                </Button>
              </div>
          </div>
        );
      case 2: // Content
        return (
            <div className="space-y-2">
                <Label htmlFor="movie-synopsis">Synopsis / Storyline</Label>
                <Textarea 
                    id="movie-synopsis" 
                    value={formData.synopsis || ''} 
                    onChange={(e) => handleInputChange('synopsis', e.target.value)} 
                    disabled={isPending} 
                    rows={10}
                    placeholder="Provide a detailed story of the movie..."
                />
            </div>
        )
      default:
        return null;
    }
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle>{formData.id ? 'Edit Movie' : 'Upload Movie'}</CardTitle>
          <CardDescription>Follow the steps to add or edit a movie.</CardDescription>
           <div className="flex items-center gap-4 pt-2">
              <Progress value={(currentStage + 1) / STAGES.length * 100} className="w-full" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">{currentStage + 1} / {STAGES.length}</span>
           </div>
        </CardHeader>
        <CardContent className="min-h-[350px]">
            <h3 className="font-semibold text-lg mb-4">{STAGES[currentStage]}</h3>
            {isUploading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <p>Uploading movie data...</p>
                    <Progress value={uploadProgress} className="w-2/3" />
                    <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
                </div>
            ) : renderStage()}
        </CardContent>
        <CardFooter className="justify-between">
            <div>
                {currentStage > 0 && !isUploading && (
                  <Button variant="outline" onClick={handleBack} disabled={isPending}>
                    <ArrowLeft className="mr-2" /> Back
                  </Button>
                )}
                 {formData.id && <Button variant="secondary" onClick={resetForm} disabled={isPending} className="ml-2">Cancel Edit</Button>}
            </div>
             
             <div>
                {currentStage < STAGES.length - 1 && !isUploading && (
                  <Button onClick={handleNext} disabled={!isStageComplete()}>
                    Next <ArrowRight className="ml-2" />
                  </Button>
                )}
                {currentStage === STAGES.length - 1 && !isUploading && (
                  <Button onClick={handleSubmit} disabled={isPending || !isStageComplete()}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : formData.id ? 'Update Movie' : 'Confirm & Upload'}
                  </Button>
                )}
            </div>
        </CardFooter>
      </Card>
  );
}
