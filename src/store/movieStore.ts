
import { create } from 'zustand';
import type { Movie } from '@/lib/data';
import {
  addMovie as dbAddMovie,
  updateMovie as dbUpdateMovie,
  deleteMovie as dbDeleteMovie,
  fetchMovies as dbFetchMovies,
  fetchContactInfo,
  updateContactInfo as dbUpdateContactInfo,
  fetchSuggestions,
  deleteSuggestion as dbDeleteSuggestion,
  fetchSecurityLogs,
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
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<void>;
  updateMovie: (id: string, updatedMovie: Partial<Movie>) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
  fetchHomepageData: () => Promise<void>;

  // Contact Info
  contactInfo: ContactInfo;
  updateContactInfo: (info: ContactInfo) => Promise<void>;

  // Suggestions
  suggestions: Suggestion[];
  deleteSuggestion: (id: string) => Promise<void>;

  // Security Logs
  securityLogs: SecurityLog[];
  addSecurityLog: (action: string) => Promise<void>;

  // Initialization
  isInitialized: boolean;
  fetchAllAdminData: () => Promise<void>;
}

export const useMovieStore = create<MovieState>((set, get) => ({
      // --- Initial State ---
      featuredMovies: [],
      latestReleases: [],
      isLoading: true,
      searchQuery: '',
      contactInfo: {
        email: 'loading@filmplex.com',
        message: 'Loading contact information...',
      },
      suggestions: [],
      securityLogs: [],
      isInitialized: false,

      // --- Actions ---
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      addMovie: async (movieData: Omit<Movie, 'id'>) => {
        await dbAddMovie(movieData);
        await get().fetchHomepageData();
        await get().addSecurityLog(`Uploaded Movie: "${movieData.title}"`);
      },

      updateMovie: async (id: string, updatedMovie: Partial<Movie>) => {
        const movies = [...get().featuredMovies, ...get().latestReleases];
        const movie = movies.find((m) => m.id === id);
        const title = updatedMovie.title || movie?.title;
        
        await dbUpdateMovie(id, updatedMovie);
        await get().fetchHomepageData();
        if (title) {
          await get().addSecurityLog(`Updated Movie: "${title}"`);
        }
      },

      deleteMovie: async (id: string) => {
        const movie = [...get().latestReleases, ...get().featuredMovies].find(m => m.id === id);
        if (movie) {
            await dbDeleteMovie(id);
            await get().fetchHomepageData();
            await get().addSecurityLog(`Deleted Movie: "${movie.title}"`);
        }
      },

      fetchHomepageData: async () => {
        set({ isLoading: true });
        const allMovies = await dbFetchMovies();
        set({
          featuredMovies: allMovies.filter((m) => m.isFeatured),
          latestReleases: allMovies.filter((m) => !m.isFeatured),
          isLoading: false,
          isInitialized: true,
        });
      },

      updateContactInfo: async (info: ContactInfo) => {
        await dbUpdateContactInfo(info);
        set({ contactInfo: info });
        await get().addSecurityLog('Updated Contact Info');
      },

      deleteSuggestion: async (id: string) => {
        await dbDeleteSuggestion(id);
        set((state) => ({
          suggestions: state.suggestions.filter((s) => s.id !== id)
        }));
        await get().addSecurityLog(`Deleted Suggestion ID: ${id}`);
      },
      
      addSecurityLog: async (action: string) => {
        const newLog = {
          admin: 'admin_user', // Placeholder
          action,
          timestamp: new Date().toLocaleString(),
        };
        const id = await dbAddSecurityLog(newLog);
        set((state) => ({
          securityLogs: [{ id, ...newLog }, ...state.securityLogs],
        }));
      },

      fetchAllAdminData: async () => {
        set({isLoading: true});
        const [contactInfo, suggestions, securityLogs] = await Promise.all([
          fetchContactInfo(),
          fetchSuggestions(),
          fetchSecurityLogs()
        ]);
        set({
          contactInfo,
          suggestions,
          securityLogs,
          isLoading: false,
        })
      }
    })
);
