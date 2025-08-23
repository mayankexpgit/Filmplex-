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
}

export const fetchMovieDetailsFromTMDb = async (title: string, year?: number): Promise<FormattedTMDbData> => {
  if (!API_KEY) {
    throw new Error('TMDb API key is not configured.');
  }

  try {
    // 1. Search for the movie to get its ID
    const searchParams = {
      api_key: API_KEY,
      query: title,
      ...(year && { year: year }),
    };
    const searchResponse = await axios.get(`${API_BASE_URL}/search/movie`, { params: searchParams });

    if (searchResponse.data.results.length === 0) {
      throw new Error('Movie not found in TMDb.');
    }
    const movieResult = searchResponse.data.results[0];
    const movieId = movieResult.id;

    // 2. Fetch movie details by ID
    const detailParams = {
      api_key: API_KEY,
    };
    const detailsResponse = await axios.get(`${API_BASE_URL}/movie/${movieId}`, { params: detailParams });
    const movieDetails = detailsResponse.data;

    // 3. Fetch credits (cast and crew) by ID
    const creditsResponse = await axios.get(`${API_BASE_URL}/movie/${movieId}/credits`, { params: detailParams });
    const credits = creditsResponse.data;

    // 4. Find the director from the crew
    const director = credits.crew.find((member: any) => member.job === 'Director');

    // 5. Get top 3 actors
    const topActors = credits.cast.slice(0, 3).map((actor: any) => actor.name);

    return {
      title: movieDetails.title,
      year: new Date(movieDetails.release_date).getFullYear(),
      genre: movieDetails.genres.map((g: any) => g.name).join(', '),
      creator: director ? director.name : 'N/A',
      stars: topActors.join(', '),
      synopsis: movieDetails.overview,
      imdbRating: parseFloat(movieDetails.vote_average.toFixed(1)) || 0,
      posterUrl: movieDetails.poster_path ? `${IMAGE_BASE_URL}${movieDetails.poster_path}` : '',
    };
  } catch (error: any) {
    console.error('Error fetching from TMDb:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`TMDb API request failed: ${error.response.data?.status_message || error.message}`);
    }
    throw error;
  }
};
