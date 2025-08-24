
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

export const fetchMovieDetailsFromTMDb = async (title: string, year?: number): Promise<FormattedTMDbData> => {
  if (!API_KEY) {
    throw new Error('TMDb API key is not configured.');
  }

  try {
    const performSearch = async (includeYear: boolean) => {
      const searchParams: { api_key: string, query: string, year?: number, first_air_date_year?: number } = {
        api_key: API_KEY,
        query: title,
      };
      if (includeYear && year) {
        searchParams.year = year;
        searchParams.first_air_date_year = year;
      }
      return await axios.get(`${API_BASE_URL}/search/multi`, { params: searchParams });
    }

    // 1. Search for the content (movie or TV) to get its ID and media type
    let searchResponse = await performSearch(true);

    // If no results with the year, try again without it.
    if (searchResponse.data.results.length === 0) {
      searchResponse = await performSearch(false);
    }
    
    // Filter out people from search results and take the first movie or TV show
    const searchResult = searchResponse.data.results.find((r: any) => r.media_type === 'movie' || r.media_type === 'tv');

    if (!searchResult) {
        throw new Error('Movie or TV show not found in TMDb.');
    }
    
    const contentId = searchResult.id;
    const mediaType = searchResult.media_type;

    const detailParams = {
      api_key: API_KEY,
      append_to_response: 'credits,videos'
    };
    
    let details, credits, videos;

    const getTrailerUrl = (videos: any): string | undefined => {
        if (videos?.results) {
            // Prioritize "Official Trailer", then any "Trailer"
            const officialTrailer = videos.results.find((video: any) => video.site === 'YouTube' && video.type === 'Trailer' && video.official);
            if (officialTrailer) return `https://www.youtube.com/watch?v=${officialTrailer.key}`;

            const anyTrailer = videos.results.find((video: any) => video.site === 'YouTube' && video.type === 'Trailer');
            if (anyTrailer) return `https://www.youtube.com/watch?v=${anyTrailer.key}`;
            
            // Fallback to any "Teaser"
            const anyTeaser = videos.results.find((video: any) => video.site === 'YouTube' && video.type === 'Teaser');
            if (anyTeaser) return `https://www.youtube.com/watch?v=${anyTeaser.key}`;
        }
        return undefined;
    };

    if (mediaType === 'movie') {
        const movieResponse = await axios.get(`${API_BASE_URL}/movie/${contentId}`, { params: detailParams });
        details = movieResponse.data;
        credits = details.credits;
        videos = details.videos;

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

    } else if (mediaType === 'tv') {
        const tvResponse = await axios.get(`${API_BASE_URL}/tv/${contentId}`, { params: detailParams });
        details = tvResponse.data;
        credits = details.credits;
        videos = details.videos;
        
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
    } else {
         throw new Error('Unsupported media type found.');
    }

  } catch (error: any) {
    console.error('Error fetching from TMDb:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`TMDb API request failed: ${error.response.data?.status_message || error.message}`);
    }
    // Re-throw the original error if it's not from Axios
    throw error;
  }
};
