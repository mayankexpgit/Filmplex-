
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMovieStore, addMovie, updateMovie } from '@/store/movieStore';
import type { Movie, DownloadLink, Episode } from '@/lib/data';
import { Loader2, PlusCircle, XCircle, Sparkles, Search, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import MovieDetailPreview from '../admin/movie-detail-preview';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { getMovieDetails } from '@/ai/flows/movie-details-flow';
import { searchMoviesOnTMDb, type TMDbSearchResult } from '@/services/tmdbService';
import UploadProgressIndicator from '@/components/admin/upload-progress-indicator';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

type FormData = Omit<Partial<Movie>, 'id'> & {
    id?: string; // ID is optional, only present when editing
    tagsString?: string;
    contentType: 'movie' | 'series';
    seasonNumber?: number;
    partNumber?: number;
};

const qualityOptions = ['4K', '2160p', '1080p', '720p', '480p'];

const initialFormState: FormData = {
  id: undefined,
  title: '',
  year: new Date().getFullYear(),
  posterUrl: '',
  cardInfoText: '',
  trailerUrl: '',
  tagsString: '',
  genre: '',
  language: '',
  imdbRating: 0,
  streamingChannel: '',
  isFeatured: false,
  description: '',
  synopsis: '',
  screenshots: ['', '', ''],
  stars: '',
  creator: '',
  quality: '',
  contentType: 'movie',
  runtime: undefined,
  releaseDate: undefined,
  country: undefined,
  numberOfEpisodes: undefined,
  downloadLinks: [{ quality: '1080p', url: '', size: '' }],
  episodes: [],
  seasonDownloadLinks: [],
  seasonNumber: 1,
  partNumber: 0,
};

const topLevelRoles = ['Regulator', 'Co-Founder'];

function DownloadLinkEditor({
    index,
    link,
    onLinkChange,
    onRemoveLink,
    disabled,
}: {
    index: number,
    link: DownloadLink,
    onLinkChange: (index: number, field: keyof DownloadLink, value: string) => void,
    onRemoveLink: (index: number) => void,
    disabled: boolean,
}) {
  
  return (
    <div className="p-3 border rounded-lg space-y-3 bg-secondary/50">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-sm">Link #{index + 1}</p>
        <Button variant="ghost" size="icon" onClick={() => onRemoveLink(index)} disabled={disabled}>
            <XCircle className="h-5 w-5 text-destructive" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`quality-${index}`} className="text-xs">Quality</Label>
          <Select
              value={link.quality}
              onValueChange={(value) => onLinkChange(index, 'quality', value)}
              disabled={disabled}
            >
              <SelectTrigger id={`quality-${index}`}>
                  <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                  {qualityOptions.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
              </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 relative">
          <Label htmlFor={`url-${index}`} className="text-xs">URL</Label>
          <Input id={`url-${index}`} value={link.url} onChange={e => onLinkChange(index, 'url', e.target.value)} disabled={disabled} placeholder="https://..." />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`size-${index}`} className="text-xs">Size</Label>
          <Input id={`size-${index}`} value={link.size || ''} onChange={e => onLinkChange(index, 'size', e.target.value)} disabled={disabled} placeholder="e.g. 1.2GB" />
        </div>
      </div>
    </div>
  );
}

function EpisodeEditor({ epIndex, episode, onEpisodeChange, onLinkChange, onAddLink, onRemoveLink, onRemoveEpisode, disabled, currentEpisodes }: { epIndex: number, episode: Episode, onEpisodeChange: (field: 'episodes', value: Episode[]) => void, onLinkChange: (epIndex: number, linkIndex: number, field: keyof DownloadLink, value: string) => void, onAddLink: (epIndex: number) => void, onRemoveLink: (epIndex: number, linkIndex: number) => void, onRemoveEpisode: (epIndex: number) => void, disabled: boolean, currentEpisodes: Episode[] }) {
    
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEpisodes = [...currentEpisodes];
        newEpisodes[epIndex] = { ...newEpisodes[epIndex], title: e.target.value };
        onEpisodeChange('episodes', newEpisodes);
    }
    
    return (
        <div className="p-3 border rounded-lg space-y-3 bg-secondary/50">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">Episode #{episode.episodeNumber}</p>
                 <Button variant="ghost" size="icon" onClick={() => onRemoveEpisode(epIndex)} disabled={disabled}>
                    <XCircle className="h-5 w-5 text-destructive" />
                </Button>
            </div>
            <div className="space-y-1">
                <Label htmlFor={`ep-title-${epIndex}`} className="text-xs">Episode Title</Label>
                <Input id={`ep-title-${epIndex}`} value={episode.title} onChange={handleTitleChange} disabled={disabled} placeholder="e.g. The Pilot" />
            </div>
            <div className="space-y-3 pl-4 border-l-2 border-border">
                {episode.downloadLinks.map((link, linkIndex) => (
                    <DownloadLinkEditor 
                        key={linkIndex} 
                        index={linkIndex} 
                        link={link} 
                        onLinkChange={(idx, field, val) => onLinkChange(epIndex, idx, field, val)} 
                        onRemoveLink={(idx) => onRemoveLink(epIndex, idx)} 
                        disabled={disabled}
                    />
                ))}
            </div>
             <Button variant="outline" size="sm" onClick={() => onAddLink(epIndex)} disabled={disabled}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Link for Ep. {episode.episodeNumber}
            </Button>
        </div>
    )
}

export default function UploadMovie() {
  const { toast } = useToast();
  const { movies, startCoinAnimation } = useMovieStore(state => ({
    movies: state.allMovies,
    startCoinAnimation: state.startCoinAnimation,
  }));
  const { adminProfile } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>(initialFormState);
  
  // State for the recommendation dialog
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TMDbSearchResult[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showExactMatches, setShowExactMatches] = useState(false);
  const [searchAllPages, setSearchAllPages] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [hasDownloadLinks, setHasDownloadLinks] = useState(false);


  useEffect(() => {
    const movieId = searchParams.get('id');
    if (movieId) {
      const movieToEdit = movies.find(m => m.id === movieId);
      if (movieToEdit) {
        // Permission check
        const isTopLevelAdmin = adminProfile && topLevelRoles.includes(adminProfile.info);
        const isOwner = movieToEdit.uploadedBy === adminProfile?.name;
        // Legacy movies have no owner, so only top level admins can edit them.
        const canEditLegacy = !movieToEdit.uploadedBy && isTopLevelAdmin;

        if (!isTopLevelAdmin && !isOwner && !canEditLegacy) {
            toast({
                variant: 'destructive',
                title: 'Permission Denied',
                description: "You don't have permission to edit this movie.",
            });
            router.replace('/admin/movie-list');
            return;
        }

        setFormData({
            ...initialFormState, // Ensure all fields are present
            ...movieToEdit,
            tagsString: movieToEdit.tags ? movieToEdit.tags.join(', ') : '',
            downloadLinks: movieToEdit.downloadLinks && movieToEdit.downloadLinks.length > 0 ? movieToEdit.downloadLinks : [{ quality: '1080p', url: '', size: '' }],
            screenshots: movieToEdit.screenshots && movieToEdit.screenshots.length > 0 ? movieToEdit.screenshots : ['', '', ''],
            episodes: movieToEdit.episodes && movieToEdit.episodes.length > 0 ? movieToEdit.episodes : [],
            contentType: movieToEdit.contentType || 'movie',
        });
      }
    } else {
      resetForm();
    }
  }, [searchParams, movies, adminProfile, router, toast]);

  const resetForm = () => {
    setFormData(initialFormState);
    router.replace('/admin/upload-movie');
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (formData.contentType === 'series' && formData.title) {
      setFormData(prev => {
        const { title, seasonNumber, partNumber, cardInfoText } = prev;
        
        // Construct the new first line
        let newTitleLine = title;
        if (seasonNumber) {
          newTitleLine += ` - Season ${String(seasonNumber).padStart(2, '0')}`;
        }
        if (partNumber) {
          newTitleLine += ` (Part ${String(partNumber).padStart(2, '0')})`;
        }

        // Split the existing cardInfoText into lines
        const lines = cardInfoText?.split('\n') || [];
        
        // Replace the first line with the new constructed title line
        lines[0] = newTitleLine;
        
        // Join the lines back together
        const newCardInfo = lines.join('\n');

        // Only update if it's different to prevent infinite loops
        if (newCardInfo !== cardInfoText) {
          return { ...prev, cardInfoText: newCardInfo };
        }

        return prev;
      });
    }
  }, [formData.title, formData.seasonNumber, formData.partNumber, formData.contentType]);

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
    if (newEpisodes[epIndex]) {
        const newLinks = handleLinkChange(newEpisodes[epIndex].downloadLinks, linkIndex, field, value);
        newEpisodes[epIndex].downloadLinks = newLinks;
        handleInputChange('episodes', newEpisodes);
    }
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
  const addEpisode = () => {
    const newEpisode: Episode = {
        episodeNumber: (formData.episodes?.length || 0) + 1,
        title: '',
        downloadLinks: [{ quality: '1080p', url: '', size: '' }]
    };
    handleInputChange('episodes', addListItem(formData.episodes, newEpisode));
  };
  const addEpisodeLink = (epIndex: number) => {
     const newEpisodes = [...(formData.episodes || [])];
     if (newEpisodes[epIndex]) {
        newEpisodes[epIndex].downloadLinks = addListItem(newEpisodes[epIndex].downloadLinks, { quality: '1080p', url: '', size: '' });
        handleInputChange('episodes', newEpisodes);
     }
  }
  const addScreenshot = () => handleInputChange('screenshots', addListItem(formData.screenshots, ''));

  // Generic link/item remover
  const removeListItem = <T,>(list: T[] | undefined, index: number) => (list || []).filter((_, i) => i !== index);

  const removeMovieLink = (index: number) => handleInputChange('downloadLinks', removeListItem(formData.downloadLinks, index));
  const removeSeasonLink = (index: number) => handleInputChange('seasonDownloadLinks', removeListItem(formData.seasonDownloadLinks, index));
  const removeEpisode = (index: number) => {
    const newEpisodes = (formData.episodes || [])
        .filter((_, i) => i !== index)
        .map((ep, i) => ({ ...ep, episodeNumber: i + 1 })); // Re-number subsequent episodes
    handleInputChange('episodes', newEpisodes);
  };
  const removeScreenshot = (index: number) => handleInputChange('screenshots', removeListItem(formData.screenshots, index));
  const removeEpisodeLink = (epIndex: number, linkIndex: number) => {
      const newEpisodes = [...(formData.episodes || [])];
      if (newEpisodes[epIndex]) {
        newEpisodes[epIndex].downloadLinks = removeListItem(newEpisodes[epIndex].downloadLinks, linkIndex);
        handleInputChange('episodes', newEpisodes);
      }
  }
  
  const proceedWithSearch = async () => {
    setIsSearching(true);
    setIsDialogOpen(true);
    setShowExactMatches(false);
    try {
      const results = await searchMoviesOnTMDb(formData.title!, searchAllPages);
      setSearchResults(results);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: error.message || 'Could not search for movies.',
      });
      setIsDialogOpen(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchClick = () => {
    if (!formData.title) {
      toast({
        variant: 'destructive',
        title: 'Title Required',
        description: 'Please enter a movie title before searching.',
      });
      return;
    }
    if (searchAllPages) {
      setIsWarningDialogOpen(true);
    } else {
      proceedWithSearch();
    }
  };


  const handleMovieSelect = async (tmdbId: number, type: 'movie' | 'series') => {
    setIsDialogOpen(false);
    setSearchResults([]);
    setIsFetchingAI(true);
    
    const { dismiss } = toast({
      title: 'Fetching Details...',
      description: 'Please wait, fetching all content details.',
    });

    try {
        const result = await getMovieDetails({ tmdbId, type });

        setFormData(prev => ({
            ...prev,
            contentType: type,
            title: result.title,
            year: result.year,
            posterUrl: result.posterUrl,
            genre: result.genre,
            imdbRating: result.imdbRating,
            stars: result.stars,
            creator: result.creator,
            tagsString: result.tags.join(', '),
            synopsis: result.synopsis,
            description: result.description,
            cardInfoText: result.cardInfoText,
            trailerUrl: result.trailerUrl,
            runtime: result.runtime,
            releaseDate: result.releaseDate,
            country: result.country,
            numberOfEpisodes: result.numberOfEpisodes,
        }));

        dismiss();
        toast({
            variant: 'success',
            title: 'Success!',
            description: 'Content details have been collected.',
        });
    } catch (error: any) {
        dismiss();
        console.error("Auto-fill failed:", error);
        toast({
            variant: 'destructive',
            title: 'API Error',
            description: error.message || 'Could not fetch movie details. Please fill manually.',
        });
    } finally {
        setIsFetchingAI(false);
    }
  };


  const handleSave = async () => {
    // Create a mutable copy and remove the 'id' for the data to be saved.
    // The 'id' in formData is only for tracking if we are in 'edit' mode.
    const { id: editId, ...movieDataToSave } = formData;
      
    const finalMovieData: Partial<Movie> = {
      ...movieDataToSave,
      tags: formData.tagsString ? formData.tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      screenshots: (formData.screenshots || []).filter(ss => ss && ss.trim() !== ''),
    };

    if (formData.contentType === 'movie') {
      finalMovieData.downloadLinks = (finalMovieData.downloadLinks || []).filter(link => link && link.url.trim() !== '');
      delete finalMovieData.episodes;
      delete finalMovieData.seasonDownloadLinks;
      delete finalMovieData.numberOfEpisodes;
    } else {
      finalMovieData.episodes = (finalMovieData.episodes || []).map(ep => ({...ep, downloadLinks: ep.downloadLinks.filter(link => link && link.url.trim() !== '')})).filter(ep => ep && ep.downloadLinks.length > 0);
      finalMovieData.seasonDownloadLinks = (finalMovieData.seasonDownloadLinks || []).filter(link => link && link.url.trim() !== '');
      delete finalMovieData.downloadLinks;
    }
    delete (finalMovieData as any).tagsString;

    const linksPresent =
      (finalMovieData.contentType === 'movie' && (finalMovieData.downloadLinks || []).some(l => l.url.trim() !== '')) ||
      (finalMovieData.contentType === 'series' &&
        ((finalMovieData.episodes || []).some(ep => ep.downloadLinks.some(l => l.url.trim() !== '')) ||
         (finalMovieData.seasonDownloadLinks || []).some(l => l.url.trim() !== '')));
    setHasDownloadLinks(linksPresent);
      
    try {
      if (editId) {
        // We are in edit mode
        await updateMovie(editId, finalMovieData);
      } else {
        // We are in create mode
        await addMovie(finalMovieData as Omit<Movie, 'id'>);
      }
      
      toast({ 
          title: 'Upload Complete!', 
          description: `"${formData.title}" has been successfully saved.`,
          variant: 'success'
      });

      if (linksPresent) {
        startCoinAnimation();
      }

      resetForm();

    } catch (error) {
      console.error("Database operation failed:", error);
      toast({ variant: 'destructive', title: 'Database Error', description: 'Could not save the movie. Please try again.' });
    }
  };
  
  const triggerSave = (e: React.MouseEvent) => {
     if (!formData.title || !formData.genre) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title and Genre are mandatory fields.' });
      e.preventDefault();
      return;
    }

    startTransition(handleSave);
  };

  const confirmAndSave = (e: React.MouseEvent) => {
    if (!formData.title || !formData.genre) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title and Genre are mandatory fields.' });
      e.preventDefault();
    }
  }


  const isFormDisabled = isPending || isFetchingAI || isSearching;

  const displayedSearchResults = showExactMatches
    ? searchResults.filter(item => item.title.toLowerCase() === formData.title?.toLowerCase())
    : searchResults;


  return (
    <>
      {isPending && <UploadProgressIndicator hasDownloadLinks={hasDownloadLinks} />}
      <div className={cn(
        "grid grid-cols-1 gap-8",
        showPreview && "lg:grid-cols-2"
      )}>
        <Card className="lg:max-h-[85vh] flex flex-col">
          <CardHeader>
            <CardTitle>{formData.id ? 'Edit Content' : 'Upload Content'}</CardTitle>
            <CardDescription>Fill in the details. Use the preview button to see your changes live.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-6">
              <div className="space-y-4">
                
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <RadioGroup value={formData.contentType} onValueChange={(val) => handleInputChange('contentType', val)} className="flex gap-4">
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
                  <div className="flex items-center gap-2">
                      <Input id="movie-title" value={formData.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} disabled={isFormDisabled} placeholder="e.g. The Matrix" />
                      <Button variant="outline" size="icon" onClick={handleSearchClick} disabled={isFormDisabled} className="ai-glow-button">
                          {isSearching || isFetchingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          <span className="sr-only">Auto-fill with AI</span>
                      </Button>
                  </div>
                </div>
                
                 {formData.contentType === 'series' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="season-number">Season Number</Label>
                            <Select 
                                value={String(formData.seasonNumber || 1)} 
                                onValueChange={(val) => handleInputChange('seasonNumber', Number(val))}
                                disabled={isFormDisabled}
                            >
                                <SelectTrigger id="season-number">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                                        <SelectItem key={num} value={String(num)}>Season {num}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="part-number">Part Number (Optional)</Label>
                            <Select 
                                value={String(formData.partNumber || 0)}
                                onValueChange={(val) => handleInputChange('partNumber', Number(val))}
                                disabled={isFormDisabled}
                            >
                                <SelectTrigger id="part-number">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">None</SelectItem>
                                    {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                                        <SelectItem key={num} value={String(num)}>Part {num}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                 )}

                <div className="space-y-2">
                  <Label htmlFor="card-info-text">Card Info Text</Label>
                  <Textarea id="card-info-text" value={formData.cardInfoText || ''} onChange={(e) => handleInputChange('cardInfoText', e.target.value)} disabled={isFormDisabled} placeholder="Line 1: Title and Year&#10;Line 2: Audio Info&#10;Line 3: Qualities" rows={5} />
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
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="release-date">Release Date</Label>
                        <Input id="release-date" value={formData.releaseDate || ''} onChange={(e) => handleInputChange('releaseDate', e.target.value)} placeholder="e.g. 2024-07-15" disabled={isFormDisabled} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="movie-country">Country</Label>
                        <Input id="movie-country" value={formData.country || ''} onChange={(e) => handleInputChange('country', e.target.value)} placeholder="e.g. US" disabled={isFormDisabled} />
                    </div>
                </div>
                {formData.contentType === 'movie' ? (
                     <div className="space-y-2">
                        <Label htmlFor="movie-runtime">Runtime (minutes)</Label>
                        <Input id="movie-runtime" type="number" value={formData.runtime || ''} onChange={(e) => handleInputChange('runtime', Number(e.target.value))} disabled={isFormDisabled} />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="series-episodes">Total Episodes</Label>
                        <Input id="series-episodes" type="number" value={formData.numberOfEpisodes || ''} onChange={(e) => handleInputChange('numberOfEpisodes', Number(e.target.value))} disabled={isFormDisabled} />
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="movie-language">Language</Label>
                    <Input id="movie-language" value={formData.language || ''} onChange={(e) => handleInputChange('language', e.target.value)} placeholder="e.g. English, Hindi" disabled={isFormDisabled} />
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
                        <Label htmlFor="movie-imdb">TMDb Rating</Label>
                        <Input id="movie-imdb" type="number" step="0.1" value={formData.imdbRating || ''} onChange={(e) => handleInputChange('imdbRating', parseFloat(e.target.value))} disabled={isFormDisabled} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="movie-tags">Tags (comma-separated)</Label>
                    <Input id="movie-tags" value={formData.tagsString || ''} onChange={(e) => handleInputChange('tagsString', e.target.value)} placeholder="Action, New Release" disabled={isFormDisabled} />
                </div>
                {/* Media Links */}
                <div className="space-y-2">
                  <Label htmlFor="movie-poster">Poster URL</Label>
                  <Input id="movie-poster" value={formData.posterUrl || ''} onChange={(e) => handleInputChange('posterUrl', e.target.value)} placeholder="https://image.tmdb.org/..." disabled={isFormDisabled} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trailer-url">Trailer URL</Label>
                  <Input id="trailer-url" value={formData.trailerUrl || ''} onChange={(e) => handleInputChange('trailerUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." disabled={isFormDisabled} />
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
                      <DownloadLinkEditor 
                        key={index} 
                        index={index} 
                        link={link} 
                        onLinkChange={handleMovieLinkChange} 
                        onRemoveLink={removeMovieLink} 
                        disabled={isFormDisabled} 
                      />
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
                              {(formData.episodes || []).map((episode, epIndex) => (
                                  episode && <EpisodeEditor 
                                      key={epIndex} 
                                      epIndex={epIndex} 
                                      episode={episode} 
                                      onEpisodeChange={handleInputChange}
                                      onLinkChange={handleEpisodeLinkChange} 
                                      onAddLink={addEpisodeLink} 
                                      onRemoveLink={removeEpisodeLink} 
                                      onRemoveEpisode={removeEpisode} 
                                      disabled={isFormDisabled} 
                                      currentEpisodes={formData.episodes || []}
                                  />
                              ))}
                          </div>
                      </div>
                      <Separator />
                      <div>
                          <Label className="text-lg mb-4 block">Full Season Download Links</Label>
                          <div className="space-y-4">
                              {(formData.seasonDownloadLinks || []).map((link, index) => (
                                  <DownloadLinkEditor 
                                    key={index} 
                                    index={index} 
                                    link={link} 
                                    onLinkChange={handleSeasonLinkChange} 
                                    onRemoveLink={removeSeasonLink} 
                                    disabled={isFormDisabled}
                                  />
                              ))}
                              <Button variant="outline" size="sm" onClick={addSeasonLink} disabled={isFormDisabled}>
                                  <PlusCircle className="mr-2 h-4 w-4" /> Add Season Link
                              </Button>
                          </div>
                      </div>
                  </div>
                )}

                <Separator />

                {/* Synopsis */}
                <div className="space-y-2">
                  <Label htmlFor="movie-synopsis">Synopsis</Label>
                  <Textarea 
                    id="movie-synopsis" 
                    value={formData.synopsis || ''} 
                    onChange={(e) => handleInputChange('synopsis', e.target.value)} 
                    disabled={isFormDisabled} 
                    rows={5}
                    placeholder="Provide a brief synopsis of the movie/series..."
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="movie-description">Description</Label>
                  <div className="p-2 border rounded-md">
                    <Textarea 
                        id="movie-description" 
                        value={formData.description || ''} 
                        onChange={(e) => handleInputChange('description', e.target.value)} 
                        disabled={isFormDisabled} 
                        rows={10}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        placeholder="Provide a longer description or review here..."
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="justify-between border-t pt-4">
              <div className="flex gap-2">
                  {formData.id && <Button variant="secondary" onClick={resetForm} disabled={isFormDisabled}>Cancel Edit</Button>}
                   <Button 
                    variant="outline" 
                    onClick={() => setShowPreview(!showPreview)} 
                    disabled={isFormDisabled}
                  >
                    {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
              </div>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button onClick={confirmAndSave} disabled={isFormDisabled} id="upload-confirm-button">
                          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {formData.id ? 'Update Content' : 'Confirm & Upload'}
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action will save the current data to the database. Please double-check that all information is correct before proceeding.
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={triggerSave}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </CardFooter>
        </Card>
        
        {showPreview && (
          <div className="lg:max-h-[85vh] overflow-hidden rounded-lg border">
            <ScrollArea className="h-full">
              <MovieDetailPreview movie={formData as Movie} />
            </ScrollArea>
          </div>
        )}
      </div>
      
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
              <DialogHeader>
                  <DialogTitle>Select a Movie or Series</DialogTitle>
                  <DialogDescription>
                      We found these results on TMDb. Select the correct one to auto-fill details.
                  </DialogDescription>
                  <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center space-x-2">
                          <Switch id="exact-matches" checked={showExactMatches} onCheckedChange={setShowExactMatches} />
                          <Label htmlFor="exact-matches">Show exact matches only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Switch id="search-all" checked={searchAllPages} onCheckedChange={setSearchAllPages} />
                          <Label htmlFor="search-all">Search all pages (slower)</Label>
                      </div>
                  </div>
              </DialogHeader>
              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  {isSearching ? (
                      <div className="flex justify-center items-center h-48">
                          <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                  ) : displayedSearchResults.length > 0 ? (
                    <div className="space-y-2">
                      {displayedSearchResults.map((item) => (
                        <div key={`${item.id}-${item.type}`} onClick={() => handleMovieSelect(item.id, item.type)} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent cursor-pointer">
                            <Image src={item.posterUrl} alt={item.title} width={60} height={90} className="rounded-md" />
                            <div className="flex-1">
                                <p className="font-semibold">{item.title} ({item.year})</p>
                                <Badge variant={item.type === 'movie' ? 'default' : 'secondary'}>{item.type === 'movie' ? 'Movie' : 'TV Series'}</Badge>
                            </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-10">No results found for "{formData.title}". Try a different search term.</p>
                  )}
              </div>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-primary"/>
              Full Search Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              Searching all pages can be slow and may use more API credits. It's recommended for titles that don't appear in the initial quick search. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSearchAllPages(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithSearch}>Proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}
