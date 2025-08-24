
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

  try {
    let searchResult: any | null = null;
    let mediaType: 'movie' | 'tv' | null = null;

    // --- New Targeted Search Logic ---
    
    // 1. Search for a MOVIE first
    const movieSearchParams: { api_key: string, query: string, year?: number } = { api_key: API_KEY, query: title };
    if (year) movieSearchParams.year = year;
    const movieSearchResponse = await axios.get(`${API_BASE_URL}/search/movie`, { params: movieSearchParams });

    if (movieSearchResponse.data.results.length > 0) {
      searchResult = movieSearchResponse.data.results[0];
      mediaType = 'movie';
    } else {
      // 2. If no movie found, search for a TV SHOW
      const tvSearchParams: { api_key: string, query: string, first_air_date_year?: number } = { api_key: API_KEY, query: title };
      if (year) tvSearchParams.first_air_date_year = year;
      const tvSearchResponse = await axios.get(`${API_BASE_URL}/search/tv`, { params: tvSearchParams });

      if (tvSearchResponse.data.results.length > 0) {
        searchResult = tvSearchResponse.data.results[0];
        mediaType = 'tv';
      }
    }

    // 3. If still no results, throw an error
    if (!searchResult || !mediaType) {
        throw new Error('Movie or TV show not found in TMDb.');
    }
    
    const contentId = searchResult.id;
    const detailParams = {
      api_key: API_KEY,
      append_to_response: 'credits,videos'
    };
    
    // --- Fetch Details based on Media Type ---

    if (mediaType === 'movie') {
        const movieResponse = await axios.get(`${API_BASE_URL}/movie/${contentId}`, { params: detailParams });
        const details = movieResponse.data;
        const { credits, videos } = details;

        const director = credits.crew.find((member: any) => member.job === 'Director');
        const topActors = credits.cast.slice(0, 3).map((actor: any) => actor.name);

        return {
            title: details.title,
            year: new Date(details.release_date).getFullYear(),
            genre: details.genres.map((g: any) => g.name).join(', '),
            creator: director ? director.name : 'N/A',
            stars: topActors.join(', '),
            synopsis: details.overview,
            imdbRating: parseFloat(details.vote_average.toFixed(1)) || 0,
            posterUrl: details.poster_path ? `${IMAGE_BASE_URL}${details.poster_path}` : '',
            trailerUrl: getTrailerUrl(videos),
        };

    } else { // mediaType === 'tv'
        const tvResponse = await axios.get(`${API_BASE_URL}/tv/${contentId}`, { params: detailParams });
        const details = tvResponse.data;
        const { credits, videos } = details;
        
        const creators = details.created_by.map((c: any) => c.name);
        const topActors = credits.cast.slice(0, 3).map((actor: any) => actor.name);

        return {
            title: details.name,
            year: new Date(details.first_air_date).getFullYear(),
            genre: details.genres.map((g: any) => g.name).join(', '),
            creator: creators.length > 0 ? creators.join(', ') : 'N/A',
            stars: topActors.join(', '),
            synopsis: details.overview,
            imdbRating: parseFloat(details.vote_average.toFixed(1)) || 0,
            posterUrl: details.poster_path ? `${IMAGE_BASE_URL}${details.poster_path}` : '',
            trailerUrl: getTrailerUrl(videos),
        };
    }

  } catch (error: any) {
    console.error('Error fetching from TMDb:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`TMDb API request failed: ${error.response.data?.status_message || error.message}`);
    }
    // Re-throw our custom or other errors
    throw error;
  }
};
