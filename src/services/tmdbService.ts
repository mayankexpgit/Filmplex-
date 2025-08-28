'use server';

import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY; 
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export type ContentType = 'movie' | 'tv';

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
  genre: string;
  creator: string;
  stars: string;
  synopsis: string;
  imdbRating: number;
  posterUrl: string;
  trailerUrl?: string;
}

export const searchMoviesOnTMDb = async (title: string): Promise<TMDbSearchResult[]> => {
    if (!TMDB_API_KEY) {
        throw new Error('TMDb API key is not configured.');
    }

    const [movieResponse, tvResponse] = await Promise.all([
        axios.get('https://api.themoviedb.org/3/search/movie', {
            params: { api_key: TMDB_API_KEY, query: title, include_adult: false },
        }),
        axios.get('https://api.themoviedb.org/3/search/tv', {
            params: { api_key: TMDB_API_KEY, query: title, include_adult: false },
        }),
    ]);

    const movies = movieResponse.data.results.map((item: any) => ({
        id: item.id,
        title: item.title,
        year: item.release_date ? new Date(item.release_date).getFullYear().toString() : 'N/A',
        posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : 'https://placehold.co/300x450/000000/FFFFFF?text=No+Image',
        type: 'movie' as ContentType,
        popularity: item.popularity
    }));

    const tvShows = tvResponse.data.results.map((item: any) => ({
        id: item.id,
        title: item.name,
        year: item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : 'N/A',
        posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : 'https://placehold.co/300x450/000000/FFFFFF?text=No+Image',
        type: 'tv' as ContentType,
        popularity: item.popularity
    }));
    
    // Combine and sort by popularity
    const combinedResults = [...movies, ...tvShows];
    combinedResults.sort((a, b) => b.popularity - a.popularity);

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
    if (!TMDB_API_KEY) {
        throw new Error('TMDb API key is not configured.');
    }

    let details;
    try {
        const detailsResponse = await axios.get(`https://api.themoviedb.org/3/${type}/${tmdbId}`, {
            params: {
                api_key: TMDB_API_KEY,
                append_to_response: 'credits,videos',
            },
        });
        details = detailsResponse.data;
    } catch (error) {
        throw new Error('Movie or TV show not found in TMDb with the provided ID.');
    }
    
    const releaseDate = new Date(details.release_date || details.first_air_date);
    const genres = details.genres.map((g: any) => g.name).join(', ');
    const rating = parseFloat(details.vote_average?.toFixed(1)) || 0;
    const poster = details.poster_path ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}` : '';
    
    let creators: string[] = [];
    if (type === 'movie') {
        creators = details.credits?.crew.filter((p: any) => p.job === 'Director').map((p: any) => p.name) || [];
    } else { // tv
        creators = details.created_by?.map((p: any) => p.name) || [];
    }
    
    const actors = details.credits?.cast.slice(0, 3).map((p: any) => p.name) || [];
    const trailer = getTrailerUrl(details.videos?.results);

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
    };
};
