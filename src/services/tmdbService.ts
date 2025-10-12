

'use server';

import axios, { type AxiosRequestConfig } from 'axios';

// --- API Key Management ---
const getTMDbKeys = (): string[] => {
    const keys: string[] = [];
    for (let i = 1; i <= 5; i++) {
        const key = process.env[`TMDB_API_KEY_${i}`];
        if (key) {
            keys.push(key);
        }
    }
    return keys;
};

const tmdbKeys = getTMDbKeys();
let currentKeyIndex = 0;

/**
 * Makes a request to the TMDb API with automatic key rotation.
 * If a request fails due to an invalid key or rate limiting, it retries with the next available key.
 * @param config - The Axios request configuration.
 * @param retries - The number of remaining retries (should match the number of keys).
 * @returns The response data from the TMDb API.
 */
const tmdbRequest = async (config: AxiosRequestConfig, retries = tmdbKeys.length): Promise<any> => {
    if (tmdbKeys.length === 0) {
        throw new Error('No TMDb API keys are configured. Please add at least one TMDB_API_KEY_ to your .env file.');
    }
    if (retries <= 0) {
        throw new Error('All TMDb API keys failed. Please check your keys and their usage limits.');
    }

    try {
        const key = tmdbKeys[currentKeyIndex];
        const response = await axios({
            ...config,
            params: {
                ...config.params,
                api_key: key,
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 429)) {
            // 401: Invalid API Key, 429: Rate Limit Exceeded. Rotate key and retry.
            console.warn(`TMDb key at index ${currentKeyIndex} failed. Rotating to the next key.`);
            currentKeyIndex = (currentKeyIndex + 1) % tmdbKeys.length;
            return tmdbRequest(config, retries - 1);
        }
        // For other errors, re-throw them.
        console.error('An unexpected error occurred while fetching from TMDb:', error);
        throw error;
    }
};


// --- Types ---
export type ContentType = 'movie' | 'series';

export interface TMDbSearchResult {
  id: number;
  title: string;
  year: string;
  posterUrl: string;
  type: ContentType;
}

export interface FormattedTMDbData {
  title: string;
  year: number;
  genre:string;
  creator: string;
  stars: string;
  synopsis: string;
  imdbRating: number;
  posterUrl: string;
  trailerUrl?: string;
  runtime?: number;
  releaseDate?: string;
  country?: string;
  numberOfEpisodes?: number;
}

const getPosterUrl = (path: string | null): string => {
    if (!path) {
        return 'https://placehold.co/400x600/0a0a0a/404040?text=No+Poster';
    }
    // Check if the path is a full URL from another service (like an old entry)
    if (path.startsWith('http')) {
        return path;
    }
    const baseUrl = 'https://image.tmdb.org/t/p/w500';
    return `${baseUrl}${path}`;
};


// Helper function to fetch pages for a given content type
const fetchPages = async (title: string, type: 'movie' | 'tv', fetchAll: boolean): Promise<any[]> => {
    const endpoint = `/search/${type}`;
    let allResults: any[] = [];

    const initialData = await tmdbRequest({
        url: `https://api.themoviedb.org/3${endpoint}`,
        method: 'GET',
        params: { query: title, include_adult: false, page: 1 },
    });
    
    allResults = initialData.results;
    
    if (fetchAll) {
      const totalPages = initialData.total_pages;

      if (totalPages > 1) {
          const pagePromises = [];
          for (let i = 2; i <= totalPages; i++) {
              pagePromises.push(
                  tmdbRequest({
                      url: `https://api.themoviedb.org/3${endpoint}`,
                      method: 'GET',
                      params: { query: title, include_adult: false, page: i },
                  })
              );
          }
          
          try {
            const responses = await Promise.all(pagePromises);
            responses.forEach(response => {
                allResults = allResults.concat(response.results);
            });
          } catch (error) {
            console.warn("Failed to fetch all pages, returning partial results.", error);
          }
      }
    }

    return allResults;
};


export const searchMoviesOnTMDb = async (title: string, fetchAll: boolean = false): Promise<TMDbSearchResult[]> => {
    if (tmdbKeys.length === 0) {
        throw new Error('TMDb API key is not configured.');
    }
    const lowerCaseTitle = title.toLowerCase();

    // Fetch pages for both movies and TV shows in parallel based on the fetchAll flag
    const [movieResults, tvResults] = await Promise.all([
        fetchPages(title, 'movie', fetchAll),
        fetchPages(title, 'tv', fetchAll),
    ]);

    const movies = movieResults.map((item: any) => ({
        id: item.id,
        title: item.title,
        year: item.release_date ? new Date(item.release_date).getFullYear().toString() : 'N/A',
        posterUrl: getPosterUrl(item.poster_path),
        type: 'movie' as ContentType,
        popularity: item.popularity
    }));

    const tvShows = tvResults.map((item: any) => ({
        id: item.id,
        title: item.name,
        year: item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : 'N/A',
        posterUrl: getPosterUrl(item.poster_path),
        type: 'series' as ContentType,
        popularity: item.popularity
    }));
    
    const combinedResults = [...movies, ...tvShows];
    
    // Smart sorting: Prioritize exact and close matches
    combinedResults.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        const isAExact = titleA === lowerCaseTitle;
        const isBExact = titleB === lowerCaseTitle;

        if (isAExact && !isBExact) return -1;
        if (!isAExact && isBExact) return 1;

        const aStartsWith = titleA.startsWith(lowerCaseTitle);
        const bStartsWith = titleB.startsWith(lowerCaseTitle);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // Fallback to popularity for other results
        return b.popularity - a.popularity;
    });

    return combinedResults;
};

const getTrailerUrl = (videos: any[]): string | undefined => {
    if (!videos || videos.length === 0) return undefined;

    // Prioritize official trailers
    let trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
    if (trailer) return `https://www.youtube.com/watch?v=${trailer.key}`;

    // Fallback to any trailer
    trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (trailer) return `https://www.youtube.com/watch?v=${trailer.key}`;
    
    // Fallback to any teaser if no trailer
    trailer = videos.find(v => v.type === 'Teaser' && v.site === 'YouTube');
    if (trailer) return `https://www.youtube.com/watch?v=${trailer.key}`;

    return undefined;
};


export const fetchMovieDetailsFromTMDb = async (tmdbId: number, type: ContentType): Promise<FormattedTMDbData> => {
    if (tmdbKeys.length === 0) {
        throw new Error('TMDb API key is not configured.');
    }

    const endpointType = type === 'series' ? 'tv' : 'movie';

    let details;
    try {
        details = await tmdbRequest({
            url: `https://api.themoviedb.org/3/${endpointType}/${tmdbId}`,
            method: 'GET',
            params: {
                append_to_response: 'credits,videos',
            },
        });
    } catch (error) {
        // The tmdbRequest will handle retries, so if it fails here, all keys have failed.
        throw new Error('Movie or TV show not found in TMDb or all API keys failed.');
    }
    
    const releaseDateStr = details.release_date || details.first_air_date;
    const releaseDate = releaseDateStr ? new Date(releaseDateStr) : new Date();
    const genres = details.genres.map((g: any) => g.name).join(', ');
    const rating = parseFloat(details.vote_average?.toFixed(1)) || 0;
    const poster = getPosterUrl(details.poster_path);
    
    let creators: string[] = [];
    if (type === 'movie') {
        creators = details.credits?.crew.filter((p: any) => p.job === 'Director').map((p: any) => p.name) || [];
    } else { // series
        creators = details.created_by?.map((p: any) => p.name) || [];
    }
    
    const actors = details.credits?.cast.slice(0, 3).map((p: any) => p.name) || [];
    const trailer = getTrailerUrl(details.videos?.results);
    const country = details.origin_country?.[0] || details.production_countries?.[0]?.iso_3166_1 || 'N/A';


    return {
        title: details.title || details.name,
        year: releaseDate.getFullYear() || new Date().getFullYear(),
        genre: genres,
        creator: creators.join(', ') || 'N/A',
        stars: actors.join(', ') || 'N/A',
        synopsis: details.overview,
        imdbRating: rating,
        posterUrl: poster,
        trailerUrl: trailer,
        runtime: details.runtime, // For movies
        releaseDate: releaseDateStr,
        country: country,
        numberOfEpisodes: details.number_of_episodes, // For series
    };
};
