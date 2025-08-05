
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { featuredMovies as initialFeatured, latestReleases as initialLatest, type Movie } from '@/lib/data';
import { useEffect } from 'react';

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

// --- LocalStorage Check for SSR ---
const isServer = typeof window === 'undefined';

// Dummy storage for server-side
const noopStorage: StateStorage = {
  getItem: (_key) => Promise.resolve(null),
  setItem: (_key, _value) => Promise.resolve(),
  removeItem: (_key) => Promise.resolve(),
};

const storage: StateStorage = isServer ? noopStorage : localStorage;


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
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;

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
      _hasHydrated: false,
      setHasHydrated: (hydrated) => {
        set({ _hasHydrated: hydrated });
      },
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
        const state = get();
        // Only initialize with default data if the store isn't already rehydrated
        // and has no data
        if (!state.isInitialized && state.featuredMovies.length === 0 && state.latestReleases.length === 0) {
            set({
                featuredMovies: initialFeatured,
                latestReleases: initialLatest,
            });
        }
        set({
            isLoadingFeatured: false,
            isLoadingLatest: false,
            isInitialized: true,
        });
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
      storage: createJSONStorage(() => storage),
      onRehydrate: (state) => {
        if (state) {
            state.isInitialized = true;
        }
      },
      // Skip hydration on server
      skipHydration: true,
    }
  )
);

export const useHydratedMovieStore = () => {
  const store = useMovieStore();
  
  useEffect(() => {
    useMovieStore.persist.rehydrate();
  }, []);

  return store;
};

// Trigger the initial fetch/hydration check only on the client
if (!isServer) {
    useMovieStore.getState().fetchHomepageData();
}
