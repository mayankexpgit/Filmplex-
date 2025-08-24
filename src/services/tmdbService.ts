
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
    let bestMatch: any = null;
    let fallbackResult: any = null;
    
    let currentPage = 1;
    let totalPages = 1;

    // Search through all pages until an exact match is found
    while (currentPage <= totalPages) {
        try {
            const searchResponse = await axios.get('https://api.themoviedb.org/3/search/movie', {
                params: {
                    api_key: TMDB_API_KEY,
                    query: normalizedTitle,
                    year: year,
                    page: currentPage,
                },
            });

            const { results, total_pages } = searchResponse.data;
            totalPages = total_pages > 10 ? 10 : total_pages; // Cap at 10 pages to prevent excessive requests

            if (results && results.length > 0) {
                // Store the very first result as a fallback
                if (currentPage === 1) {
                    fallbackResult = results[0];
                }
                
                // Look for an exact title match on the current page
                const exactMatch = results.find((r: any) => (r.title || r.name)?.toLowerCase() === normalizedTitle);
                if (exactMatch) {
                    bestMatch = exactMatch;
                    break; // Exact match found, no need to search more pages
                }
            }
            
            // If no results on the first page, break
            if (results.length === 0 && currentPage === 1) {
                break;
            }

            currentPage++;

        } catch (error) {
             if (axios.isAxiosError(error)) {
                console.error(`Error fetching page ${currentPage} from TMDb:`, error.message);
                // If it's a client error (like 404), stop trying. Otherwise, it might be a server issue.
                if (error.response && error.response.status >= 400 && error.response.status < 500) {
                    break;
                }
            } else {
                 console.error('An unexpected error occurred during TMDb search:', error);
            }
            // Break on any error to be safe
            break;
        }
    }
    
    // Use the exact match if found, otherwise use the fallback
    const finalResult = bestMatch || fallbackResult;

    if (!finalResult) {
        throw new Error('Movie not found in TMDb.');
    }
    
    const contentId = finalResult.id;
    
    // Fetch full details for the matched movie
    const detailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${contentId}`, {
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
