
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { featuredMovies as initialFeatured, latestReleases as initialLatest, type Movie } from '@/lib/data';

// --- Types ---
interface ContactInfo {
  email: string;
  message: string;
}

interface Suggestion {
  id: number;
  user: string;
  suggestion: string;
  date: string;
}

interface SecurityLog {
  id: number;
  admin: string;
  action: string;
  timestamp: string;
}

// --- Initial Data ---
const initialSuggestions: Suggestion[] = [
  { id: 1, user: 'Cinephile123', suggestion: 'Please add The Matrix in 4K!', date: '2024-07-28' },
  { id: 2, user: 'ActionFan', suggestion: 'More action movies like John Wick would be great.', date: '2024-07-27' },
  { id: 3, user: 'AnimeWatcher', suggestion: 'Can we get more anime films? Your Name was amazing.', date: '2024-07-26' },
  { id: 4, user: 'ClassicLover', suggestion: 'Requesting classic mob movies.', date: '2024-07-25' },
];

const initialSecurityLogs: SecurityLog[] = [
  { id: 1, admin: 'admin_john', action: 'Uploaded Movie: "Chrono Rift"', timestamp: '2024-07-28 10:00 AM' },
  { id: 2, admin: 'admin_jane', action: 'Updated Contact Info', timestamp: '2024-07-28 09:30 AM' },
];


interface AdminState {
  // Movies
  featuredMovies: Movie[];
  latestReleases: Movie[];
  isLoadingFeatured: boolean;
  isLoadingLatest: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addMovie: (movie: Movie) => void;
  updateMovie: (id: string, updatedMovie: Partial<Movie>) => void;
  deleteMovie: (id: string) => void;
  fetchHomepageData: () => void;
  isInitialized: boolean;

  // Contact Info
  contactInfo: ContactInfo;
  updateContactInfo: (info: ContactInfo) => void;

  // Suggestions
  suggestions: Suggestion[];
  deleteSuggestion: (id: number) => void;

  // Security Logs
  securityLogs: SecurityLog[];
  addSecurityLog: (action: string) => void;
}

export const useMovieStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      featuredMovies: [],
      latestReleases: [],
      isLoadingFeatured: true,
      isLoadingLatest: true,
      searchQuery: '',
      isInitialized: false,
      contactInfo: {
        email: 'admin@filmplex.com',
        message: 'For any queries, please reach out to us.',
      },
      suggestions: initialSuggestions,
      securityLogs: initialSecurityLogs,

      // --- Actions ---
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      addMovie: (movie: Movie) => {
        set((state) => ({
          latestReleases: [movie, ...state.latestReleases],
        }));
        get().addSecurityLog(`Uploaded Movie: "${movie.title}"`);
      },

      updateMovie: (id: string, updatedMovie: Partial<Movie>) => {
        set((state) => ({
          latestReleases: state.latestReleases.map((movie) =>
            movie.id === id ? { ...movie, ...updatedMovie } : movie
          ),
          featuredMovies: state.featuredMovies.map((movie) =>
            movie.id === id ? { ...movie, ...updatedMovie } : movie
          ),
        }));
      },

      deleteMovie: (id: string) => {
        const movie = get().latestReleases.find(m => m.id === id) || get().featuredMovies.find(m => m.id === id);
        set((state) => ({
          latestReleases: state.latestReleases.filter((movie) => movie.id !== id),
          featuredMovies: state.featuredMovies.filter((movie) => movie.id !== id),
        }));
        if (movie) {
            get().addSecurityLog(`Deleted Movie: "${movie.title}"`);
        }
      },

      fetchHomepageData: () => {
        if (!get().isInitialized) {
            set({
                featuredMovies: initialFeatured,
                latestReleases: initialLatest,
                isLoadingFeatured: false,
                isLoadingLatest: false,
            });
        } else {
             set({
                isLoadingFeatured: false,
                isLoadingLatest: false,
            });
        }
      },

      updateContactInfo: (info: ContactInfo) => {
        set({ contactInfo: info });
        get().addSecurityLog('Updated Contact Info');
      },

      deleteSuggestion: (id: number) => {
        set((state) => ({
          suggestions: state.suggestions.filter((s) => s.id !== id)
        }));
        get().addSecurityLog(`Deleted Suggestion ID: ${id}`);
      },
      
      addSecurityLog: (action: string) => {
        set((state) => ({
          securityLogs: [
            {
              id: state.securityLogs.length + 1,
              admin: 'admin_user', // Placeholder for admin user
              action,
              timestamp: new Date().toLocaleString(),
            },
            ...state.securityLogs,
          ]
        }));
      },
    }),
    {
      name: 'admin-storage', // unique name for the localStorage key
      storage: createJSONStorage(() => localStorage),
      onRehydrate: () => {
        useMovieStore.setState({ isInitialized: true, isLoadingFeatured: false, isLoadingLatest: false });
      }
    }
  )
);

// Trigger the initial fetch/hydration check
useMovieStore.getState().fetchHomepageData();
