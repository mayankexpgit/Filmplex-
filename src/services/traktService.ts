
import axios from 'axios';

const TRAKT_API_KEY = process.env.TRAKT_API_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY; 
const TRAKT_API_BASE_URL = 'https://api.trakt.tv';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface FormattedTraktData {
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

// Fetches poster URL from TMDb using the IMDb ID from Trakt
const getPosterFromTMDb = async (imdbId: string): Promise<string> => {
    if (!TMDB_API_KEY || !imdbId) {
        return '';
    }
    try {
        const findResponse = await axios.get(`https://api.themoviedb.org/3/find/${imdbId}`, {
            params: {
                api_key: TMDB_API_KEY,
                external_source: 'imdb_id'
            }
        });
        const movieResult = findResponse.data.movie_results[0];
        if (movieResult && movieResult.poster_path) {
            return `${TMDB_IMAGE_BASE_URL}${movieResult.poster_path}`;
        }
        return '';
    } catch (error) {
        console.error('Error fetching poster from TMDb:', error);
        return '';
    }
};

export const fetchMovieDetailsFromTrakt = async (title: string, year?: number): Promise<FormattedTraktData> => {
  if (!TRAKT_API_KEY) {
    throw new Error('Trakt.tv API key is not configured.');
  }

  const normalizedTitle = title.trim().toLowerCase();

  try {
    // Step 1: Search for the movie on Trakt.tv
    const searchResponse = await axios.get(`${TRAKT_API_BASE_URL}/search/movie`, {
        params: {
            query: normalizedTitle,
            fields: 'title',
            limit: 5 // Get a few results to find the best match
        },
        headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': TRAKT_API_KEY
        }
    });

    if (!searchResponse.data || searchResponse.data.length === 0) {
        throw new Error('Movie not found on Trakt.tv.');
    }
    
    // Find the best match - either by year or the first result
    const searchResult = 
        searchResponse.data.find((item: any) => item.movie.year === year) || 
        searchResponse.data[0];

    const movieSlug = searchResult.movie.ids.slug;

    // Step 2: Get detailed information for the matched movie
    const detailsResponse = await axios.get(`${TRAKT_API_BASE_URL}/movies/${movieSlug}`, {
        params: {
            extended: 'full,people'
        },
        headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': TRAKT_API_KEY
        }
    });

    const details = detailsResponse.data;
    
    // Step 3: Get poster from TMDb
    const imdbId = details.ids.imdb;
    const posterUrl = await getPosterFromTMDb(imdbId);
    
    // Step 4: Format the data, with checks for missing 'people' data
    const people = details.people;
    let directors: string[] = [];
    let actors: string[] = [];

    if (people) {
        directors = people.directing?.map((p: any) => p.person.name) || [];
        actors = people.cast?.slice(0, 3).map((p: any) => p.person.name) || [];
    }

    return {
        title: details.title,
        year: details.year,
        genre: details.genres.map((g: string) => g.charAt(0).toUpperCase() + g.slice(1)).join(', '),
        creator: directors.join(', ') || 'N/A',
        stars: actors.join(', ') || 'N/A',
        synopsis: details.overview || 'No synopsis available.',
        imdbRating: parseFloat(details.rating?.toFixed(1)) || 0,
        posterUrl: posterUrl,
        trailerUrl: details.trailer,
    };

  } catch (error: any) {
    console.error('Error fetching from Trakt.tv:', error.message);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Trakt.tv API Error: ${error.response.data?.error_description || error.message}`);
    }
    // Re-throw our custom or other errors
    throw error;
  }
};
