
import axios from 'axios';

const API_KEY = process.env.TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';


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

const getTrailerUrl = (videos: any): string | undefined => {
    if (videos?.results) {
        // Prioritize "Official Trailer", then any "Trailer", then any "Teaser"
        const officialTrailer = videos.results.find((video: any) => video.site === 'YouTube' && video.type === 'Trailer' && video.official);
        if (officialTrailer) return `https://www.youtube.com/watch?v=${officialTrailer.key}`;

        const anyTrailer = videos.results.find((video: any) => video.site === 'YouTube' && video.type === 'Trailer');
        if (anyTrailer) return `https://www.youtube.com/watch?v=${anyTrailer.key}`;
        
        const anyTeaser = videos.results.find((video: any) => video.site === 'YouTube' && video.type === 'Teaser');
        if (anyTeaser) return `https://www.youtube.com/watch?v=${anyTeaser.key}`;
    }
    return undefined;
};


export const fetchMovieDetailsFromTMDb = async (title: string, year?: number): Promise<FormattedTMDbData> => {
  if (!API_KEY) {
    throw new Error('TMDb API key is not configured.');
  }

  const normalizedTitle = title.trim().toLowerCase();
  
  try {
    const searchParams: any = {
        api_key: API_KEY,
        query: normalizedTitle,
    };
    if (year) {
        searchParams.year = year;
    }

    const searchResponse = await axios.get(`${API_BASE_URL}/search/movie`, { params: searchParams });
    
    if (!searchResponse.data || !searchResponse.data.results || searchResponse.data.results.length === 0) {
      // Fallback: If no results with year, search without it
      if (year) {
        const fallbackParams = { api_key: API_KEY, query: normalizedTitle };
        const fallbackResponse = await axios.get(`${API_BASE_URL}/search/movie`, { params: fallbackParams });
        if (!fallbackResponse.data || !fallbackResponse.data.results || fallbackResponse.data.results.length === 0) {
            throw new Error('Movie not found in TMDb.');
        }
        searchResponse.data = fallbackResponse.data;
      } else {
        throw new Error('Movie not found in TMDb.');
      }
    }
    
    const results = searchResponse.data.results;

    // Find an exact match ignoring case, otherwise take the first result.
    let movie = results.find((m: any) => m.title.toLowerCase() === normalizedTitle);
    if (!movie) {
        movie = results[0];
    }
    
    const contentId = movie.id;
    const detailParams = {
      api_key: API_KEY,
      append_to_response: 'credits,videos'
    };

    const movieResponse = await axios.get(`${API_BASE_URL}/movie/${contentId}`, { params: detailParams });
    const details = movieResponse.data;
    const { credits, videos } = details;

    const director = credits.crew.find((member: any) => member.job === 'Director');
    const topActors = credits.cast.slice(0, 3).map((actor: any) => actor.name);

    return {
        title: details.title,
        year: details.release_date ? new Date(details.release_date).getFullYear() : 0,
        genre: details.genres.map((g: any) => g.name).join(', '),
        creator: director ? director.name : 'N/A',
        stars: topActors.join(', '),
        synopsis: details.overview,
        imdbRating: parseFloat(details.vote_average.toFixed(1)) || 0,
        posterUrl: details.poster_path ? `${IMAGE_BASE_URL}${details.poster_path}` : '',
        trailerUrl: getTrailerUrl(videos),
    };

  } catch (error: any) {
    console.error('Error fetching from TMDb:', error.message);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`TMDb API Error: ${error.response.data?.status_message || error.message}`);
    }
    // Re-throw our custom or other errors
    throw error;
  }
};
