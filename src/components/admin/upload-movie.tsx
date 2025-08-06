
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addMovie, updateMovie } from '@/store/movieStore';
import type { Movie, DownloadLink, Episode } from '@/lib/data';
import { Loader2, PlusCircle, XCircle, Sparkles, Wand2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import MovieDetailPreview from './movie-detail-preview';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { generateMovieDescription } from '@/ai/flows/generate-movie-description-flow';
import { fetchMovieMetadata } from '@/ai/flows/fetch-movie-metadata-flow';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

type FormData = Partial<Movie> & {
    tagsString?: string;
};

const qualityOptions = ['4K', '2160p', '1080p', '720p', '480p'];

const initialFormState: FormData = {
  id: undefined,
  title: '',
  year: new Date().getFullYear(),
  posterUrl: '',
  tagsString: '',
  genre: '',
  language: '',
  imdbRating: 0,
  streamingChannel: '',
  isFeatured: false,
  synopsis: '',
  screenshots: ['', '', ''],
  stars: '',
  creator: '',
  quality: '',
  contentType: 'movie',
  downloadLinks: [{ quality: '1080p', url: '', size: '' }],
  episodes: [],
  seasonDownloadLinks: [],
};


export default function UploadMovie() {
  const { toast } = useToast();
  const movies = useMovieStore((state) => state.latestReleases);
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>(initialFormState);
  
  useEffect(() => {
    const movieId = searchParams.get('id');
    if (movieId && movies.length > 0) {
      const movieToEdit = movies.find(m => m.id === movieId);
      if (movieToEdit) {
        setFormData({
            ...movieToEdit,
            tagsString: movieToEdit.tags ? movieToEdit.tags.join(', ') : '',
            downloadLinks: movieToEdit.downloadLinks && movieToEdit.downloadLinks.length > 0 ? movieToEdit.downloadLinks : [{ quality: '1080p', url: '', size: '' }],
            screenshots: movieToEdit.screenshots && movieToEdit.screenshots.length > 0 ? movieToEdit.screenshots : ['', '', ''],
            episodes: movieToEdit.episodes && movieToEdit.episodes.length > 0 ? movieToEdit.episodes : [],
        });
      }
    } else {
      resetForm();
    }
  }, [searchParams, movies]);

  const resetForm = () => {
    setFormData(initialFormState);
    router.replace('/admin/upload-movie');
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generic link changer
  const handleLinkChange = (links: DownloadLink[], index: number, field: keyof DownloadLink, value: string): DownloadLink[] => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    return newLinks;
  };
  
  // Specific link changers
  const handleMovieLinkChange = (index: number, field: keyof DownloadLink, value: string) => {
    const newLinks = handleLinkChange(formData.downloadLinks || [], index, field, value);
    handleInputChange('downloadLinks', newLinks);
  };
  
  const handleSeasonLinkChange = (index: number, field: keyof DownloadLink, value: string) => {
    const newLinks = handleLinkChange(formData.seasonDownloadLinks || [], index, field, value);
    handleInputChange('seasonDownloadLinks', newLinks);
  };

  const handleEpisodeLinkChange = (epIndex: number, linkIndex: number, field: keyof DownloadLink, value: string) => {
    const newEpisodes = [...(formData.episodes || [])];
    const newLinks = handleLinkChange(newEpisodes[epIndex].downloadLinks, linkIndex, field, value);
    newEpisodes[epIndex].downloadLinks = newLinks;
    handleInputChange('episodes', newEpisodes);
  }


  const handleScreenshotChange = (index: number, value: string) => {
    const newScreenshots = [...(formData.screenshots || [])];
    newScreenshots[index] = value;
    handleInputChange('screenshots', newScreenshots);
  }

  // Generic link/item adder
  const addListItem = <T,>(list: T[] | undefined, newItem: T) => [...(list || []), newItem];

  const addMovieLink = () => handleInputChange('downloadLinks', addListItem(formData.downloadLinks, { quality: '1080p', url: '', size: '' }));
  const addSeasonLink = () => handleInputChange('seasonDownloadLinks', addListItem(formData.seasonDownloadLinks, { quality: '1080p', url: '', size: '' }));
  const addEpisode = () => handleInputChange('episodes', addListItem(formData.episodes, { episodeNumber: (formData.episodes?.length || 0) + 1, title: '', downloadLinks: [{quality: '1080p', url: '', size: ''}] }));
  const addEpisodeLink = (epIndex: number) => {
     const newEpisodes = [...(formData.episodes || [])];
     newEpisodes[epIndex].downloadLinks = addListItem(newEpisodes[epIndex].downloadLinks, { quality: '1080p', url: '', size: '' });
     handleInputChange('episodes', newEpisodes);
  }
  const addScreenshot = () => handleInputChange('screenshots', addListItem(formData.screenshots, ''));

  // Generic link/item remover
  const removeListItem = <T,>(list: T[] | undefined, index: number) => (list || []).filter((_, i) => i !== index);

  const removeMovieLink = (index: number) => handleInputChange('downloadLinks', removeListItem(formData.downloadLinks, index));
  const removeSeasonLink = (index: number) => handleInputChange('seasonDownloadLinks', removeListItem(formData.seasonDownloadLinks, index));
  const removeEpisode = (index: number) => handleInputChange('episodes', removeListItem(formData.episodes, index));
  const removeScreenshot = (index: number) => handleInputChange('screenshots', removeListItem(formData.screenshots, index));
  const removeEpisodeLink = (epIndex: number, linkIndex: number) => {
      const newEpisodes = [...(formData.episodes || [])];
      newEpisodes[epIndex].downloadLinks = removeListItem(newEpisodes[epIndex].downloadLinks, linkIndex);
      handleInputChange('episodes', newEpisodes);
  }


  const handleFetchMetadata = async () => {
    if (!formData.title) {
        toast({ variant: 'destructive', title: 'Title Required', description: 'Please enter a movie title to fetch metadata.' });
        return;
    }
    setIsFetchingMeta(true);
    try {
        const metadata = await fetchMovieMetadata({ title: formData.title, type: formData.contentType || 'movie' });
        if (metadata) {
            setFormData(prev => ({
                ...prev,
                year: metadata.year || prev.year,
                genre: metadata.genres.join(', ') || prev.genre,
                stars: metadata.cast.slice(0, 3).join(', ') || prev.stars,
                creator: metadata.directors.join(', ') || prev.creator,
                synopsis: metadata.synopsis || prev.synopsis,
                tagsString: metadata.tags?.join(', ') || prev.tagsString,
                posterUrl: metadata.posterUrl || prev.posterUrl
            }));
            toast({ title: 'Success!', description: 'Movie metadata has been fetched and populated.' });
        } else {
             toast({ variant: 'destructive', title: 'Not Found', description: 'Could not find metadata for this title.' });
        }
    } catch (error) {
        console.error("AI metadata fetch failed:", error);
        toast({ variant: 'destructive', title: 'AI Error', description: 'Could not fetch metadata. Please try again.' });
    } finally {
        setIsFetchingMeta(false);
    }
  }


  const handleGenerateDescription = async () => {
    if (!formData.title) {
      toast({ variant: 'destructive', title: 'Input Required', description: 'Please provide at least a title before generating.' });
      return;
    }
    setIsGenerating(true);
    try {
      const generatedHtml = await generateMovieDescription({
        title: formData.title,
        year: formData.year || new Date().getFullYear(),
        genre: formData.genre,
        stars: formData.stars,
        language: formData.language,
        quality: formData.quality,
        synopsis: formData.synopsis, // Pass the basic synopsis to expand upon
      });
      handleInputChange('synopsis', generatedHtml);
      toast({ title: 'Success!', description: 'AI-generated description has been populated.' });
    } catch (error) {
      console.error('AI generation failed:', error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate the description. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };


  const handleSubmit = () => {
    if (!formData.title || !formData.genre) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title and Genre are mandatory fields.' });
      return;
    }

    startTransition(async () => {
      const movieData: Partial<Movie> = {
        ...formData,
        tags: formData.tagsString ? formData.tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        screenshots: (formData.screenshots || []).filter(ss => ss.trim() !== ''),
      };
      if (formData.contentType === 'movie') {
        movieData.downloadLinks = (formData.downloadLinks || []).filter(link => link.url.trim() !== '');
        delete movieData.episodes;
        delete movieData.seasonDownloadLinks;
      } else {
        movieData.episodes = (formData.episodes || []).map(ep => ({...ep, downloadLinks: ep.downloadLinks.filter(link => link.url.trim() !== '')})).filter(ep => ep.downloadLinks.length > 0);
        movieData.seasonDownloadLinks = (formData.seasonDownloadLinks || []).filter(link => link.url.trim() !== '');
        delete movieData.downloadLinks;
      }
      delete (movieData as any).tagsString;
      
      try {
        if (formData.id) {
          await updateMovie(formData.id, movieData);
          toast({ title: 'Success!', description: `"${formData.title}" has been updated.` });
        } else {
          const { id, ...newMovieData } = movieData;
          await addMovie(newMovieData as Omit<Movie, 'id'>);
          toast({ title: 'Success!', description: `"${formData.title}" has been added.` });
        }
        resetForm();

      } catch (error) {
        console.error("Database operation failed:", error);
        toast({ variant: 'destructive', title: 'Database Error', description: 'Could not save the movie. Please try again.' });
      }
    });
  };

  const isFormDisabled = isPending || isGenerating || isFetchingMeta;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Column */}
      <Card className="lg:max-h-[85vh] flex flex-col">
        <CardHeader>
          <CardTitle>{formData.id ? 'Edit Content' : 'Upload Content'}</CardTitle>
          <CardDescription>Fill in the details and see a live preview on the right.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-6">
            <div className="space-y-4">
              
              <div className="space-y-2">
                <Label>Content Type</Label>
                 <RadioGroup defaultValue="movie" value={formData.contentType} onValueChange={(val) => handleInputChange('contentType', val)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="movie" id="r-movie" />
                    <Label htmlFor="r-movie">Movie</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="series" id="r-series" />
                    <Label htmlFor="r-series">Series</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="movie-title">Title</Label>
                <div className="flex gap-2">
                    <Input id="movie-title" value={formData.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} disabled={isFormDisabled} placeholder="e.g. The Matrix" />
                    <Button onClick={handleFetchMetadata} variant="outline" size="icon" disabled={isFormDisabled || !formData.title} title="Fetch Metadata with AI">
                        {isFetchingMeta ? <Loader2 className="animate-spin" /> : <Wand2 />}
                    </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="movie-genre">Genre</Label>
                      <Input id="movie-genre" value={formData.genre || ''} onChange={(e) => handleInputChange('genre', e.target.value)} placeholder="e.g. Action, Sci-Fi" disabled={isFormDisabled} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="movie-year">Year</Label>
                      <Input id="movie-year" type="number" value={formData.year || ''} onChange={(e) => handleInputChange('year', Number(e.target.value))} disabled={isFormDisabled} />
                  </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="movie-stars">Stars (comma-separated)</Label>
                  <Input id="movie-stars" value={formData.stars || ''} onChange={(e) => handleInputChange('stars', e.target.value)} placeholder="e.g. Actor One, Actor Two" disabled={isFormDisabled} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="movie-creator">Creator / Director</Label>
                  <Input id="movie-creator" value={formData.creator || ''} onChange={(e) => handleInputChange('creator', e.target.value)} placeholder="e.g. Director Name" disabled={isFormDisabled} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label htmlFor="movie-quality">Quality Description</Label>
                      <Input id="movie-quality" value={formData.quality || ''} onChange={(e) => handleInputChange('quality', e.target.value)} placeholder="e.g. BluRay 4K | 1080p" disabled={isFormDisabled} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="movie-imdb">IMDb Rating</Label>
                      <Input id="movie-imdb" type="number" step="0.1" value={formData.imdbRating || ''} onChange={(e) => handleInputChange('imdbRating', parseFloat(e.target.value))} disabled={isFormDisabled} />
                  </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="movie-tags">Tags (comma-separated)</Label>
                  <Input id="movie-tags" value={formData.tagsString || ''} onChange={(e) => handleInputChange('tagsString', e.target.value)} placeholder="Action, New Release" disabled={isFormDisabled} />
              </div>
               <div className="space-y-2">
                      <Label htmlFor="movie-language">Language</Label>
                      <Input id="movie-language" value={formData.language || ''} onChange={(e) => handleInputChange('language', e.target.value)} placeholder="e.g. English, Hindi" disabled={isFormDisabled} />
              </div>
              {/* Media Links */}
              <div className="space-y-2">
                <Label htmlFor="movie-poster">Poster URL</Label>
                <Input id="movie-poster" value={formData.posterUrl || ''} onChange={(e) => handleInputChange('posterUrl', e.target.value)} placeholder="https://image.tmdb.org/..." disabled={isFormDisabled} />
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
                        disabled={isFormDisabled}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeScreenshot(index)} disabled={isFormDisabled}>
                        <XCircle className="h-5 w-5 text-destructive" />
                      </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addScreenshot} disabled={isFormDisabled}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Screenshot
                </Button>
              </div>

              <Separator />

              {/* Download Links Section */}
              {formData.contentType === 'movie' ? (
                <div className="space-y-4 pt-2">
                  <Label>Download Links</Label>
                  {(formData.downloadLinks || []).map((link, index) => (
                    <DownloadLinkEditor key={index} index={index} link={link} onLinkChange={handleMovieLinkChange} onRemoveLink={removeMovieLink} disabled={isFormDisabled} />
                  ))}
                  <Button variant="outline" size="sm" onClick={addMovieLink} disabled={isFormDisabled}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 pt-2">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <Label className="text-lg">Episodes</Label>
                            <Button variant="outline" size="sm" onClick={addEpisode} disabled={isFormDisabled}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Episode
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {(formData.episodes || []).map((ep, epIndex) => (
                                <EpisodeEditor key={epIndex} epIndex={epIndex} episode={ep} onEpisodeChange={handleInputChange} onLinkChange={handleEpisodeLinkChange} onAddLink={addEpisodeLink} onRemoveLink={removeEpisodeLink} onRemoveEpisode={removeEpisode} disabled={isFormDisabled} />
                            ))}
                        </div>
                    </div>
                    <Separator />
                     <div>
                        <Label className="text-lg mb-4 block">Full Season Download Links</Label>
                        <div className="space-y-4">
                            {(formData.seasonDownloadLinks || []).map((link, index) => (
                                <DownloadLinkEditor key={index} index={index} link={link} onLinkChange={handleSeasonLinkChange} onRemoveLink={removeSeasonLink} disabled={isFormDisabled} />
                            ))}
                            <Button variant="outline" size="sm" onClick={addSeasonLink} disabled={isFormDisabled}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Season Link
                            </Button>
                        </div>
                    </div>
                </div>
              )}


              {/* Synopsis */}
               <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="movie-synopsis">Synopsis / Storyline</Label>
                    <Button onClick={handleGenerateDescription} variant="outline" size="sm" disabled={isFormDisabled}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-primary" />}
                        Generate with AI
                    </Button>
                </div>
                <div className="p-2 border rounded-md">
                   <Textarea 
                      id="movie-synopsis" 
                      value={formData.synopsis || ''} 
                      onChange={(e) => handleInputChange('synopsis', e.target.value)} 
                      disabled={isFormDisabled} 
                      rows={10}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                      placeholder="Provide a brief plot summary here, or use 'Fetch Details with AI' then click 'Generate with AI' to create a full description."
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="justify-between border-t pt-4">
             <div>
                {formData.id && <Button variant="secondary" onClick={resetForm} disabled={isFormDisabled}>Cancel Edit</Button>}
             </div>
             <Button onClick={handleSubmit} disabled={isFormDisabled}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : formData.id ? 'Update Content' : 'Confirm & Upload'}
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

// --- Sub-components for Editors ---

interface DownloadLinkEditorProps {
    index: number;
    link: DownloadLink;
    onLinkChange: (index: number, field: keyof DownloadLink, value: string) => void;
    onRemoveLink: (index: number) => void;
    disabled?: boolean;
}

function DownloadLinkEditor({ index, link, onLinkChange, onRemoveLink, disabled }: DownloadLinkEditorProps) {
    return (
        <div className="flex items-center gap-2">
            <Select
                value={link.quality}
                onValueChange={(value) => onLinkChange(index, 'quality', value)}
                disabled={disabled}
            >
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                    {qualityOptions.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                </SelectContent>
            </Select>
            <Input
                className="w-[100px]"
                placeholder="e.g. 1.2GB"
                value={link.size || ''}
                onChange={(e) => onLinkChange(index, 'size', e.target.value)}
                disabled={disabled}
            />
            <Input
                className="flex-1"
                placeholder="https://example.com/download"
                value={link.url}
                onChange={(e) => onLinkChange(index, 'url', e.target.value)}
                disabled={disabled}
            />
            <Button variant="ghost" size="icon" onClick={() => onRemoveLink(index)} disabled={disabled}>
                <XCircle className="h-5 w-5 text-destructive" />
            </Button>
        </div>
    );
}


interface EpisodeEditorProps {
    epIndex: number;
    episode: Episode;
    onEpisodeChange: (field: keyof FormData, value: any) => void;
    onLinkChange: (epIndex: number, linkIndex: number, field: keyof DownloadLink, value: string) => void;
    onAddLink: (epIndex: number) => void;
    onRemoveLink: (epIndex: number, linkIndex: number) => void;
    onRemoveEpisode: (epIndex: number) => void;
    disabled?: boolean;
}

function EpisodeEditor({ epIndex, episode, onEpisodeChange, onLinkChange, onAddLink, onRemoveLink, onRemoveEpisode, disabled}: EpisodeEditorProps) {
    
    const handleTitleChange = (value: string) => {
        const episodes = useMovieStore.getState().movies.find(m => m.id === (episode as any).id)?.episodes || [];
        const newEpisodes = [...episodes];
        newEpisodes[epIndex].title = value;
        onEpisodeChange('episodes', newEpisodes);
    };

    return (
        <div className="p-3 border rounded-lg bg-background/30 space-y-3">
            <div className="flex justify-between items-center">
                 <Label className="font-semibold">Episode {epIndex + 1}</Label>
                 <Button variant="ghost" size="icon" onClick={() => onRemoveEpisode(epIndex)} disabled={disabled}>
                    <XCircle className="h-5 w-5 text-destructive" />
                </Button>
            </div>
            <Input
                placeholder="Episode Title (optional)"
                value={episode.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={disabled}
            />
            <div className="space-y-2 pl-2 border-l-2 ml-2">
                {episode.downloadLinks.map((link, linkIndex) => (
                    <DownloadLinkEditor key={linkIndex} index={linkIndex} link={link} onLinkChange={(idx, field, val) => onLinkChange(epIndex, idx, field, val)} onRemoveLink={(idx) => onRemoveLink(epIndex, idx)} disabled={disabled} />
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => onAddLink(epIndex)} disabled={disabled}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Download Link
            </Button>
        </div>
    )
}
