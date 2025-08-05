
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
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<void>;
  updateMovie: (id: string, updatedMovie: Partial<Movie>) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
  
  // Contact Info
  contactInfo: ContactInfo;
  updateContactInfo: (info: ContactInfo) => Promise<void>;

  // Suggestions
  suggestions: Suggestion[];
  deleteSuggestion: (id: string) => Promise<void>;

  // Security Logs
  securityLogs: SecurityLog[];
  addSecurityLog: (action: string) => Promise<void>;

  // Initialization and Loading
  isLoading: boolean;
  isInitialized: boolean;
  fetchInitialData: () => Promise<void>;
  fetchAllAdminData: () => Promise<void>; // Kept for targeted admin refresh if needed
}

export const useMovieStore = create<MovieState>((set, get) => ({
      // --- Initial State ---
      featuredMovies: [],
      latestReleases: [],
      isLoading: true, // Start in loading state until initial fetch is complete
      isInitialized: false, // This will be true only once the first fetch succeeds
      searchQuery: '',
      contactInfo: {
        email: '',
        message: '',
      },
      suggestions: [],
      securityLogs: [],

      // --- Actions ---
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      addMovie: async (movieData: Omit<Movie, 'id'>) => {
        await dbAddMovie(movieData);
        await get().addSecurityLog(`Uploaded Movie: "${movieData.title}"`);
        const allMovies = await dbFetchMovies();
        set({
          featuredMovies: allMovies.filter((m) => m.isFeatured),
          latestReleases: allMovies.filter((m) => !m.isFeatured),
        });
      },

      updateMovie: async (id: string, updatedMovie: Partial<Movie>) => {
        await dbUpdateMovie(id, updatedMovie);
        if (updatedMovie.title) {
          await get().addSecurityLog(`Updated Movie: "${updatedMovie.title}"`);
        } else {
           const movies = [...get().featuredMovies, ...get().latestReleases];
           const movie = movies.find((m) => m.id === id);
           if (movie) {
              await get().addSecurityLog(`Updated Movie poster for: "${movie.title}"`);
           }
        }
        const allMovies = await dbFetchMovies();
        set({
          featuredMovies: allMovies.filter((m) => m.isFeatured),
          latestReleases: allMovies.filter((m) => !m.isFeatured),
        });
      },

      deleteMovie: async (id: string) => {
        const movie = [...get().latestReleases, ...get().featuredMovies].find(m => m.id === id);
        if (movie) {
            await dbDeleteMovie(id);
            await get().addSecurityLog(`Deleted Movie: "${movie.title}"`);
            const allMovies = await dbFetchMovies();
            set({
              featuredMovies: allMovies.filter((m) => m.isFeatured),
              latestReleases: allMovies.filter((m) => !m.isFeatured),
            });
        }
      },
      
      updateContactInfo: async (info: ContactInfo) => {
        await dbUpdateContactInfo(info);
        set({ contactInfo: info });
        await get().addSecurityLog('Updated Contact Info');
      },

      deleteSuggestion: async (id: string) => {
        await dbDeleteSuggestion(id);
        await get().addSecurityLog(`Deleted Suggestion ID: ${id}`);
        set((state) => ({
          suggestions: state.suggestions.filter((s) => s.id !== id)
        }));
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
          const [contactInfo, suggestions, securityLogs] = await Promise.all([
              fetchContactInfo(),
              fetchSuggestions(),
              fetchSecurityLogs()
          ]);
          set({
              contactInfo,
              suggestions,
              securityLogs,
          });
      },

      fetchInitialData: async () => {
        if (get().isInitialized) return; // Prevent re-fetching if already initialized
        
        set({ isLoading: true });
        
        try {
          // Fetch movies and admin data in parallel for efficiency
          const [allMovies, _] = await Promise.all([
            dbFetchMovies(),
            get().fetchAllAdminData()
          ]);
          
          set({
            featuredMovies: allMovies.filter((m) => m.isFeatured),
            latestReleases: allMovies.filter((m) => !m.isFeatured),
            isInitialized: true,
          });

        } catch (error) {
          console.error("Failed to fetch initial data:", error);
          // Handle error state if necessary
        } finally {
          set({ isLoading: false });
        }
      },
    })
);
