import axios from 'axios';

const API_KEY = process.env.OMDB_API_KEY;
const API_URL = 'https://www.omdbapi.com/';

interface OMDbResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: { Source: string; Value: string }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: 'True' | 'False';
  Error?: string;
}

export interface FormattedOMDbData {
  title: string;
  year: number;
  genre: string;
  creator: string;
  stars: string;
  synopsis: string;
  imdbRating: number;
  posterUrl: string;
}

export const fetchMovieDetailsFromOMDb = async (title: string, year?: number): Promise<FormattedOMDbData> => {
  if (!API_KEY) {
    throw new Error('OMDb API key is not configured.');
  }

  try {
    const params: { t: string; y?: number; apikey: string, plot: 'full' } = {
      t: title,
      apikey: API_KEY,
      plot: 'full'
    };
    if (year) {
      params.y = year;
    }

    const response = await axios.get<OMDbResponse>(API_URL, { params });

    if (response.data.Response === 'False') {
      throw new Error(response.data.Error || 'Movie not found in OMDb.');
    }

    const data = response.data;

    return {
      title: data.Title,
      year: parseInt(data.Year, 10),
      genre: data.Genre,
      creator: data.Director,
      stars: data.Actors,
      synopsis: data.Plot,
      imdbRating: parseFloat(data.imdbRating) || 0,
      posterUrl: data.Poster !== 'N/A' ? data.Poster : '',
    };
  } catch (error: any) {
    console.error('Error fetching from OMDb:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`OMDb API request failed: ${error.response?.data?.Error || error.message}`);
    }
    throw error;
  }
};
