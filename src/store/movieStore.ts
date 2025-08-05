
import { create } from 'zustand';
import type { Movie } from '@/lib/data';
import {
  addMovie as dbAddMovie,
  updateMovie as dbUpdateMovie,
  deleteMovie as dbDeleteMovie,
  fetchMovies as dbFetchMovies,
  fetchContactInfo as dbFetchContactInfo,
  updateContactInfo as dbUpdateContactInfo,
  fetchSuggestions as dbFetchSuggestions,
  deleteSuggestion as dbDeleteSuggestion,
  fetchSecurityLogs as dbFetchSecurityLogs,
  addSecurityLog as dbAddSecurityLog,
} from '@/services/movieService';

// --- Types ---
export interface ContactInfo {
  email: string;
  message: string;
}

export interface Suggestion {
  id: string;
  user: string;
  suggestion: string;
  date: string;
}

export interface SecurityLog {
  id: string;
  admin: string;
  action: string;
  timestamp: string;
}

interface MovieState {
  // Movies
  featuredMovies: Movie[];
  latestReleases: Movie[];
  searchQuery: string;
  
  // Admin Data
  contactInfo: ContactInfo;
  suggestions: Suggestion[];
  securityLogs: SecurityLog[];

  // Initialization
  isInitialized: boolean;

  // Actions (only state setters)
  setSearchQuery: (query: string) => void;
  setState: (state: Partial<MovieState>) => void;
}

// =================================================================
// 1. ZUSTAND STORE DEFINITION
// The store is now only responsible for holding state.
// =================================================================
export const useMovieStore = create<MovieState>((set) => ({
  // --- Initial State ---
  featuredMovies: [],
  latestReleases: [],
  searchQuery: '',
  contactInfo: { email: '', message: '' },
  suggestions: [],
  securityLogs: [],
  isInitialized: false,

  // --- Actions ---
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setState: (state: Partial<MovieState>) => set(state),
}));


// =================================================================
// 2. ASYNCHRONOUS ACTION FUNCTIONS
// These orchestrate data fetching and update the store.
// They are now called centrally from layouts.
// =================================================================

/**
 * Adds a security log entry.
 */
const addSecurityLog = async (action: string): Promise<void> => {
    const newLog = {
        admin: 'admin_user', // Placeholder
        action,
        timestamp: new Date().toLocaleString(),
    };
    const id = await dbAddSecurityLog(newLog);
    useMovieStore.setState((state) => ({
        securityLogs: [{ id, ...newLog }, ...state.securityLogs],
    }));
};

/**
 * Fetches ALL data for the application from Firestore and updates the store.
 * This function should be called once from a high-level layout component.
 */
let isFetching = false;
export const fetchInitialData = async (): Promise<void> => {
  // Prevent re-fetching if already initialized or a fetch is in progress
  if (useMovieStore.getState().isInitialized || isFetching) {
    return;
  }
  
  isFetching = true;

  try {
    const [allMovies, contactInfo, suggestions, securityLogs] = await Promise.all([
      dbFetchMovies(),
      dbFetchContactInfo(),
      dbFetchSuggestions(),
      dbFetchSecurityLogs(),
    ]);

    useMovieStore.setState({
      featuredMovies: allMovies.filter((m) => m.isFeatured),
      latestReleases: allMovies.filter((m) => !m.isFeatured),
      contactInfo,
      suggestions,
      securityLogs,
      isInitialized: true,
    });
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    useMovieStore.setState({ isInitialized: true }); // Still set to true to unblock UI
  } finally {
    isFetching = false;
  }
};

/**
 * Adds a new movie to the database and refreshes the movie list.
 */
export const addMovie = async (movieData: Omit<Movie, 'id'>): Promise<void> => {
  await dbAddMovie(movieData);
  await addSecurityLog(`Uploaded Movie: "${movieData.title}"`);
  const allMovies = await dbFetchMovies();
  useMovieStore.setState({
    featuredMovies: allMovies.filter((m) => m.isFeatured),
    latestReleases: allMovies.filter((m) => !m.isFeatured),
  });
};

/**
 * Updates an existing movie in the database and refreshes the movie list.
 */
export const updateMovie = async (id: string, updatedMovie: Partial<Movie>): Promise<void> => {
  await dbUpdateMovie(id, updatedMovie);
  
  const movieTitle = updatedMovie.title || [...useMovieStore.getState().featuredMovies, ...useMovieStore.getState().latestReleases].find(m => m.id === id)?.title || 'Unknown Movie';
  
  if (updatedMovie.posterUrl) {
    await addSecurityLog(`Updated Movie poster for: "${movieTitle}"`);
  } else {
    await addSecurityLog(`Updated Movie: "${movieTitle}"`);
  }
  
  const allMovies = await dbFetchMovies();
  useMovieStore.setState({
    featuredMovies: allMovies.filter((m) => m.isFeatured),
    latestReleases: allMovies.filter((m) => !m.isFeatured),
  });
};

/**
 * Deletes a movie from the database and refreshes the movie list.
 */
export const deleteMovie = async (id: string): Promise<void> => {
  const movies = [...useMovieStore.getState().latestReleases, ...useMovieStore.getState().featuredMovies];
  const movie = movies.find(m => m.id === id);
  if (movie) {
    await dbDeleteMovie(id);
    await addSecurityLog(`Deleted Movie: "${movie.title}"`);
    const allMovies = await dbFetchMovies();
    useMovieStore.setState({
      featuredMovies: allMovies.filter((m) => m.isFeatured),
      latestReleases: allMovies.filter((m) => !m.isFeatured),
    });
  }
};

/**
 * Updates the contact information.
 */
export const updateContactInfo = async (info: ContactInfo): Promise<void> => {
  await dbUpdateContactInfo(info);
  useMovieStore.setState({ contactInfo: info });
  await addSecurityLog('Updated Contact Info');
};

/**
 * Deletes a suggestion from the database.
 */
export const deleteSuggestion = async (id: string): Promise<void> => {
  await dbDeleteSuggestion(id);
  await addSecurityLog(`Deleted Suggestion ID: ${id}`);
  useMovieStore.setState((state) => ({
    suggestions: state.suggestions.filter((s) => s.id !== id)
  }));
};
