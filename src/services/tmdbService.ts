
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY; 
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDbSearchResult {
  id: number;
  title: string;
  year: string;
  posterUrl: string;
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

    const searchResponse = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: {
            api_key: TMDB_API_KEY,
            query: title,
            include_adult: false,
        },
    });

    if (!searchResponse.data.results) {
        return [];
    }

    return searchResponse.data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : 'N/A',
        posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://placehold.co/300x450/000000/FFFFFF?text=No+Image',
    }));
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


export const fetchMovieDetailsFromTMDb = async (tmdbId: number): Promise<FormattedTMDbData> => {
    if (!TMDB_API_KEY) {
        throw new Error('TMDb API key is not configured.');
    }

    let details;
    try {
        const detailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
            params: {
                api_key: TMDB_API_KEY,
                append_to_response: 'credits,videos',
            },
        });
        details = detailsResponse.data;
    } catch (error) {
        throw new Error('Movie not found in TMDb with the provided ID.');
    }
    
    // Format the data
    const releaseDate = new Date(details.release_date || details.first_air_date);
    const genres = details.genres.map((g: any) => g.name).join(', ');
    const rating = parseFloat(details.vote_average?.toFixed(1)) || 0;
    const poster = details.poster_path ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}` : '';
    
    let directors: string[] = details.credits?.crew.filter((p: any) => p.job === 'Director').map((p: any) => p.name) || [];
    
    const actors = details.credits?.cast.slice(0, 3).map((p: any) => p.name) || [];
    const trailer = getTrailerUrl(details.videos?.results);

    return {
        title: details.title || details.name,
        year: releaseDate.getFullYear(),
        genre: genres,
        creator: directors.join(', ') || 'N/A',
        stars: actors.join(', ') || 'N/A',
        synopsis: details.overview,
        imdbRating: rating,
        posterUrl: poster,
        trailerUrl: trailer,
    };
};
