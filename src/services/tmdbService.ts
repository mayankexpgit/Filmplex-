
import axios from 'axios';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; 
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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


export const fetchMovieDetailsFromTMDb = async (title: string, year?: number): Promise<FormattedTMDbData> => {
    if (!TMDB_API_KEY) {
        throw new Error('TMDb API key is not configured.');
    }

    const normalizedTitle = title.trim().toLowerCase();
    
    // Helper function to search and find the best match
    const searchAndFind = async (endpoint: 'movie' | 'tv') => {
        let bestMatch: any = null;
        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages) {
            try {
                const searchResponse = await axios.get(`https://api.themoviedb.org/3/search/${endpoint}`, {
                    params: {
                        api_key: TMDB_API_KEY,
                        query: normalizedTitle,
                        year: endpoint === 'movie' ? year : undefined,
                        page: currentPage,
                    },
                });

                const { results, total_pages } = searchResponse.data;
                totalPages = total_pages > 10 ? 10 : total_pages; // Limit to 10 pages to avoid excessive calls

                if (results && results.length > 0) {
                     // Look for an exact title match first
                    const exactMatch = results.find((r: any) => (r.title || r.name)?.toLowerCase() === normalizedTitle);
                    if (exactMatch) {
                        bestMatch = exactMatch;
                        break; // Found exact match, no need to check more pages
                    }

                    // If it's the first page and no exact match yet, hold the first result as a fallback
                    if (currentPage === 1 && !bestMatch) {
                        bestMatch = results[0];
                    }
                }
                currentPage++;

            } catch (error) {
                 if (axios.isAxiosError(error) && error.response?.status === 404) {
                    // This page doesn't exist, stop searching
                    break;
                }
                console.error(`Error fetching page ${currentPage} from TMDb ${endpoint} search:`, error);
                // Don't throw, just break and proceed with what we have
                break;
            }
        }
        return bestMatch;
    };
    
    let searchResult = await searchAndFind('movie');
    if (!searchResult) {
       searchResult = await searchAndFind('tv');
    }

    if (!searchResult) {
        throw new Error('Movie or TV show not found in TMDb.');
    }
    
    const contentId = searchResult.id;
    const contentType = searchResult.media_type || (searchResult.title ? 'movie' : 'tv');

    // Fetch full details with credits and videos
    const detailsResponse = await axios.get(`https://api.themoviedb.org/3/${contentType}/${contentId}`, {
        params: {
            api_key: TMDB_API_KEY,
            append_to_response: 'credits,videos',
        },
    });

    const details = detailsResponse.data;

    // Format the data
    const releaseDate = new Date(details.release_date || details.first_air_date);
    const genres = details.genres.map((g: any) => g.name).join(', ');
    const rating = parseFloat(details.vote_average?.toFixed(1)) || 0;
    const poster = details.poster_path ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}` : '';
    
    let directors: string[] = [];
    if (contentType === 'movie') {
        directors = details.credits?.crew.filter((p: any) => p.job === 'Director').map((p: any) => p.name) || [];
    } else { // For TV shows, use 'created_by'
        directors = details.created_by?.map((p: any) => p.name) || [];
    }

    const actors = details.credits?.cast.slice(0, 3).map((p: any) => p.name) || [];
    const trailer = getTrailerUrl(details.videos?.results);

    return {
        title: details.title || details.name,
        year: releaseDate.getFullYear(),
        genre: genres,
        creator: directors.join(', '),
        stars: actors.join(', '),
        synopsis: details.overview,
        imdbRating: rating,
        posterUrl: poster,
        trailerUrl: trailer,
    };
};
