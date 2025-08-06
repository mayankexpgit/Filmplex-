
import { create } from 'zustand';
import type { Movie, Notification } from '@/lib/data';
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
  fetchNotifications as dbFetchNotifications,
  addNotification as dbAddNotification,
  deleteNotification as dbDeleteNotification,
} from '@/services/movieService';

// --- Types ---
export interface ContactInfo {
  telegramUrl: string;
  whatsappUrl: string;
  instagramUrl: string;
  email: string;
  whatsappNumber: string;
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
  selectedGenre: string;
  
  // Admin Data
  contactInfo: ContactInfo;
  suggestions: Suggestion[];
  securityLogs: SecurityLog[];
  notifications: Notification[];

  // Initialization
  isInitialized: boolean;

  // Actions (only state setters)
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string) => void;
  setState: (state: Partial<MovieState>) => void;
}

// =================================================================
// 1. ZUSTAND STORE DEFINITION
// =================================================================
export const useMovieStore = create<MovieState>((set) => ({
  // --- Initial State ---
  featuredMovies: [],
  latestReleases: [],
  searchQuery: '',
  selectedGenre: 'All Genres',
  contactInfo: { telegramUrl: '', whatsappUrl: '', instagramUrl: '', email: '', whatsappNumber: '' },
  suggestions: [],
  securityLogs: [],
  notifications: [],
  isInitialized: false,

  // --- Actions ---
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedGenre: (genre: string) => set({ selectedGenre: genre }),
  setState: (state: Partial<MovieState>) => set(state),
}));


// =================================================================
// 2. ASYNCHRONOUS ACTION FUNCTIONS
// =================================================================

let isFetchingMovies = false;
export const fetchMovieData = async (): Promise<void> => {
  const { isInitialized } = useMovieStore.getState();
  if (isInitialized || isFetchingMovies) {
    return;
  }
  isFetchingMovies = true;
  try {
    const [allMovies, notifications, contactInfo] = await Promise.all([
        dbFetchMovies(),
        dbFetchNotifications(),
        dbFetchContactInfo(),
    ]);
    
    useMovieStore.setState({
      featuredMovies: allMovies.filter(movie => movie.isFeatured),
      latestReleases: allMovies,
      notifications,
      contactInfo,
      isInitialized: true,
    });
  } catch (error) {
    console.error("Failed to fetch movie data:", error);
    // Even if it fails, set initialized to true to prevent infinite loading state.
    useMovieStore.setState({ isInitialized: true });
  } finally {
    isFetchingMovies = false;
  }
};


let isFetchingAdmin = false;
export const fetchAdminData = async (): Promise<void> => {
   if (isFetchingAdmin) {
    return;
  }
  isFetchingAdmin = true;
  try {
     const [contactInfo, suggestions, securityLogs, allMovies, notifications] = await Promise.all([
      dbFetchContactInfo(),
      dbFetchSuggestions(),
      dbFetchSecurityLogs(),
      dbFetchMovies(), // Also fetch movies to ensure admin lists are up to date
      dbFetchNotifications(),
    ]);

    useMovieStore.setState({
      contactInfo,
      suggestions,
      securityLogs,
      notifications,
      featuredMovies: allMovies.filter(movie => movie.isFeatured),
      latestReleases: allMovies,
      isInitialized: true, // Also set initialized here for admin pages
    });
  } catch (error) {
    console.error("Failed to fetch admin data:", error);
     useMovieStore.setState({ isInitialized: true });
  } finally {
    isFetchingAdmin = false;
  }
};

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
    // Directly update the store without reading previous state in a complex way
    const existingLogs = useMovieStore.getState().securityLogs;
    useMovieStore.setState({ securityLogs: [{ id, ...newLog }, ...existingLogs] });
};

/**
 * Adds a new movie to the database and refreshes the movie list.
 */
export const addMovie = async (movieData: Omit<Movie, 'id'>): Promise<void> => {
  await dbAddMovie(movieData);
  await addSecurityLog(`Uploaded Movie: "${movieData.title}"`);
  const allMovies = await dbFetchMovies();
  useMovieStore.setState({
    featuredMovies: allMovies.filter(movie => movie.isFeatured),
    latestReleases: allMovies,
  });
};

/**
 * Updates an existing movie in the database and refreshes the movie list.
 */
export const updateMovie = async (id: string, updatedMovie: Partial<Movie>): Promise<void> => {
  await dbUpdateMovie(id, updatedMovie);
  
  const movieTitle = updatedMovie.title || useMovieStore.getState().featuredMovies.find(m => m.id === id)?.title || useMovieStore.getState().latestReleases.find(m => m.id === id)?.title || 'Unknown Movie';
  
  if (Object.keys(updatedMovie).length === 1 && 'isFeatured' in updatedMovie) {
     await addSecurityLog(`Updated featured status for: "${movieTitle}"`);
  } else {
    await addSecurityLog(`Updated Movie: "${movieTitle}"`);
  }
  
  const allMovies = await dbFetchMovies();
  useMovieStore.setState({
    featuredMovies: allMovies.filter(movie => movie.isFeatured),
    latestReleases: allMovies,
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
      featuredMovies: allMovies.filter(movie => movie.isFeatured),
      latestReleases: allMovies,
    });
  }
};

/**
 * Updates the contact information.
 */
export const updateContactInfo = async (info: ContactInfo): Promise<void> => {
  await dbUpdateContactInfo(info);
  useMovieStore.setState({ contactInfo: info });
  await addSecurityLog('Updated Help Center Info');
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

// --- Notification Actions ---
/**
 * Adds a new notification.
 */
export const addNotification = async (notificationData: Omit<Notification, 'id'>): Promise<void> => {
    const id = await dbAddNotification(notificationData);
    await addSecurityLog(`Added upcoming notification for: "${notificationData.movieTitle}"`);
    useMovieStore.setState((state) => ({
        notifications: [{ ...notificationData, id }, ...state.notifications],
    }));
};

/**
 * Deletes a notification.
 */
export const deleteNotification = async (id: string): Promise<void> => {
    await dbDeleteNotification(id);
    await addSecurityLog(`Deleted Notification ID: ${id}`);
    useMovieStore.setState((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
    }));
};
